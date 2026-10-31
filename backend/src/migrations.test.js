import test from 'node:test';
import assert from 'node:assert/strict';
import knex from 'knex';
import { up } from './migrations/001_initial.js';

for (const client of ['pg','mysql2']) {
  test(`initial migration compiles for ${client}`, async () => {
    const db=knex({client,connection:{}});
    const tables=[];
    await up({schema:{createTable:async (name,define) => {
      const sql=db.schema.createTable(name,define).toSQL();
      assert.ok(sql.length>0);
      tables.push(name);
    }}});
    assert.ok(tables.includes('users'));
    assert.ok(tables.includes('invoices'));
    assert.ok(tables.includes('audit_logs'));
    await db.destroy();
  });
}
