# Razorpay setup and acceptance checks

This integration uses Razorpay Standard Checkout for an initial subscription payment and for customer payment of a confirmed recurring invoice. The app never accepts raw card details. Automated mandate-based recurring charges and saved-method management are separate work.

## Configure

1. Create a Razorpay **Test Mode** account and keys. Put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`; never put the secret in the frontend. Set a distinct `RAZORPAY_WEBHOOK_SECRET` in both the Razorpay Dashboard and `backend/.env`.
2. Enable automatic payment capture in the Razorpay Dashboard. Recurly treats a payment as collected only after Razorpay reports `captured`.
3. Configure a public HTTPS webhook URL ending in `/api/webhooks/razorpay` for `payment.captured`, `payment.failed`, and `payment.refunded`. Localhost cannot receive Razorpay webhooks directly.
4. Set `DATABASE_CLIENT` and `DATABASE_URL`, run `npm run migrate`, and then start the backend. Never use test keys in a live deployment.
5. Configure SMTP separately for password reset and invoice email.

The server creates each order with the expected amount in INR subunits and a unique internal receipt. Browser callbacks are verified against the order ID stored in SQL; the server fetches payment status before activation. Webhooks are checked against the raw body using the webhook secret and deduplicated by event ID. Provider orders are reused for repeat requests for the same quote or invoice.

## Live Test Mode checks

- Signup as a customer, select a plan and quantity, review the server quote, complete a test payment, and confirm exactly one subscription, paid invoice, and successful payment record.
- Repeat the browser callback and webhook delivery; confirm no duplicate subscription or payment.
- Close the browser after payment and verify the signed webhook still records the captured payment.
- Try an invalid signature, wrong order, wrong amount, failed payment, and delayed capture; confirm no premature activation.
- Generate and confirm the next invoice, pay it through Razorpay, and check its status, receipt PDF, and reports.
- Run the same database acceptance flow on PostgreSQL and MySQL. Check concurrent billing and payment requests.

## Current limits

- A Razorpay order is created while the SQL row is locked. If the process crashes after Razorpay creates an order but before SQL stores it, an orphan order may remain. Reconcile the provider receipt with the quote or invoice before retrying that payment.
- Customer plan changes, automated recurring mandates, refund processing, trial activation, and saved cards are not implemented. Refund webhooks create an integrity case for manual reconciliation. Confirmed recurring invoices can be paid in Standard Checkout.
- Razorpay and SMTP credentials, two live SQL instances, and a public HTTPS staging URL were not available during local development. No real or test-mode payment has been executed here.

Official references: [Create an Order](https://razorpay.com/docs/api/orders/create), [Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps), and [Validate and Test Webhooks](https://razorpay.com/docs/webhooks/validate-test).
