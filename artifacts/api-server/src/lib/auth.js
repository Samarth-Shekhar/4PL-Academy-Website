import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { db, adminsTable, sessionsTable } from '@workspace/db';
import { eq, and, gt, lt } from 'drizzle-orm';
import { cookieSecure } from './config.js';
import { logger } from './log.js';

const scrypt = promisify(scryptCallback);
const cookieName = 'academy_session';
const cookieOptions = { httpOnly: true, secure: cookieSecure, sameSite: 'lax', path: '/api' };
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const [salt, hex] = stored.split(':');
  const hash = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, 'hex');
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}
export function isConfiguredOwner(admin) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(configuredEmail && admin?.email?.trim().toLowerCase() === configuredEmail);
}
const tokenHash = token => createHmac('sha256', process.env.SESSION_SECRET).update(token).digest('hex');
export async function initializeAdmin() {
  const existing = await db.select({ id: adminsTable.id }).from(adminsTable).limit(1);
  if (existing.length) return;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    logger.info('Admin initialization awaits ADMIN_EMAIL and ADMIN_PASSWORD configuration.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    logger.warn('Admin credentials do not meet email / minimum 12-character password requirements.');
    return;
  }
  await db.insert(adminsTable).values({ email: email.toLowerCase().trim(), passwordHash: await hashPassword(password) }).onConflictDoNothing();
  logger.info('Initial administrator created securely.');
}
export async function currentAdmin(req) {
  const token = req.cookies?.[cookieName];
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
  const rows = await db.select({ id: adminsTable.id, email: adminsTable.email, role: adminsTable.role }).from(sessionsTable)
    .innerJoin(adminsTable, eq(sessionsTable.adminId, adminsTable.id))
    .where(and(eq(sessionsTable.tokenHash, tokenHash(token)), gt(sessionsTable.expiresAt, new Date()))).limit(1);
  return rows[0] || null;
}
export async function requireAdmin(req, res, next) {
  const admin = await currentAdmin(req);
  if (!admin || admin.role !== 'admin') { res.status(401).json({ error: 'Please sign in as an administrator.' }); return; }
  req.admin = admin;
  res.set('Cache-Control', 'no-store');
  next();
}
export async function createSession(res, adminId) {
  const token = randomBytes(32).toString('hex');
  await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date()));
  await db.insert(sessionsTable).values({ tokenHash: tokenHash(token), adminId, expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) });
  res.cookie(cookieName, token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
}
export async function removeSession(req, res) {
  const token = req.cookies?.[cookieName];
  if (typeof token === 'string') await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, tokenHash(token)));
  res.clearCookie(cookieName, cookieOptions);
}
