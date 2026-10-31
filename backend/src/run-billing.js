import { db } from './db.js';
import { generateDueInvoices } from './billing.js';
try { console.log(await generateDueInvoices(null)); }
finally { await db.destroy(); }
