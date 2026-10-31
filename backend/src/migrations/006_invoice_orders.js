export async function up(db) {
  await db.schema.createTable('invoice_orders',t=>{
    t.string('id',36).primary();
    t.string('invoice_id',36).notNullable().unique().references('id').inTable('invoices');
    t.string('customer_id',36).notNullable().references('id').inTable('users');
    t.string('razorpay_order_id',80).notNullable().unique();
    t.string('razorpay_payment_id',80).unique();
    t.integer('amount_cents').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
  });
}

export async function down(db) { await db.schema.dropTableIfExists('invoice_orders'); }
