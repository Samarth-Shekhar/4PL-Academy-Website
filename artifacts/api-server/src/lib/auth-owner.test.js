import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canManageAdminProfiles } from './auth.js';

process.env.ADMIN_EMAIL = 'configured-owner@example.test';

test('the configured owner can manage admin profiles', () => {
  assert.equal(canManageAdminProfiles({ email: 'configured-owner@example.test' }), true);
  assert.equal(canManageAdminProfiles({ email: 'CONFIGURED-OWNER@example.test' }), true);
});

test('the explicitly authorized root admin can manage profiles', () => {
  assert.equal(canManageAdminProfiles({ email: 'root@4pl.com' }), true);
  assert.equal(canManageAdminProfiles({ email: 'ROOT@4PL.COM' }), true);
});

test('other administrators and unauthenticated requests cannot manage profiles', () => {
  assert.equal(canManageAdminProfiles({ email: 'other-admin@example.test' }), false);
  assert.equal(canManageAdminProfiles(null), false);
});
