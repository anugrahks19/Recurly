import 'dotenv/config';
import knex from 'knex';
import { fileURLToPath } from 'node:url';

const client = process.env.DATABASE_CLIENT;
if (!['pg', 'mysql2'].includes(client)) throw new Error('DATABASE_CLIENT must be pg or mysql2');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

export const db = knex({
  client,
  connection: process.env.DATABASE_URL,
  pool: { min: 0, max: 10 },
  migrations: { directory: fileURLToPath(new URL('./migrations', import.meta.url)) },
});
