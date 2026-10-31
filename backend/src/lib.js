import { randomBytes, createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

export const id = () => randomUUID();
export const token = () => randomBytes(32).toString('base64url');
export const hashToken = value => createHash('sha256').update(value).digest('hex');
export const hashSecret = value => bcrypt.hash(value, 12);
export const verifySecret = (value, hash) => bcrypt.compare(value, hash);
export const money = cents => Number(cents || 0) / 100;
export const cents = amount => Math.round(Number(amount) * 100);
export const date = value => new Date(value).toISOString().slice(0, 10);
export const publicUser = row => ({ id: row.id, name: row.name, email: row.email, role: row.role });
export const httpError = (status, message) => Object.assign(new Error(message), { status });
export const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const audit = (trx, actor, action, type, entity, details = {}) => trx('audit_logs').insert({ id: id(), actor_id: actor, action, entity_type: type, entity_id: entity, details_json: JSON.stringify(details) });

export function requireRole(...roles) { return asyncRoute(async (req, _res, next) => {
  const raw = req.cookies.recurly_session;
  if (!raw) throw httpError(401, 'Sign in required.');
  const session = await db('sessions').where({ token_hash: hashToken(raw) }).where('expires_at', '>', new Date()).first();
  if (!session) throw httpError(401, 'Session expired.');
  const user = await db('users').where({ id: session.user_id, active: true }).first();
  if (!user) throw httpError(401, 'Account unavailable.');
  if (!roles.includes(user.role)) throw httpError(403, 'Access denied.');
  req.user = user; req.session = session; next();
}); }

export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw httpError(400, result.error.issues.map(issue => issue.message).join('; '));
  return result.data;
}

export function sessionCookie(res, value) {
  res.cookie('recurly_session', value, { httpOnly: true, secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: Number(process.env.SESSION_DAYS || 7) * 86400000 });
}
