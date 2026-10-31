import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { auth } from './auth.js';
import { customer } from './customer.js';
import { staff } from './staff.js';
import { admin } from './admin.js';
import { razorpayWebhook } from './razorpay-webhook.js';

const app=express();
const frontendDist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../frontend/dist');
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:{directives:{
  defaultSrc:["'self'"],scriptSrc:["'self'",'https://checkout.razorpay.com','https://*.razorpay.com'],
  styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'data:','https://fonts.gstatic.com'],
  imgSrc:["'self'",'data:','https:'],connectSrc:["'self'",'https://*.razorpay.com'],frameSrc:["'self'",'https://*.razorpay.com'],
}}}));
app.post('/api/webhooks/razorpay',express.raw({type:'application/json',limit:'256kb'}),razorpayWebhook);
app.use(express.json({limit:'100kb'}));
app.use(cookieParser());
app.use((req,res,next) => {
  const origin=process.env.FRONTEND_ORIGIN||(process.env.RENDER_EXTERNAL_HOSTNAME?`https://${process.env.RENDER_EXTERNAL_HOSTNAME}`:undefined);
  if(origin && req.headers.origin===origin) { res.setHeader('Access-Control-Allow-Origin',origin); res.setHeader('Access-Control-Allow-Credentials','true'); res.setHeader('Vary','Origin'); res.setHeader('Access-Control-Allow-Headers','Content-Type'); res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS'); }
  if(req.method==='OPTIONS') return res.status(204).end();
  if(!['GET','HEAD'].includes(req.method) && req.headers.origin && req.headers.origin!==origin) return res.status(403).json({message:'Origin denied.'});
  next();
});
app.use('/api/auth/login',rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false}));
app.use('/api/auth/forgot-password',rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:'draft-8',legacyHeaders:false}));
app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
app.use('/api/auth',auth);
app.use('/api/customer/me',customer);
app.use('/api/staff',staff);
app.use('/api/admin',admin);
if(existsSync(frontendDist)) {
  app.use(express.static(frontendDist,{index:false}));
  app.use((req,res,next)=>req.method==='GET'&&!req.path.startsWith('/api/')?res.sendFile(path.join(frontendDist,'index.html')):next());
}
app.use((err,_req,res,_next)=>{ if(err.code==='23505'||err.code==='ER_DUP_ENTRY') return res.status(409).json({message:'Record already exists.'}); const status=err.status||500; if(status===500) console.error(err); res.status(status).json({message:status===500?'Internal server error.':err.message}); });

const port=Number(process.env.PORT||3001);
await db.raw('select 1');
app.listen(port,()=>console.log(`Recurly API listening on ${port}`));
