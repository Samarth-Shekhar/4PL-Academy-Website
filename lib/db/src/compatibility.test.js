import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getTableColumns, eq, sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { MySqlDialect } from 'drizzle-orm/mysql-core';
import * as postgres from './schema/index.js';
import * as mysql from './mysql/index.js';
import { createExpressions } from './expressions.js';
import { isUniqueViolation } from './operations.js';

test('both schemas retain identical table columns and API field names', () => {
  for (const name of Object.keys(postgres)) {
    const columns = (table) => Object.entries(getTableColumns(table)).map(([key, column]) => [key, column.name, column.notNull]);
    assert.deepEqual(columns(mysql[name]), columns(postgres[name]), name);
  }
});
for (const [dialect, schema, renderer] of [
  ['postgresql', postgres, new PgDialect()],
  ['mysql', mysql, new MySqlDialect()],
]) {
  test(`${dialect} JSON search, relationship checks and media queries use bound values`, () => {
    const { jsonText, insensitiveLike, mediaReferences } = createExpressions(dialect);
    const injection = "' OR 1=1 -- 🤖";
    const expressions = [
      eq(jsonText(schema.contentTable.data, 'programId'), injection),
      insensitiveLike(jsonText(schema.contentTable.data, 'specialization'), injection),
      mediaReferences(schema.contentTable.data, injection),
    ];
    for (const expression of expressions) {
      const query = renderer.sqlToQuery(sql`${expression}`);
      assert.ok(query.params.includes(injection));
      assert.ok(!query.sql.includes(injection));
      if (dialect === 'mysql') assert.ok(!/\bilike\b|jsonb_array|::jsonb|->>/.test(query.sql));
    }
    assert.throws(() => jsonText(schema.contentTable.data, 'bad.key'), /Invalid JSON/);
  });
}
test('duplicate errors are recognized across drivers and wrapped query errors', () => {
  assert.equal(isUniqueViolation({ code: '23505' }), true);
  assert.equal(isUniqueViolation({ cause: { code: 'ER_DUP_ENTRY' } }), true);
  assert.equal(isUniqueViolation({ code: 'ER_BAD_NULL_ERROR' }), false);
});
