import { db } from './db.js';
import { hashSecret, id } from './lib.js';
const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_NAME: name, BOOTSTRAP_ADMIN_PASSWORD: password, BOOTSTRAP_ADMIN_SPECIAL_ID: specialId } = process.env;
if (!email || !name || !password || !specialId || password.length < 12 || specialId.length < 12) throw new Error('Set BOOTSTRAP_ADMIN_EMAIL, NAME, PASSWORD and SPECIAL_ID (at least 12 characters each).');
try {
  if (await db('users').where({ role: 'admin' }).first()) throw new Error('An admin already exists; create further admin accounts through the authenticated admin API.');
  await db('users').insert({ id: id(), email: email.trim().toLowerCase(), name, password_hash: await hashSecret(password), special_id_hash: await hashSecret(specialId), role: 'admin' });
  console.log('Initial admin created. Remove bootstrap secrets from the environment.');
} finally { await db.destroy(); }
