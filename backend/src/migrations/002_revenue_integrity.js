export async function up(db) {
  await db.schema.alterTable('subscriptions', t => {
    t.date('expires_on');
    t.integer('payment_terms_days').notNullable().defaultTo(0);
  });
  await db.schema.alterTable('invoices', t => {
    t.timestamp('sent_at');
    t.string('discount_id', 36).references('id').inTable('discounts');
  });
  await db.schema.createTable('integrity_cases', t => {
    t.string('id', 36).primary();
    t.string('fingerprint', 180).notNullable().unique();
    t.string('kind', 50).notNullable();
    t.string('subscription_id', 36).references('id').inTable('subscriptions');
    t.string('invoice_id', 36).references('id').inTable('invoices');
    t.string('customer_id', 36).notNullable().references('id').inTable('users');
    t.string('status', 20).notNullable().defaultTo('Open');
    t.integer('impact_cents').notNullable().defaultTo(0);
    t.text('explanation').notNullable();
    t.text('recommended_action').notNullable();
    t.text('resolution_note');
    t.string('resolved_by', 36).references('id').inTable('users');
    t.timestamp('resolved_at');
    t.timestamps(true, true);
    t.index(['status', 'kind']);
    t.index(['customer_id', 'status']);
  });
}

export async function down(db) {
  await db.schema.dropTableIfExists('integrity_cases');
  await db.schema.alterTable('invoices', t => { t.dropForeign('discount_id'); t.dropColumn('sent_at'); t.dropColumn('discount_id'); });
  await db.schema.alterTable('subscriptions', t => {
    t.dropColumn('expires_on');
    t.dropColumn('payment_terms_days');
  });
}
