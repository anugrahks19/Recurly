# Real-World Subscription Business Scenarios

## 1. Introduction

Subscription-based businesses generate revenue by providing products or services to customers for a recurring fee. Customers may pay monthly, quarterly or annually depending on their subscription agreement.

Unlike one-time sales, subscription businesses must continuously manage customer relationships, recurring payments, renewals, invoices, discounts, taxes and service access.

For a SaaS company such as Brightloop Software, managing subscriptions involves several departments:

- **Sales team:** Creates quotations, negotiates prices and converts potential customers into subscribers.
- **Operations team:** Manages products, plans, subscription changes and renewals.
- **Finance team:** Handles invoices, taxes, payments, reconciliation and revenue reporting.
- **Customer support team:** Handles billing questions, disputes, cancellations and service-related issues.
- **Customers:** Purchase subscriptions, make payments, request changes and manage their accounts.

When these activities are handled manually or through disconnected systems, errors can occur. Even when billing software is available, businesses must configure workflows correctly and handle exceptions that require human intervention.

This document investigates practical situations that subscription businesses encounter. It examines why these problems occur, their financial and operational impact, how existing systems may handle them, and what information could help resolve them.

### Research methodology

The research uses:

- Official documentation from Odoo, Stripe, Chargebee and Adyen.
- Recurly's published subscription industry research.
- QuickBooks documentation covering bank transaction matching and reconciliation.
- Practical hypothetical examples based on common subscription business workflows.

**Important distinction:**

- **Documented industry problem:** A problem or workflow explicitly described in an industry report or official software documentation.
- **Hypothetical Brightloop scenario:** An illustrative example showing how that problem could occur at Brightloop. It is not a claim that the incident actually happened.

---

## 2. Subscription Lifecycle Scenarios

### Scenario 2.1: Subscription created but not properly activated

**Business context:**

A customer accepts a quotation for a software subscription. The sales team records the order, but the subscription is not correctly activated or its payment information is incomplete.

**Stakeholders involved:**
- Sales team
- Operations team
- Finance team
- Customer

**What exactly happens?**

1. The sales team creates a quotation.
2. The customer accepts the quotation.
3. A subscription record is created.
4. The initial payment is not received or its status is not updated.
5. The operations team assumes the subscription is active.
6. The customer expects access to the software but may not receive it.

**Why does the problem occur?**

- The quotation and subscription records are not properly connected.
- Payment confirmation is delayed.
- Staff manually update subscription statuses.
- The payment gateway and subscription records are not synchronized.
- Different employees follow different activation procedures.

**Business impact:**

- Customers may experience delays in receiving their services.
- Revenue may be recorded before payment is actually received.
- Staff spend time checking subscription and payment records.
- Customer support requests increase.

**How might an existing system handle it?**

Platforms such as Odoo support subscription quotations that become subscriptions after confirmation. Odoo also supports payment-related workflows and recurring plans.

However, the business must configure the required confirmation and payment conditions correctly.

**Manual intervention that may be required:**

- Verify whether the quotation was accepted.
- Check the initial invoice.
- Confirm the payment status.
- Correct the subscription status.
- Contact the customer if information is missing.

**Information that would help resolve it:**

- Customer ID
- Quotation number
- Subscription ID
- Payment status
- Payment transaction reference
- Subscription activation date
- Product and plan details

**Potential improvement opportunity:**

Better visibility into the relationship between quotations, subscription activation and initial payment confirmation.

---

### Scenario 2.2: Duplicate or missed recurring invoices

**Business context:**

A business has hundreds of active subscriptions. Each subscription must generate an invoice at the correct billing interval.

**Stakeholders involved:**
- Finance team
- Operations team
- System administrator

**What exactly happens?**

Two possible problems can occur:

**Duplicate invoice:**

A billing process runs twice, creating two invoices for the same customer and billing period.

**Missed invoice:**

A subscription reaches its billing date, but the invoice generation process fails or skips the subscription.

**Hypothetical example:**

A customer pays ₹5,000 monthly.

- Correct invoice for November: ₹5,000.
- Duplicate invoice generated for November: another ₹5,000.

The customer now sees an incorrect total of ₹10,000.

In a different case, no invoice is generated at all, resulting in missed revenue collection.

**Why does the problem occur?**

- Billing jobs run more than once.
- Scheduled tasks fail.
- Subscription dates are incorrect.
- Subscription status changes during invoice generation.
- System interruptions occur.
- Invoice creation and subscription updates are not processed consistently.

**Business impact:**

- Duplicate invoices can damage customer trust.
- Missed invoices delay collections.
- Finance teams must investigate billing records.
- Revenue reports become inaccurate.
- Incorrect invoices may require cancellation or credit notes.

**How might an existing system handle it?**

Subscription platforms generally provide recurring invoice generation.

Stripe provides invoice preview functionality and subscription billing controls. Odoo supports automatic recurring invoicing.

However, developers and administrators must still ensure that billing jobs, integration events and system configurations behave correctly.

**Manual intervention that may be required:**

- Identify duplicate invoices.
- Verify the correct billing period.
- Cancel or reverse incorrect invoices where appropriate.
- Generate missing invoices.
- Check whether the customer was already charged.

**Information that would help resolve it:**

- Subscription ID
- Invoice number
- Billing period
- Invoice generation timestamp
- Invoice status
- Last successful billing date
- Payment transaction ID
- Billing job execution history

**Potential improvement opportunity:**

Improved visibility into missing and duplicate billing events, with reliable tracking of whether each subscription period has already been invoiced.

---

### Scenario 2.3: Subscription changes are not reflected correctly

**Business context:**

Customers frequently change their subscriptions as their business requirements grow or decrease.

For example, a small business may initially purchase five software licences and later require fifteen.

**Stakeholders involved:**
- Customer
- Sales team
- Operations team
- Finance team

**What exactly happens?**

A customer requests additional licences or changes a product variant.

The operations team updates the subscription, but the invoice still reflects the previous quantity or price.

Alternatively, the subscription is updated but the
