import { db } from './db.js';
try {
  const [batch, files] = await db.migrate.latest();
  console.log(`Applied migration batch ${batch}: ${files.join(', ') || 'none'}`);
} finally { await db.destroy(); }
