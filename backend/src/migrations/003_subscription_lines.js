export async function up(db) {
  await db.schema.createTable('quotation_template_lines', t => {
    t.string('id',36).primary();
    t.string('template_id',36).notNullable().references('id').inTable('quotation_templates').onDelete('CASCADE');
    t.string('product_id',36).notNullable().references('id').inTable('products');
    t.string('variant_id',36).references('id').inTable('product_variants');
    t.integer('quantity').notNullable().defaultTo(1);
  });
  await db.schema.createTable('quotation_lines', t => {
    t.string('id',36).primary();
    t.string('quotation_id',36).notNullable().references('id').inTable('quotations').onDelete('CASCADE');
    t.string('product_id',36).notNullable().references('id').inTable('products');
    t.string('variant_id',36).references('id').inTable('product_variants');
    t.string('description',255).notNullable();
    t.integer('quantity').notNullable();
    t.integer('unit_cents').notNullable();
    t.integer('tax_basis_points').notNullable().defaultTo(0);
    t.integer('total_cents').notNullable();
  });
  await db.schema.createTable('subscription_lines', t => {
    t.string('id',36).primary();
    t.string('subscription_id',36).notNullable().references('id').inTable('subscriptions').onDelete('CASCADE');
    t.string('product_id',36).notNullable().references('id').inTable('products');
    t.string('variant_id',36).references('id').inTable('product_variants');
    t.string('description',255).notNullable();
    t.integer('quantity').notNullable();
    t.integer('unit_cents').notNullable();
    t.integer('tax_basis_points').notNullable().defaultTo(0);
    t.integer('total_cents').notNullable();
  });
}

export async function down(db) {
  for(const table of ['subscription_lines','quotation_lines','quotation_template_lines']) await db.schema.dropTableIfExists(table);
}
