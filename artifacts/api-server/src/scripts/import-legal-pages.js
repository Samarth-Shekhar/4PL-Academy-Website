import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { db, pool, contentTable } from '@workspace/db';
import { and, eq } from 'drizzle-orm';
import { logger } from '../lib/log.js';

const [termsPath, privacyPath] = process.argv.slice(2);
if (!termsPath || !privacyPath) {
  throw new Error('Usage: node src/scripts/import-legal-pages.js <terms-text-file> <privacy-text-file>');
}

const headings = new Set([
  'Definitions', 'Applicable terms and conditions', 'Log Files', 'Security Violations',
  'Return Rules', 'Refund Eligibility:', 'Refund Procedure:', 'Exceptions:', 'Contact Information',
]);
const formatPolicy = (text) => text.replace(/\r\n?/g, '\n').trim().split('\n')
  .map((line) => headings.has(line.trim()) ? `## ${line.trim()}\n` : line).join('\n');

const sources = [
  { slug: 'terms', name: 'Terms and Conditions', path: termsPath, summary: 'Terms and conditions for using the 4PL Academy website.' },
  { slug: 'privacy', name: 'Privacy Policy', path: privacyPath, summary: '4PL Academy privacy information and return and refund rules.' },
];

try {
  const policies = await Promise.all(sources.map(async (source) => ({
    ...source, description: formatPolicy(await readFile(resolve(source.path), 'utf8')),
  })));
  if (policies.some((policy) => !policy.description)) throw new Error('Policy files must not be empty.');
  await db.transaction(async (tx) => {
    for (const policy of policies) {
      const where = and(eq(contentTable.kind, 'pages'), eq(contentTable.slug, policy.slug));
      const [existing] = await tx.select().from(contentTable).where(where);
      const data = {
        ...(existing?.data || {}),
        description: policy.description,
        shortDescription: policy.summary,
        seoTitle: `${policy.name} | 4PL Academy`,
        seoDescription: policy.summary,
      };
      if (existing) {
        await tx.update(contentTable).set({ name: policy.name, status: 'published', data, updatedAt: new Date() }).where(where);
      } else {
        await tx.insert(contentTable).values({ kind: 'pages', slug: policy.slug, name: policy.name, status: 'published', data });
      }
    }
  });
  logger.info({ pages: policies.map((p) => p.slug) }, 'Imported complete owner-supplied legal policies');
} finally {
  await pool.end();
}
