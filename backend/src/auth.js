import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, hashSecret, hashToken, httpError, id, parse, publicUser, requireRole, sessionCookie, token, verifySecret, audit } from './lib.js';
import nodemailer from 'nodemailer';

export const auth = Router();
const password = z.string().min(12).max(128).regex(/[a-z]/, 'Password needs a lowercase letter.').regex(/[A-Z]/, 'Password needs an uppercase letter.').regex(/[^A-Za-z0-9]/, 'Password needs a special character.');
const email = z.email().max(254).transform(v => v.trim().toLowerCase());
auth.post('/register', asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160), email, password }).strict(), req.body);
  if (await db('users').where({ email: body.email }).first()) throw httpError(409, 'Email already registered.');
  const userId = id();
  await db('users').insert({ id: userId, name: body.name, email: body.email, password_hash: await hashSecret(body.password), role: 'user' });
  res.status(201).json({ message: 'Account created.' });
}));
auth.post('/login', asyncRoute(async (req, res) => {
  const body = parse(z.object({ email, password: z.string(), role: z.enum(['user','staff','admin']), specialId: z.string().optional() }).strict(), req.body);
  const user = await db('users').where({ email: body.email, active: true }).first();
  const valid = user && user.role === body.role && await verifySecret(body.password, user.password_hash) && (user.role === 'user' || (body.specialId && user.special_id_hash && await verifySecret(body.specialId, user.special_id_hash)));
  if (!valid) throw httpError(401, 'Invalid credentials or access type.');
  const value = token();
  await db('sessions').insert({ token_hash: hashToken(value), user_id: user.id, expires_at: new Date(Date.now() + Number(process.env.SESSION_DAYS || 7) * 86400000) });
  sessionCookie(res, value); res.json({ user: publicUser(user) });
}));
auth.get('/me', requireRole('user','staff','admin'), (req, res) => res.json({ user: publicUser(req.user) }));
auth.post('/logout', requireRole('user','staff','admin'), asyncRoute(async (req, res) => { await db('sessions').where({ token_hash: req.session.token_hash }).del(); res.clearCookie('recurly_session', { path: '/' }); res.status(204).end(); }));
auth.post('/forgot-password', asyncRoute(async (req, res) => {
  const body = parse(z.object({ email }), req.body);
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) throw httpError(503, 'Password reset email is not configured.');
  const user = await db('users').where({ email: body.email, active: true }).first();
  if (user) {
    const value = token();
    await db('password_resets').insert({ token_hash: hashToken(value), user_id: user.id, expires_at: new Date(Date.now() + 30 * 60000) });
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    await transport.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: 'Reset your Recurly password', text: `Open ${process.env.APP_PUBLIC_URL}/reset-password?token=${encodeURIComponent(value)} to reset your password. This link expires in 30 minutes.` });
  }
  res.json({ message: 'If the address is registered, a reset link has been sent.' });
}));
auth.post('/reset-password', asyncRoute(async (req, res) => {
  const body = parse(z.object({ token: z.string().min(20), password }), req.body);
  const reset = await db('password_resets').where({ token_hash: hashToken(body.token) }).whereNull('used_at').where('expires_at', '>', new Date()).first();
  if (!reset) throw httpError(400, 'Reset link is invalid or expired.');
  await db.transaction(async trx => {
    await trx('users').where({ id: reset.user_id }).update({ password_hash: await hashSecret(body.password), updated_at: new Date() });
    await trx('password_resets').where({ token_hash: reset.token_hash }).update({ used_at: new Date() });
    await trx('sessions').where({ user_id: reset.user_id }).del();
    await audit(trx, reset.user_id, 'password.reset', 'user', reset.user_id);
  });
  res.json({ message: 'Password changed. Sign in again.' });
}));
