import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDatabaseConfig } from './settings.js';

test('PostgreSQL remains the default and uses the existing managed URL', () => {
  const config = readDatabaseConfig({ DATABASE_URL: 'postgresql://example.test/academy' });
  assert.equal(config.dialect, 'postgresql');
  assert.equal(config.poolSize, 10);
});
test('MySQL never reuses a PostgreSQL URL or falls back to PostgreSQL', () => {
  assert.throws(() => readDatabaseConfig({ DB_DIALECT: 'mysql', DATABASE_URL: 'postgresql://example.test/academy' }), /DB_HOST/);
  assert.throws(() => readDatabaseConfig({ DB_DIALECT: 'mysql', DB_CONNECTION_URL: 'postgresql://example.test/academy' }), /does not match/);
});
test('custom URLs and individual settings support both engines', () => {
  for (const dialect of ['postgresql', 'mysql']) {
    const config = readDatabaseConfig({
      DB_DIALECT: dialect, DB_HOST: 'example.test', DB_NAME: 'academy',
      DB_USER: 'test', DB_PASSWORD: 'synthetic-only', DB_SSL: 'true',
    });
    assert.equal(config.connection.port, dialect === 'mysql' ? 3306 : 5432);
    assert.deepEqual(config.ssl, { rejectUnauthorized: true });
    assert.equal(readDatabaseConfig({ DB_DIALECT: dialect, DB_CONNECTION_URL: `${dialect}://example.test/academy` }).dialect, dialect);
  }
});
test('invalid configuration fails explicitly without leaking connection details', () => {
  assert.throws(() => readDatabaseConfig({ DB_DIALECT: 'sqlite' }), /DB_DIALECT/);
  assert.throws(() => readDatabaseConfig({ DB_POOL_SIZE: '0' }), /DB_POOL_SIZE/);
  assert.throws(() => readDatabaseConfig({ DB_SSL: 'maybe' }), /DB_SSL/);
  assert.throws(() => readDatabaseConfig({ DB_CONNECTION_URL: 'secret-not-a-url' }), (error) => !error.message.includes('secret-not-a-url'));
  assert.throws(() => readDatabaseConfig({ DB_HOST: 'localhost', DB_NAME: 'test', DB_USER: 'test', DB_PASSWORD: '', DB_PORT: '70000' }), /DB_PORT/);
});
