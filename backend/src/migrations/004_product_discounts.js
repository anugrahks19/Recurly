export async function up(db) {
  await db.schema.alterTable('discounts', t => t.string('product_id',36).references('id').inTable('products'));
}

export async function down(db) {
  await db.schema.alterTable('discounts', t => { t.dropForeign('product_id'); t.dropColumn('product_id'); });
}
