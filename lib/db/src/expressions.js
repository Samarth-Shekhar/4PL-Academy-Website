import { sql } from 'drizzle-orm';

export function createExpressions(dialect) {
  function jsonText(column, key) {
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(key)) throw new Error('Invalid JSON field name.');
    return dialect === 'mysql'
      ? sql`JSON_UNQUOTE(JSON_EXTRACT(${column}, ${`$.${key}`}))`
      : sql`${column}->>${key}`;
  }
  function insensitiveLike(value, pattern) {
    return sql`lower(${value}) like lower(${pattern})`;
  }
  function mediaReferences(column, objectPath) {
    if (dialect === 'mysql') return sql`(
      JSON_CONTAINS(JSON_EXTRACT(${column}, '$.items[*].image'), JSON_QUOTE(${objectPath}))
      or JSON_CONTAINS(JSON_EXTRACT(${column}, '$.media'), JSON_QUOTE(${objectPath}))
    )`;
    return sql`(
      exists (select 1 from jsonb_array_elements(
        case when jsonb_typeof(${column}->'items') = 'array'
          then ${column}->'items' else '[]'::jsonb end
      ) as story_item where story_item->>'image' = ${objectPath})
      or exists (select 1 from jsonb_array_elements_text(
        case when jsonb_typeof(${column}->'media') = 'array'
          then ${column}->'media' else '[]'::jsonb end
      ) as media_item where media_item = ${objectPath})
    )`;
  }
  return { jsonText, insensitiveLike, mediaReferences };
}
