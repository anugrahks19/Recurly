import test from 'node:test';
import assert from 'node:assert/strict';
import knex from 'knex';
import { up } from './migrations/001_initial.js';
import { up as upgrade } from './migrations/002_revenue_integrity.js';
import { up as addLines } from './migrations/003_subscription_lines.js';
import { up as productDiscounts } from './migrations/004_product_discounts.js';
import { up as razorpayCheckout } from './migrations/005_razorpay_checkout.js';
import { up as invoiceOrders } from './migrations/006_invoice_orders.js';

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

for (const client of ['pg','mysql2']) {
  test(`subscription line migration compiles for ${client}`,async()=>{
    const db=knex({client,connection:{}});
    await addLines({schema:{createTable:async(name,define)=>assert.ok(db.schema.createTable(name,define).toSQL().length)}});
    await db.destroy();
  });
}

for (const client of ['pg','mysql2']) {
  test(`integrity migration compiles for ${client}`,async()=>{
    const db=knex({client,connection:{}});
    const schema={
      createTable:async(name,define)=>{assert.ok(db.schema.createTable(name,define).toSQL().length);},
      alterTable:async(name,define)=>{assert.ok(db.schema.alterTable(name,define).toSQL().length);},
    };
    await upgrade({schema});
    await db.destroy();
  });
}

for(const client of ['pg','mysql2']) test(`product discount migration compiles for ${client}`,async()=>{
  const db=knex({client,connection:{}});
  await productDiscounts({schema:{alterTable:async(name,define)=>assert.ok(db.schema.alterTable(name,define).toSQL().length)}});
  await db.destroy();
});

for(const client of ['pg','mysql2']) test(`Razorpay checkout migration compiles for ${client}`,async()=>{
  const db=knex({client,connection:{}});
  await razorpayCheckout({schema:{alterTable:async(name,define)=>assert.ok(db.schema.alterTable(name,define).toSQL().length),createTable:async(name,define)=>assert.ok(db.schema.createTable(name,define).toSQL().length)}});
  await db.destroy();
});

for(const client of ['pg','mysql2']) test(`invoice orders migration compiles for ${client}`,async()=>{
  const db=knex({client,connection:{}});
  await invoiceOrders({schema:{createTable:async(name,define)=>assert.ok(db.schema.createTable(name,define).toSQL().length)},fn:db.fn});
  await db.destroy();
});
