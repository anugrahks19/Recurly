export async function up(db) {
  await db.schema.alterTable('checkout_quotes',t=>{
    t.integer('quantity').notNullable().defaultTo(1);
    t.string('razorpay_order_id',80).unique();
    t.string('razorpay_payment_id',80).unique();
    t.string('subscription_id',36).references('id').inTable('subscriptions');
  });
  await db.schema.createTable('razorpay_events',t=>{
    t.string('event_id',120).primary();
    t.string('event_type',80).notNullable();
    t.string('payment_id',80);
    t.timestamp('processed_at').notNullable();
  });
}

export async function down(db) {
  await db.schema.dropTableIfExists('razorpay_events');
  await db.schema.alterTable('checkout_quotes',t=>{
    t.dropForeign('subscription_id');
    t.dropColumn('quantity');t.dropColumn('razorpay_order_id');t.dropColumn('razorpay_payment_id');t.dropColumn('subscription_id');
  });
}
