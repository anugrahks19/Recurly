import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';

process.env.DATABASE_CLIENT ||= 'pg';
process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5432/unused';
const {verifyHmac,verifyCheckoutSignature}=await import('./razorpay.js');

test('Razorpay signatures require exact order, payment and secret',()=>{
  process.env.RAZORPAY_KEY_SECRET='test-secret';
  const signature=createHmac('sha256','test-secret').update('order_123|pay_456').digest('hex');
  assert.equal(verifyCheckoutSignature('order_123','pay_456',signature),true);
  assert.equal(verifyCheckoutSignature('order_123','pay_changed',signature),false);
  assert.equal(verifyHmac(Buffer.from('{"ok":true}'),signature,'test-secret'),false);
  assert.equal(verifyHmac('order_123|pay_456','bad','test-secret'),false);
  delete process.env.RAZORPAY_KEY_SECRET;
});
