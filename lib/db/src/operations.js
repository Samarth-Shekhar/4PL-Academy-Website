import { eq } from 'drizzle-orm';

export function isUniqueViolation(error) {
  for (let current = error; current; current = current.cause) {
    if (['23505', 'ER_DUP_ENTRY'].includes(current.code)) return true;
  }
  return false;
}

// MySQL has no INSERT/UPDATE/DELETE RETURNING. Lock and re-read within the
// same transaction instead of emulating it with an unsafe unlocked read.
export function createRowOperations(db, dialect) {
  async function insertRow(table, values, { ignoreConflict = false } = {}) {
    if (dialect === 'postgresql') {
      let query = db.insert(table).values(values);
      if (ignoreConflict) query = query.onConflictDoNothing();
      return (await query.returning())[0];
    }
    try {
      return await db.transaction(async (tx) => {
        const [result] = await tx.insert(table).values(values);
        const id = values.id ?? result.insertId;
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) throw new Error('Database did not return a valid inserted ID.');
        return (await tx.select().from(table).where(eq(table.id, Number(id))).limit(1))[0];
      });
    } catch (error) {
      if (ignoreConflict && isUniqueViolation(error)) return undefined;
      throw error;
    }
  }
  async function updateRow(table, condition, values) {
    if (dialect === 'postgresql') return (await db.update(table).set(values).where(condition).returning())[0];
    return db.transaction(async (tx) => {
      const [existing] = await tx.select().from(table).where(condition).limit(1).for('update');
      if (!existing) return undefined;
      await tx.update(table).set(values).where(eq(table.id, existing.id));
      return (await tx.select().from(table).where(eq(table.id, existing.id)).limit(1))[0];
    });
  }
  async function deleteRow(table, condition) {
    if (dialect === 'postgresql') return (await db.delete(table).where(condition).returning())[0];
    return db.transaction(async (tx) => {
      const [existing] = await tx.select().from(table).where(condition).limit(1).for('update');
      if (!existing) return undefined;
      await tx.delete(table).where(eq(table.id, existing.id));
      return existing;
    });
  }
  return { insertRow, updateRow, deleteRow };
}
