# Market Gap Analysis

**Project:** Recurly — Subscription Management System  
**Hackathon:** Odoo Hackathon  
**Research stage:** Problem discovery (the product direction is not finalised)  
**Research updated:** 31 October 2026

## 1. Research Objective

This document examines the current subscription-management market and investigates where Recurly could create useful value for Brightloop Software, the fictional business in the hackathon problem statement.

The research focuses on four platforms:

1. Odoo Subscriptions
2. Stripe Billing
3. Chargebee
4. Zoho Billing

The objective is not to prove that these products are deficient or that they lack basic subscription features. All four provide substantial billing and subscription-management capabilities. Instead, this analysis separates:

- Capabilities that already exist in the market.
- Documented product constraints or workflows that can require configuration or human review.
- Broader operational risks identified by industry research.
- Potential opportunities that Recurly could investigate without prematurely committing to a solution.

**Important context:** Brightloop is the fictional client described in the challenge. Recurly is the proposed product being explored by our team. Recurly is not Brightloop.

### Scope and method

The comparison uses publicly available official product documentation and vendor-published product information available on 31 October 2026. Where an official help page does not display a publication date, the reference is marked as accessed on that date.

Industry statistics are identified separately from product-documentation findings. Vendor-sponsored survey results are not treated as universal industry facts.

The hackathon problem statement does not identify the Odoo version to be used. Odoo 19.0 documentation is used here as a current reference point, not as confirmation that the hackathon environment runs Odoo 19.0.

---

## 2. Current Subscription Management Market

Subscription-management products have moved well beyond simple recurring invoice generation. Established platforms can manage recurring plans, subscription changes, customer self-service, payment collection, retry workflows, discounts, usage-based billing and subscription reporting.

This means that features such as the following are not unique by themselves:

- Monthly and yearly recurring billing.
- Automatic invoice generation.
- Customer subscription portals.
- Failed-payment reminders and retries.
- Subscription cancellation and renewal management.
- Basic revenue and churn reports.
- AI-based payment retry or churn analysis.

For example, Stripe offers machine-learning-based Smart Retries; Chargebee and Zoho Billing offer configurable dunning workflows; and Odoo supports recurring invoices and tokenised automatic payments through compatible providers. These are established market capabilities, not original ideas for Recurly.

### A more useful way to think about the market

A subscription business moves through a chain of related records and actions:

1. A commercial offer or quotation is prepared.
2. The customer accepts the agreed terms.
3. A subscription is created with products, quantities, prices, discounts and dates.
4. The system calculates what is due for a billing period.
5. An invoice is generated.
6. A payment is attempted or recorded.
7. The payment is matched to the invoice and accounting records.
8. The business reports what was billed, collected, remains outstanding or was adjusted.

Each platform automates parts of this chain. The opportunity to investigate is whether businesses can reliably verify that the information remains consistent across the entire chain, especially when an exception, amendment, payment uncertainty or manual adjustment occurs.

This is a stronger research direction than simply adding another dashboard or chatbot.

---

## 3. Competitor Comparison

The comparison below describes documented capabilities and specific constraints. A product limitation is not assumed merely because a feature was not found in a search.

### 3.1 Odoo Subscriptions

**What it provides**

Odoo Subscriptions supports subscription products, recurring plans, quotations, recurring invoices and subscription lifecycle management. Subscription products can have product variants and recurring price rules. A quotation with a recurring plan can become a subscription when confirmed.

Odoo's automatic-payment workflow uses payment providers that support tokenisation. Its Odoo 19.0 documentation lists Adyen, Authorize.net, Flutterwave, Razorpay, Stripe and Xendit among supported providers for this workflow.

Odoo also provides customer portal functionality and accounting features for bank transactions and reconciliation.

**Documented operational behaviour and constraints**

- When an automatic subscription payment fails, Odoo marks the order with a Payment Failure tag and the Contract in exception checkbox.
- The exception prevents scheduled actions from running. This is a safety measure intended to avoid a possible duplicate charge when the payment result did not register correctly.
- Odoo's documented recovery procedure asks a user to inspect the payment in the subscription's Chatter, determine whether the payment actually occurred, and then manually clear the exception. If the payment happened but was not registered, the documentation describes creating and posting an invoice manually before resuming scheduled actions.
- Bank reconciliation can automatically match transactions using matching rules and reconciliation models. Unmatched transactions can still require a user to review and reconcile them.
- Customers can close subscriptions through the portal when the relevant self-service option is enabled on the recurring plan. General portal users otherwise have read/view access to portal documents and information.

**What Odoo handles well**

- A unified ERP environment connecting Sales, Subscriptions, Accounting and customer records.
- Recurring quotations and invoicing.
- Product variants and recurring pricing.
- Automatic payments through supported tokenising providers.
- Accounting bank reconciliation, including configurable reconciliation models.
- Subscription reporting with filters and groupings.

**Potential area to investigate**

Odoo already has the underlying subscription and accounting features. A focused improvement could be a clearer subscription exception workflow that brings together the subscription, invoice, transaction, bank-reconciliation status and the reason a scheduled action was stopped.

The opportunity is not to remove Odoo's duplicate-payment safety check. It is to help staff resolve the exception with less searching and clearer evidence, while preserving that safety.

**References:** [Odoo Subscriptions](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html); [Subscriptions and automatic payments](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html); [Close subscriptions](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/closing.html); [User portals](https://www.odoo.com/documentation/19.0/applications/general/users/user_portals.html); [Bank reconciliation](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation.html); [Reconciliation models](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation_models.html). Accessed 31 October 2026.

### 3.2 Stripe Billing

**What it provides**

Stripe Billing supports recurring subscriptions, invoices, varied pricing models, customer billing management and payment collection. Stripe documents a range of recovery mechanisms, including failed-payment emails, saved-card updates where supported by card networks and Smart Retries.

Smart Retries uses machine learning across Stripe's payment data to select retry times for failed invoice payments.

Stripe's hosted Billing customer portal allows customers to update payment methods, manage invoices, view payment history, and update or cancel eligible existing subscriptions.

**Documented operational behaviour and constraints**

Stripe's customer-portal help documentation describes specific limitations:

- Customers cannot create entirely new subscriptions through the Billing customer portal. New subscriptions are created through Checkout or the API.
- The portal does not support allowing customers to pause a subscription. Payment collection can be paused through the Dashboard or API, but this does not change the subscription status to a paused state.
- Some subscription configurations are not eligible for every portal update action; in those cases, the portal may support cancellation but not the requested update.

These are specific portal constraints, not evidence that Stripe lacks subscription management or subscription changes generally.

**What Stripe handles well**

- Payment infrastructure and recurring payment collection.
- Configurable subscription billing.
- Smart Retries and other payment-recovery mechanisms.
- Customer self-service for supported subscription and invoice actions.
- Developer APIs and event-driven integrations.

**Potential area to investigate**

For a business using Odoo as its operational and accounting system, a potential challenge is keeping the commercial subscription record, Stripe payment events, invoice status and accounting records aligned. Recurly could investigate a unified status and exception view inside the Odoo workflow rather than trying to replace Stripe's payment intelligence.

**References:** [Stripe Billing customer portal](https://support.stripe.com/questions/billing-customer-portal); [Payments recovered by Stripe](https://support.stripe.com/questions/payments-recovered-by-stripe?locale=en-GB). Accessed 31 October 2026. The support pages do not display a publication date in the material reviewed.

### 3.3 Chargebee

**What it provides**

Chargebee provides subscription lifecycle management, product catalog and add-ons, recurring billing, invoicing, usage-based billing, customer self-service and revenue reporting.

Its dunning features support automated retries and customer notifications for online payment failures. Offline dunning can send reminders when payments are not automatically collected. Businesses can configure retry behaviour and the final action for subscriptions and invoices.

Chargebee's self-serve portal supports customer actions such as changing plans, changing quantities, adding or removing eligible add-ons, pausing, resuming, cancelling or reactivating subscriptions, managing payment methods and paying unpaid invoices.

Chargebee also provides Events and Activity Logs for tracing customer, subscription, plan, add-on, coupon and invoice changes.

**Documented operational behaviour and constraints**

- Dunning behaviour depends on payment mode, configuration and the scenario. Chargebee documents cases where dunning does not apply, including certain one-time charges or manual collection attempts.
- Where dunning has expired, an active subscription can have an unpaid invoice, depending on the configured final action.
- Chargebee documents that some settings affect future invoices and subscriptions rather than retroactively fixing existing unpaid invoices.
- Customer-portal actions depend on the enabled settings and the subscription or add-on configuration.

These are workflow and configuration details, not evidence that Chargebee lacks dunning, customer self-service or audit logs.

**What Chargebee handles well**

- Configurable online and offline dunning.
- Detailed subscription and billing lifecycle management.
- Customer self-service for eligible subscription changes.
- Usage-based billing and add-on management.
- Events and activity history for explaining changes.
- Revenue and collections reporting.

**Potential area to investigate**

A useful area is exception resolution across multiple records and systems: helping an operator quickly understand why a subscription, invoice, transaction or payment status differs, what has already been attempted, and which corrective action is safe. Chargebee's existing activity logs show that auditability is an established capability; Recurly should not claim to invent it.

**References:** [Chargebee dunning](https://www.chargebee.com/docs/payments/2.0/kb/payments/how-to-enable-dunning-in-subscriptions); [Dunning v1 and documented scope](https://www.chargebee.com/docs/payments/2.0/dunning/dunning); [Self-Serve Portal](https://www.chargebee.com/docs/billing/2.0/hosted-capabilities/self-serve-portal); [Activity Log and subscription changes](https://www.chargebee.com/docs/billing/2.0/kb/platform/how-do-i-find-how-a-specific-change-was-made-to-a-customer-or-subscription-and-by-whom); [Invoice events](https://www.chargebee.com/docs/billing/2.0/kb/billing/where-can-we-check-events-related-to-invoice). Accessed 31 October 2026.

### 3.4 Zoho Billing

**What it provides**

Zoho Billing supports product catalogs, plans, recurring invoices, subscription changes, customer portals, payment reminders, dunning, subscription reports and payment management.

Its customer portal allows customers to manage subscriptions, accept quotations, pay invoices and update their information.

Zoho Billing's dunning management can notify customers and retry payments according to configured preferences. The reviewed India help page documents a maximum of three retry attempts and a total retry interval of no more than 30 days for the described configuration.

Zoho's subscription reports include metrics such as signups, activations, cancellations, reactivations, upgrades, downgrades, renewals, payment failures and churn percentage.

Zoho's invoicing product page describes automatic reconciliation of online payments made through supported payment gateways. Offline payments, such as bank transfers received outside an integrated payment gateway, can be recorded against invoices.

**Documented operational behaviour and constraints**

- Dunning is configurable, but the reviewed help page documents specific retry limits for that workflow.
- Automatic matching of online gateway payments should not be confused with automatic matching of every bank transfer or offline payment.
- Offline payments can be recorded against invoices by users.
- Customer portal availability and permitted actions depend on organisation and portal configuration.

These details should not be generalised beyond the specific Zoho Billing documentation reviewed.

**What Zoho handles well**

- Subscription and invoice management.
- Configurable payment-failure notifications and retries.
- Customer self-service.
- Subscription reporting and lifecycle metrics.
- Online payment handling and invoice-related workflows.

**Potential area to investigate**

A possible opportunity is to give finance staff a consolidated view of online payment events, offline payment records, invoice status and subscription status, with clear indicators for records requiring review. This is not a claim that Zoho lacks reconciliation or reporting.

**References:** [Zoho Billing Dunning Management](https://www.zoho.com/in/billing/help/settings/subscriptions/dunning-management.html); [Customer Portal overview](https://www.zoho.com/in/billing/help/settings/customer-portal/customer-portal.html); [Subscription Reports](https://www.zoho.com/in/billing/help/reports/subscription-reports.html); [Automated invoice processing and online payment reconciliation](https://www.zoho.com/in/billing/automated-invoice-processing/); [Offline payments received against invoices](https://www.zoho.com/in/billing/help/invoice/payments-received.html). Accessed 31 October 2026. The help pages do not consistently display publication dates.

### 3.5 Competitor summary

| Area | Odoo | Stripe Billing | Chargebee | Zoho Billing |
|---|---|---|---|---|
| Recurring subscriptions and invoices | Yes | Yes | Yes | Yes |
| Customer self-service | Yes, subject to portal and plan settings | Yes, for supported existing-subscription actions | Yes, configurable | Yes, configurable |
| Failed-payment recovery | Automatic payments; documented exception workflow requires manual verification in uncertain cases | Smart Retries and recovery tools | Configurable online/offline dunning | Configurable dunning |
| Payment / bank reconciliation | Odoo Accounting matching rules and reconciliation models | Payment and invoice events; accounting workflows may require integration | Payment and transaction tools; depends on configuration and integrations | Online gateway payment reconciliation; offline payments can be recorded |
| Subscription activity history | Odoo records and Chatter | Events and integration logs | Events and Activity Logs | Record and transaction reporting |
| Revenue / subscription reporting | Subscription and Accounting reports | Billing and revenue-related reporting products | Revenue and collections analytics | Subscription and billing reports |

**Interpretation:** The table is a capability overview, not a complete feature-by-feature benchmark. Availability varies by edition, payment provider, country, configuration and integration. The presence of a feature does not prove every business workflow is fully automated.

---

## 4. Common Operational Challenges

The reviewed products already automate many ordinary subscription operations. The more useful market questions concern how businesses manage exceptions, verify billing correctness and trace financial outcomes.

### 4.1 Billing correctness is an end-to-end problem

A correct invoice depends on several pieces of information being correct at the same time:

- The accepted quotation or contract terms.
- The active subscription and its billing period.
- The correct product, variant and quantity.
- The applicable price and discount.
- Any mid-cycle amendment or proration.
- Tax configuration.
- Credits, refunds or earlier adjustments.
- The invoice-generation result.

A system can successfully generate an invoice while still generating the wrong amount if one of the upstream records is inaccurate or out of date.

The opportunity is therefore not just invoice generation. It is checking whether the invoice agrees with the approved terms and relevant billing events before it is sent.

### 4.2 Payment status is not always a simple success/failure

Payment providers, bank transfers and accounting records may update at different times. A timeout or delayed callback can leave the business uncertain whether a charge succeeded.

Odoo explicitly documents a manual verification step after certain automatic payment failures because the payment result may not have registered in the system. This protects against a duplicate charge, but it also creates an exception for staff to investigate.

The opportunity is to make uncertainty visible and resolve it safely. An uncertain payment should be verified before another charge is attempted.

### 4.3 Reconciliation involves more than matching equal amounts

A payment may be:

- Partial.
- Combined with other payments.
- Received with an unclear reference.
- Received through an offline method.
- Recorded by a gateway but not yet reconciled in accounting.
- Associated with an invoice that has been amended or credited.

Odoo and other products already offer reconciliation features. The market question is how much work remains for ambiguous transactions and how quickly finance staff can understand the evidence behind a suggested match.

### 4.4 Subscription changes create downstream work

Plan upgrades, downgrades, quantity changes, add-ons, discount expiry and cancellation dates affect later invoices and payment amounts.

Platforms provide mechanisms for subscription changes and proration. However, a business still needs the agreed commercial terms, effective date and resulting invoice calculation to remain consistent.

A useful opportunity is to show the chain of changes that explains a billing amount, not merely the final number.

### 4.5 Reporting is only as trustworthy as the underlying records

A dashboard may show active subscriptions, revenue and outstanding invoices, but finance teams still need to know:

- Does the subscription have an invoice for the expected billing period?
- Does the invoice match the approved terms?
- Has the payment been received?
- Has it been reconciled?
- Is the amount outstanding, disputed, credited or written off?
- Can the team explain why the value changed?

This is a data-quality and traceability question, not just a charting problem.

---

## 5. Billing and Revenue Leakage Gaps

### 5.1 Industry evidence

DigitalRoute published a 2026 research series based on a quantitative survey of 631 senior leaders across six markets: the UK, US, Germany, France, the Nordics and Benelux. The survey was conducted in April–May 2026. The reports were updated on 2 June 2026.

The **State of Monetization Infrastructure 2026** report states that:

- 70% of surveyed organisations reported at least 1% revenue leakage from billing systems.
- 80% reported invoice disputes on at least 1% of invoices.
- 75% reported that at least 10% manual effort was needed to produce accurate invoices.

The **The Year Customers Audited the Invoice** report states that:

- 60% estimated that billing errors put at least 2% of revenue at risk.
- 29% said customer disputes were the first way billing issues were detected, compared with 17% who cited automated pre-bill controls.
- 71% said disputes added at least six days to time-to-cash.
- 22% said they could produce an evidence pack within 24 hours.

The **From Usage to Revenue 2026** report states that 67% of respondents manually fixed more than 5% of usage invoices before sending them, and 52% identified usage-data quality, validation and auditability as the top improvement needed to scale confidently.

**Important qualification:** These are self-reported vendor-published survey results, not independently verified universal rates. Much of the 2026 research focuses on usage-based or dynamic monetisation. It should not be presented as a direct estimate of revenue leakage for Brightloop's fixed monthly/yearly subscription scenario. It does, however, provide evidence that billing accuracy, data validation, invoice disputes and manual remediation are material concerns in businesses with more complex pricing.

Sources:
- [DigitalRoute — State of Monetization Infrastructure 2026](https://www.digitalroute.com/research/state-of-monetization-infrastructure-2026/) — updated 2 June 2026.
- [DigitalRoute — The Year Customers Audited the Invoice](https://www.digitalroute.com/research/the-year-customers-audited-the-invoice/) — updated 2 June 2026.
- [DigitalRoute — From Usage to Revenue 2026](https://www.digitalroute.com/research/from-usage-to-revenue-2026/) — updated 2 June 2026.

### 5.2 Types of revenue leakage worth investigating

| Scenario | Possible cause | Potential business impact | Possible control to investigate |
|---|---|---|---|
| Active subscription without an invoice | Billing schedule or subscription state was not processed | Unbilled revenue | Compare eligible billing periods with generated invoices |
| Invoice differs from approved subscription terms | Wrong quantity, price, discount, tax or effective date | Undercharging, overcharging or disputes | Pre-invoice comparison with approved terms |
| Add-on is enabled but not billed | Subscription line was not updated | Missing recurring charge | Compare active entitlements/add-ons with invoice lines |
| Expired discount is still applied | Discount validity or usage rule was not respected | Margin loss | Validate discount dates, scope and remaining usage |
| Duplicate invoice for a billing period | Duplicate job, manual action or missing idempotency control | Double billing and customer disputes | Detect duplicate billing-period and subscription references |
| Payment received but not reconciled | Missing, ambiguous or delayed reference | Incorrect outstanding balance and collection follow-up | Match payment evidence to invoice and accounting records |
| Payment recorded but subscription remains in exception | Payment callback or status update did not complete | Service interruption or manual recovery work | Cross-check provider, invoice and subscription states |

These are plausible control scenarios to test. They are not claims that all four competitors fail to handle them.

### 5.3 Potential opportunity: pre-bill integrity checks

A pre-bill integrity check could compare the invoice about to be issued with the approved subscription terms for that billing period.

Possible checks:

1. Is the subscription eligible for billing now?
2. Has an invoice already been created for this subscription and period?
3. Do product lines and quantities match the active subscription?
4. Are price and discount rules valid for the billing date?
5. Are proration and mid-cycle changes reflected correctly?
6. Are tax rules applied?
7. Does the total match the expected calculation?

The system could flag exceptions for review before sending the invoice.

This is a potentially useful direction because it is closely related to Brightloop's required product, plan, discount, tax and invoice data. It does not require an AI model for an initial demonstrator; deterministic business rules and an auditable calculation may be more reliable.

---

## 6. Payment and Exception Handling Gaps

### 6.1 Payment retry is already a mature capability

Stripe Smart Retries uses machine learning to choose retry timing. Chargebee and Zoho Billing both support configurable dunning and customer notifications. Recurly should not claim that automatic retries or payment reminders are unique.

A possible distinction is to connect recovery actions to the complete operational state:

- What invoice is unpaid?
- Did the gateway return a definitive failure or an uncertain result?
- Has the transaction been verified?
- Is the subscription still active, paused or in exception?
- Has a later payment already settled the invoice?
- Is another retry safe?
- What should the customer be told?

### 6.2 Uncertain payment outcomes need safe handling

The Odoo 19.0 documentation provides a concrete example: a failed payment registration can put a contract into exception and stop scheduled actions until a human verifies whether the charge actually succeeded.

This is an evidence-backed workflow that Recurly can investigate in the specific Odoo context.

Potential improvement:

- Present the payment event, invoice, subscription and transaction reference together.
- Distinguish confirmed failure, confirmed success and unknown outcome.
- Prevent automatic recharging while the outcome is unknown.
- Suggest the next safe action based on evidence.
- Require authorised confirmation for sensitive financial corrections.
- Record the resolution and user who approved it.

The goal should be fewer manual searches without weakening duplicate-payment protections.

### 6.3 Payment reconciliation should include confidence and evidence

Odoo already has automatic matching rules, partner and amount matching, import of bank transactions and configurable reconciliation models. Zoho Billing describes automatic reconciliation for supported online gateway payments. Therefore, Recurly should not present basic payment matching as an entirely new capability.

A potential improvement is a review queue for low-confidence or ambiguous matches, showing:

- Candidate invoice or customer.
- Amount difference.
- Payment date and reference.
- Matching evidence.
- Whether the invoice is already partially or fully paid.
- Whether a human needs to approve the match.

This could be especially useful for payments received outside a supported online gateway, but its feasibility depends on access to bank files, references and accounting data.

---

## 7. Customer Experience Gaps

Customer self-service portals already exist across Odoo, Stripe, Chargebee and Zoho. A portal by itself is not a differentiator.

However, there are specific experience questions worth investigating.

### 7.1 Customers need to understand the amount, not just see it

A customer may see a total invoice amount without understanding the effect of:

- A plan change.
- Additional seats.
- An add-on.
- A discount expiring.
- A mid-cycle upgrade.
- Taxes or credits.

A potential billing explanation view could show the previous amount, the changed items, the effective date and how the next invoice was calculated.

### 7.2 Self-service must respect business rules

Different subscription types may allow different customer actions. Stripe documents limitations in its hosted portal for creating new subscriptions and pausing a subscription. Odoo allows customer closure when configured on the recurring plan. Chargebee and Zoho expose configurable customer actions.

The opportunity is not unrestricted self-service. It is a clear view of which actions are available, when they take effect, and what the financial consequence will be.

### 7.3 Customer-facing transparency can reduce avoidable disputes

An understandable billing timeline could include:

- Original quotation or agreed plan.
- Plan and quantity changes.
- Discount start and expiry.
- Invoice and payment history.
- Next billing date and expected amount.
- Credits, refunds or adjustments.
- Renewal or cancellation status.

This is an area for investigation, rather than a claim that the reviewed portals do not show billing history.

---

## 8. Integration and Financial Visibility Gaps

### 8.1 Subscription, payment and accounting records are different views of the same event

A subscription application describes what the customer is entitled to receive and what should be billed. A payment provider describes attempted and successful transactions. Accounting records describe receivables, bank movements and reconciliation.

These records need to agree, but their status updates may arrive through different workflows or integrations.

For an Odoo-based solution, the relevant question is not whether Odoo has Accounting or bank reconciliation—it does. The question is whether the subscription operator can see the linked commercial, billing, payment and accounting evidence in one place when an exception occurs.

### 8.2 Integration errors can create stale or inconsistent states

Potential scenarios to investigate:

- A provider reports payment success but the invoice remains in an unpaid state.
- An invoice is corrected, but a downstream integration still holds the earlier total.
- A subscription is changed in one system, but the CRM or reporting view is not updated.
- A payment is received under a bank reference that does not match the invoice reference.
- An API callback is delayed or delivered more than once.

These scenarios should be tested against the actual Odoo/payment-provider setup before being described as existing defects.

### 8.3 Financial dashboards should distinguish different kinds of revenue

A useful finance view should not combine different measures into one ambiguous total.

At minimum, distinguish:

- Contracted or scheduled subscription value.
- Invoices generated.
- Payments received.
- Outstanding receivables.
- Overdue invoices.
- Credits, refunds and write-offs.
- Revenue recovered after a failed payment.

The exact accounting definition of revenue, such as recognised revenue versus cash collected, must be handled carefully. Cash collected is not automatically the same as accounting revenue recognised in a period.

### 8.4 Auditability means explaining how a number was produced

A financial total is more useful when the team can trace it back to its underlying records.

A useful evidence trail may include:

- Accepted quotation or subscription terms.
- Subscription changes and their effective dates.
- Pricing and discount rules used.
- Invoice calculation and invoice identifier.
- Payment-provider reference.
- Reconciliation result.
- Manual adjustments and approvals.

Chargebee already provides events and activity logs for changes to subscriptions, customers and invoices. The opportunity is therefore to investigate a concise, end-to-end evidence view that ties these records together in the Odoo workflow.

---

## 9. Potential Opportunities for Recurly

The following opportunities are hypotheses for further team discussion. They are not final product decisions.

### Opportunity 1: Subscription-to-Invoice Integrity Check

**Underlying problem:** An invoice may not reflect the approved subscription terms for the relevant billing period.

**Why it matters:** Incorrect or missing charges can cause lost revenue, disputes, rework and customer dissatisfaction.

**What existing software provides:** Odoo, Stripe, Chargebee and Zoho all provide recurring billing and invoice functionality. Odoo also provides subscription products, recurring price rules, discounts and accounting.

**Potential improvement:** Check each invoice against the approved subscription, effective dates, quantities, add-ons, discount validity, tax settings and prior invoices before it is sent.

**Potential first demonstrator:** A deterministic pre-invoice rule checker that identifies mismatches and explains the reason.

**Feasibility:** High for basic checks using the hackathon's subscription, line-item, pricing, discount and invoice data. More complex tax and proration cases require carefully defined rules.

### Opportunity 2: Unified Subscription Exception Queue

**Underlying problem:** Exceptions can require staff to search through subscriptions, invoices, payment records, provider responses and accounting entries.

**Why it matters:** Slow or incorrect resolution can create duplicate-charge risk, service interruption, unpaid invoices and unnecessary support work.

**What existing software provides:** Odoo has an exception state for certain payment failures; Stripe provides payment events and recovery tools; Chargebee and Zoho provide dunning and activity/history capabilities.

**Potential improvement:** Present exceptions in one prioritised queue with the customer, subscription, invoice, transaction, current status, reason and next safe action.

**Potential first demonstrator:** Detect a failed payment or a subscription stuck in exception and show the related invoice and transaction evidence in one record.

**Feasibility:** High for a controlled Odoo demonstration. Live gateway integration and reliable transaction verification add complexity.

### Opportunity 3: Reconciliation Review with Evidence

**Underlying problem:** Some incoming payments may not be matched confidently to an invoice, especially when offline transfers or unclear references are involved.

**Why it matters:** Unmatched payments make receivables less reliable and delay collection follow-up.

**What existing software provides:** Odoo Accounting has matching rules and reconciliation models. Zoho Billing documents automatic matching of supported online payments. Other billing platforms also provide payment records and transaction reporting.

**Potential improvement:** Suggest likely invoice matches and show the evidence and confidence behind each suggestion, leaving ambiguous cases for human approval.

**Potential first demonstrator:** Import a sample bank CSV and suggest matches using amount, date, reference and customer. Do not automatically post ambiguous matches.

**Feasibility:** Medium. A CSV-based demonstration is achievable; production bank feeds, payment-provider diversity and partial/batch payments require more work.

### Opportunity 4: Explainable Billing Timeline for Customers and Staff

**Underlying problem:** A customer or staff member may see an invoice total without an easy explanation of how it changed.

**Why it matters:** Confusing charges can generate disputes and support requests.

**What existing software provides:** Customer portals and subscription history are already available in the reviewed products.

**Potential improvement:** Show a clear timeline of plan changes, quantities, add-ons, discounts, taxes, credits and the resulting amount due.

**Potential first demonstrator:** For one subscription, display the original quote, a plan change and the resulting invoice calculation.

**Feasibility:** Medium to high for a controlled workflow where the system stores the change history and effective dates.

### Opportunity 5: Discount and Margin Guardrails

**Underlying problem:** A discount can reduce the final selling price below a business's intended margin threshold.

**Why it matters:** A discount may increase sales while reducing or eliminating contribution margin.

**What existing software provides:** The reviewed platforms provide discounts, coupons, pricing rules and subscription changes. This research does not establish that they all lack margin controls.

**Potential improvement:** Use Brightloop's required product sales price and cost price to calculate estimated margin before a discount is approved. Flag exceptions according to an administrator-defined threshold.

**Potential first demonstrator:** Calculate the post-discount amount and estimated margin for a product or subscription line and require approval below a configurable threshold.

**Feasibility:** High for simple product-level calculations. Accurate subscription profitability may require allocation of service, support, tax and infrastructure costs.

### Opportunity 6: Cross-System Subscription State Check

**Underlying problem:** Subscription, payment-provider and accounting records may not always reflect the same state after callbacks, retries or manual amendments.

**Why it matters:** Stale statuses can lead to repeated follow-ups, incorrect dashboards or unsafe payment actions.

**What existing software provides:** Odoo, Stripe and Chargebee expose integrations, events and record histories. This analysis does not prove a general absence of synchronisation features.

**Potential improvement:** Compare relevant statuses and references across connected records and flag mismatches for investigation.

**Potential first demonstrator:** Simulate a small set of inconsistent subscription, invoice and payment states and show the discrepancies.

**Feasibility:** Medium. Depends on reliable access to records and events from each connected system.

### Opportunity comparison

Scores below are preliminary team judgements for a hackathon prototype, not measured market statistics. A higher score means a more attractive opportunity. Differentiation is deliberately rated cautiously where competitors already provide similar features.

| Opportunity | Business impact | Potential differentiation | Hackathon feasibility | Fit with challenge |
|---|---:|---:|---:|---:|
| Subscription-to-invoice integrity check | 5 | 4 | 5 | 5 |
| Unified subscription exception queue | 5 | 4 | 4 | 5 |
| Reconciliation review with evidence | 4 | 3 | 4 | 5 |
| Explainable billing timeline | 4 | 3 | 4 | 4 |
| Discount and margin guardrails | 4 | 3 | 5 | 5 |
| Cross-system subscription state check | 4 | 4 | 3 | 4 |

**Scoring note:** The figures are an initial prioritisation aid only. They should be revisited after the other team members complete real-world scenario, Odoo feasibility and innovation research.

---

## 10. Research Findings and Conclusions

### 10.1 What is already solved well by the market?

The reviewed products already support many core subscription operations:

- Recurring billing and invoice generation.
- Subscription plan and lifecycle management.
- Customer portals.
- Discounts and pricing changes.
- Payment collection.
- Failed-payment recovery and reminders.
- Subscription and financial reporting.
- Payment and accounting reconciliation capabilities.

Recurly should not claim these basic functions as unique innovations.

### 10.2 What problems appear more promising to investigate?

The most promising research direction is the operational gap between records and events across the commercial-to-cash lifecycle.

The business needs confidence that:

1. The customer agreed to a particular set of terms.
2. The active subscription reflects those terms.
3. The invoice reflects the correct terms for that billing period.
4. The payment outcome is accurately known.
5. The payment is matched to the correct invoice and accounting record.
6. Any exception is resolved safely and can be explained later.

This is a problem of integrity, traceability and exception resolution.

### 10.3 What should Recurly avoid claiming?

Based on this research, the following are not defensible as standalone unique features:

- Automated recurring invoices.
- A customer subscription portal.
- Payment reminders.
- Automatic payment retries.
- Basic payment reconciliation.
- Subscription status dashboards.
- Churn prediction by itself.
- An AI chatbot by itself.

Existing products already provide substantial versions of these capabilities.

### 10.4 Research questions for the next team discussion

Before finalising the product idea, the team should investigate:

1. Which billing discrepancies are most common in Brightloop's stated workflow?
2. Can approved quotation terms be reliably compared with the subscription and its generated invoice?
3. Which Odoo payment exceptions require manual work, and what evidence is available to resolve them safely?
4. How much of payment reconciliation can be handled by standard Odoo Accounting before any custom development is needed?
5. Can a small demonstrator show a measurable improvement without rebuilding Odoo's existing subscription, invoicing and accounting modules?
6. What specific workflow will Recurly improve better than a standard Odoo configuration?

### Conclusion

The subscription-management market is mature in core recurring billing and payment automation. A more defensible opportunity for Recurly is to investigate how a business can validate billing correctness, resolve subscription exceptions, connect payment evidence to invoices and explain financial changes across the subscription lifecycle.

The research does not establish that existing platforms cannot perform these tasks. It identifies specific workflows, documented manual steps and operational risks that deserve deeper testing in the Brightloop/Odoo context.

**No final product direction is selected by this document.** The findings should be combined with the team's other research before Recurly's unique value proposition and feature scope are decided.

---

## 11. References

### Odoo

1. [Odoo 19.0 — Subscriptions](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html) — subscription products, recurring plans, quotations and recurring pricing. Accessed 31 October 2026.
2. [Odoo 19.0 — Subscriptions and automatic payments](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html) — tokenisation, compatible payment providers and documented payment-failure exception handling. Accessed 31 October 2026.
3. [Odoo 19.0 — Close subscriptions](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/closing.html) — administrator and customer self-service closure. Accessed 31 October 2026.
4. [Odoo 19.0 — User portals](https://www.odoo.com/documentation/19.0/applications/general/users/user_portals.html) — portal user access. Accessed 31 October 2026.
5. [Odoo 19.0 — Bank reconciliation](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation.html) — matching rules and manual reconciliation. Accessed 31 October 2026.
6. [Odoo 19.0 — Reconciliation models](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation_models.html) — automated and manual reconciliation rules. Accessed 31 October 2026.

### Stripe

7. [Stripe Support — Billing customer portal](https://support.stripe.com/questions/billing-customer-portal) — customer portal features and documented limitations. Accessed 31 October 2026.
8. [Stripe Support — Payments recovered by Stripe](https://support.stripe.com/questions/payments-recovered-by-stripe?locale=en-GB) — saved-card updates, failed-payment emails and Smart Retries. Accessed 31 October 2026.

### Chargebee

9. [Chargebee Docs — Dunning in subscriptions](https://www.chargebee.com/docs/payments/2.0/kb/payments/how-to-enable-dunning-in-subscriptions) — online and offline dunning. Accessed 31 October 2026.
10. [Chargebee Docs — Dunning v1](https://www.chargebee.com/docs/payments/2.0/dunning/dunning) — retries, exclusions and final actions. Accessed 31 October 2026.
11. [Chargebee Docs — Self-Serve Portal](https://www.chargebee.com/docs/billing/2.0/hosted-capabilities/self-serve-portal) — customer subscription and invoice actions. Accessed 31 October 2026.
12. [Chargebee Docs — Activity Log and subscription changes](https://www.chargebee.com/docs/billing/2.0/kb/platform/how-do-i-find-how-a-specific-change-was-made-to-a-customer-or-subscription-and-by-whom) — traceability of changes and their sources. Accessed 31 October 2026.
13. [Chargebee Docs — Invoice events](https://www.chargebee.com/docs/billing/2.0/kb/billing/where-can-we-check-events-related-to-invoice) — invoice event history. Accessed 31 October 2026.

### Zoho Billing

14. [Zoho Billing — Dunning Management](https://www.zoho.com/in/billing/help/settings/subscriptions/dunning-management.html) — configurable retries and documented retry limits. Accessed 31 October 2026.
15. [Zoho Billing — Customer Portal](https://www.zoho.com/in/billing/help/settings/customer-portal/customer-portal.html) — customer self-service. Accessed 31 October 2026.
16. [Zoho Billing — Subscription Reports](https://www.zoho.com/in/billing/help/reports/subscription-reports.html) — subscription lifecycle reporting. Accessed 31 October 2026.
17. [Zoho Billing — Automated invoice processing](https://www.zoho.com/in/billing/automated-invoice-processing/) — automated invoice workflows and online payment reconciliation. Accessed 31 October 2026.
18. [Zoho Billing — Payments received and offline payments](https://www.zoho.com/in/billing/help/invoice/payments-received.html) — recording offline payments against invoices. Accessed 31 October 2026.

### Industry research

19. [DigitalRoute — State of Monetization Infrastructure 2026](https://www.digitalroute.com/research/state-of-monetization-infrastructure-2026/) — survey of 631 senior leaders across six markets, conducted April–May 2026; updated 2 June 2026.
20. [DigitalRoute — The Year Customers Audited the Invoice](https://www.digitalroute.com/research/the-year-customers-audited-the-invoice/) — survey findings on billing errors, disputes and evidence readiness; updated 2 June 2026.
21. [DigitalRoute — From Usage to Revenue 2026](https://www.digitalroute.com/research/from-usage-to-revenue-2026/) — survey findings on usage invoice corrections, data quality and billing disputes; updated 2 June 2026.

---

**Research limitation:** Competitor products change frequently and capabilities vary by edition, country, payment provider and configuration. This is a desk-research snapshot, not hands-on testing of paid product accounts. All proposed market gaps should be validated against the exact Odoo edition and workflow used in the hackathon.
