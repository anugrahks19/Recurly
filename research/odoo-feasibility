# Odoo Feasibility Study

**Project:** Recurly (Subscription Management System for Brightloop Software)
**Status:** Exploratory research. No architecture or technology stack has been chosen.
**Last updated:** 31 October 2026

## How to read this document

Every finding carries a confidence marker so the team knows what to trust and what to re-check before relying on it.

| Marker | Meaning |
|---|---|
| ✅ | Confirmed in official Odoo documentation retrieved during this research |
| ⚠️ | Version-dependent, or only seen in third-party sources (Odoo Apps Store listings, vendor sites). Re-check against the Odoo version you actually target |
| ❓ | Not verified in this research. Do not rely on it until checked |

Official documentation changes between versions, and several pages retrieved here were for specific versions (16.x, 17.0, 18.x, 19.x). Where that matters, the version is named.

---

## 1. Research Objective

Understand what Odoo already provides for subscription businesses, so that Recurly can focus on genuine gaps instead of rebuilding standard features.

**Questions this study tries to answer**

1. Which parts of the Brightloop problem statement are covered natively by Odoo?
2. Which parts need configuration, extension or custom development?
3. Which "improvement ideas" (revenue leakage, failed payment recovery, health scoring, etc.) are already solved, and which are open opportunities?
4. What constraints (edition, version, limits) could affect the decision?

**Scope limits**

- No implementation code, architecture or stack decisions are made here.
- The team documents `README.md`, `docs/problem-overview.md`, `docs/current-problems.md`, `docs/Existingsolutions.md` and `docs/requirements.md` were **not available** to the author of this study. The requirements used here come directly from the hackathon problem statement PDF. Cross-check against `docs/requirements.md` before using the comparison tables.

**Odoo version used by the hackathon:** ❓ **Unknown.** The problem statement does not name a version, and no official hackathon page confirming one was found. Do not assume a feature exists in your target version. Confirm with the organisers.

---

## 2. Overview of Odoo Subscription Management

Odoo handles subscriptions through the **Subscriptions** app, which works together with Sales, Invoicing, CRM and Helpdesk. ✅

How the model works in the documentation retrieved (versions 17 to 19):

- A **recurring plan** defines how often a customer is billed (the billing period). ✅
- A **subscription product** is a product flagged as a subscription, with a recurring price. ✅
- A **sales order that has a recurring plan automatically becomes a subscription.** ✅ In other words, a subscription is a sales order, not a separate record, in these versions. Older versions used a separate subscription record, so the model differs by version. ⚠️
- A **scheduled action** creates the invoice when today's date reaches the subscription's "Date of Next Invoice". ✅ (17.0 documentation)
- Subscriptions can be created manually, from the Sales or Subscriptions apps, or automatically through online (eCommerce) sales. ✅

**Edition constraint:** Several third-party sources state that the Subscriptions app is an **Odoo Enterprise** app and is not part of Community. ⚠️ This should be confirmed on Odoo's own pricing and edition pages. It is the single most important feasibility question because it decides whether native Subscriptions can be used at all.

---

## 3. Existing Odoo Modules

| # | Area | Odoo module or feature | What it does for Recurly | Edition note |
|---|---|---|---|---|
| 1 | Subscriptions | Subscriptions app (`sale_subscription` is the technical name seen on Apps Store dependencies) ⚠️ | Recurring plans, subscription products, renewals, upsells, MRR reporting | Reported Enterprise-only ⚠️ |
| 2 | Sales | Sales app, quotations, quotation templates | Quotations and confirmed orders. Subscriptions can be created in both Sales and Subscriptions ✅ | Community and Enterprise ⚠️ |
| 3 | Invoicing / Accounting | Invoicing and Accounting apps | Customer invoices, taxes, payments, bank reconciliation ✅ | Invoicing in both; full Accounting reported as Enterprise ⚠️ |
| 4 | CRM | CRM app | Integrates with Subscriptions according to the Subscriptions documentation ✅. Pipeline details not researched ❓ | Community and Enterprise ⚠️ |
| 5 | Payment Providers | Payment providers framework | Online payments; tokenization for automatic charging ✅ | Provider-specific |
| 6 | Customer Portal | Portal (General settings) | Customers pay, manage saved payment methods and self-serve plan actions ✅ | Portal reported as Enterprise in old comparisons only. Verify ❓ |
| 7 | Product Variants | Variants setting in Sales | Attributes and values with extra prices ✅ | Both |
| 8 | Automation | Scheduled Actions, Automated Actions | Scheduled actions drive billing ✅. Automated actions (rule-based triggers) not researched in depth ❓ | Both |
| 9 | Security | Groups, access rights (`ir.model.access`), record rules (`ir.rule`) | Role-based access ✅ | Both |
| 10 | Reporting | Subscriptions reports, accounting reports, pivot and graph views | MRR, ARR, churn, retention ✅ | Varies |

---

## 4. Native Functional Capabilities

### 4.1 Subscriptions (recurring plans and products)

| Capability | What Odoo provides | Confidence |
|---|---|---|
| Billing period | Set as a number plus a unit. The documented units are **weeks, months and years**. | ✅ |
| **Daily billing** | The **Days unit cannot be used** for subscription products. Daily recurrence is reserved for rentals, and the restriction exists to prevent orders that generate daily invoices. | ✅ (19.x docs) |
| Default plans | Common plans such as Monthly and Yearly are available by default. | ✅ |
| Align to Period Start | Optionally forces billing to the first day of the billing period. A mid-period purchase is invoiced at a reduced first amount. | ✅ |
| Custom period start dates | A start day such as "the 5th of every month" is **not available by default and requires custom development.** | ✅ |
| Automatic Closing | Number of days after which a subscription closes automatically if payment is not made. | ✅ |
| Customer self-service flags | Per plan: **Closable** (customer can close), **Renew** (customer can create a renewal quotation), **Add Products** (customer can change quantities or add products, which creates upsell quotations), **Optional Plans** (customer can switch plans). | ✅ |
| Plan-level pricing | A Pricing tab lets you set recurring prices per product and variant, optionally with a pricelist. These price rules take precedence over the product form price. | ✅ |
| Invoice email template | A template can be chosen per plan; the default is "Invoice: Sending". | ✅ |
| Subscription products | Product type is typically Service; physical goods are possible with the correct invoicing policy. | ✅ |
| Pause | Plan-level "pause" as stated in the problem statement was **not confirmed** in the documentation retrieved. | ❓ |

### 4.2 Sales and quotations

- Quotations can be created in the Sales app or the Subscriptions app. ✅
- Quotation templates exist and subscription plans were described in documentation as quotation templates specific to subscriptions (older 15.x/16.x era). ✅ ⚠️
- Renewals produce a **Renewal Quotation** (tagged as such); quantity changes produce **Upsell** quotations. ✅
- Subscription quotations must be confirmed, and payment from the customer is part of the activation flow. ✅
- Subscription status names and the sequence of states differ from Recurly's proposed Draft → Quotation → Confirmed → Active → Closed. The exact status values in your target version are ❓ and must be checked.

### 4.3 Invoicing and accounting

- Invoices are generated from subscriptions by a scheduled action, not typed by hand. ✅
- Invoices can be created from sales orders via the Create Invoices action. ✅
- Invoice states in Odoo are generally Draft, Posted and Paid-style payment states. How "Confirmed" in the problem statement maps to these is ❓ and should be checked.
- Tax engine, tax rules and tax reports: standard Odoo functionality, but not verified in this research. ❓

### 4.4 Payments and reconciliation

- Payment registration against invoices: standard Odoo, not researched in detail. ❓
- **Bank reconciliation** is documented as automatic where possible, matching transactions to invoices, bills and payments using field matching plus **reconciliation models**. ✅
- Three reconciliation model types exist: a write-off button, a suggestion of counterpart values, and **matching of existing invoices or bills**. ✅ An **Auto-validate** option can reconcile matches without a manual click. ✅
- Edition: third-party sources disagree on whether bank reconciliation is Enterprise-only. ⚠️ Verify.

### 4.5 Discounts

- Odoo has **Discount & Loyalty programs** under Sales > Products, enabled by a "Discounts, Loyalty & Gift Card" setting. ✅ (Odoo documentation repository)
- These programs are described as offering more varied, public and time-sensitive pricing than pricelists. ✅
- **Pricelists** handle discounts by currency, period, volume and customer. ✅
- Open questions that are **not confirmed**: whether a program automatically carries onto each recurring invoice of a subscription, whether per-program **usage limits** exist as the problem statement requires, and whether a program can target either specific products or a whole subscription. ❓ These are high-priority items to test in a trial database.

### 4.6 Product variants

- Variants are switched on in the Sales settings and built from attributes and values. ✅
- Each attribute value can carry an **extra price** that is added to the product price when selected. ✅ (documented as "Value Price Extra" in 13.0/14.0 documentation; the label may differ in newer versions ⚠️)
- This maps directly to the problem statement example (choosing the Odoo brand adds 560). ✅
- Recurring plan pricing supports variants directly. ✅

---

## 5. Automation and Integrations

### 5.1 Scheduled actions

| Item | Finding | Confidence |
|---|---|---|
| Billing | Two subscription-related scheduled actions handle invoicing recurring subscriptions and stopping billing when a subscription expires. | ✅ (17.0) |
| Trigger rule | An invoice is created when today's date equals the subscription's Date of Next Invoice. | ✅ |
| Frequency | Each scheduled action has an Execute Every field. Some scheduled actions are inactive by default and must be activated. | ✅ |
| Free subscriptions | A zero-value renewal logs a message and sends no email. | ✅ |
| Duplicate protection | A subscription flagged **Contract in exception** is skipped by scheduled actions to avoid double charging. | ✅ |

### 5.2 Automatic alerts (renewal and health rules)

Documented for versions 16.x. Behaviour in 17 to 19 may differ. ⚠️

- Alerts are configured under Subscriptions > Configuration > Alerts. ✅
- They can apply to a subscription template, customer or product, and can use conditions on **MRR, the rate of change of MRR and satisfaction rating**. ✅
- Triggers: on modification, or on a timed condition. ✅
- Actions: create next activity, set a tag, set a stage, **mark as To Renew**, send an email, send an SMS (SMS needs In-App Purchase credit). ✅
- A default alert targets less satisfied customers (rating below 50 percent) and creates a follow-up call task. ✅

### 5.3 Automatic payments and payment providers

| Item | Finding | Confidence |
|---|---|---|
| Automatic charging | Needs a payment provider that supports **tokenization** (saved card or bank details). | ✅ |
| Providers listed (documentation PR) | Adyen, Authorize.net, Flutterwave, Razorpay, Stripe, Xendit | ⚠️ (version-dependent) |
| Setup steps | Choose a tokenizing provider, enter API credentials, enable it, configure payment methods, configure tokenization. | ✅ |
| Customer setup | Customers add a payment method in the **customer portal** or at eCommerce checkout. | ✅ |
| **On failure** | The sales order gets a **Payment Failure** tag and the **Contract in exception** box is ticked. Scheduled actions stop for that subscription until someone manually checks the chatter to see whether the payment actually went through. | ✅ |
| Retry or dunning | No native retry schedule or staged dunning was found in the official documentation. A vendor site describes failed renewals as "sitting as unpaid invoices" in native Odoo, which is a vendor claim. | ⚠️ |

### 5.4 External integrations

- Payment providers integrate natively (see 5.3). ✅
- Bank synchronisation and statement import exist in the Accounting documentation. ✅ Edition and region availability ❓.
- Email and SMS are native (SMS via IAP credit). ✅
- Third-party modules exist for subscription dashboards (MRR, ARR, churn) and for failed-payment dunning. They are paid and often tied to a specific Odoo version and edition. ⚠️ They are evidence that gaps exist, not tools Recurly can rely on in a hackathon.

---

## 6. Access Control and Customer Portal

### 6.1 Access control mechanisms (developer documentation)

| Mechanism | Behaviour | Confidence |
|---|---|---|
| **Groups** (`res.groups`) | Users belong to groups; security is tied to groups. Groups can imply other groups. | ✅ |
| **Access rights** (`ir.model.access`) | Grant create, read, write and delete on a whole model. They are additive across groups. With no matching right, access is denied. An empty group means the right applies to every user, including portal and public users. | ✅ |
| **Record rules** (`ir.rule`) | Per-record conditions evaluated after access rights. They are default-allow unless a rule applies. | ✅ |
| Global vs group rules | **Global rules intersect** (they only restrict). **Group rules unify** (they can widen access within global bounds). Several global rules can accidentally remove all access. | ✅ |
| Field-level access | A field can be limited to groups. Restricted fields are removed from views and from field metadata. | ✅ |
| Bypass risks | `sudo()` and raw SQL skip access checks. | ✅ |

### 6.2 Mapping to Brightloop roles

| Brightloop role | Likely Odoo mapping | Confidence |
|---|---|---|
| Admin | Administrator group | ❓ (not researched in detail) |
| Internal staff | Internal user with limited app access rights | ❓ |
| Customer (portal) | Portal user, restricted to own records via standard portal record rules | ❓ standard behaviour, not verified here |

The rule "only the admin can add staff" and "customers see only their own data" need to be tested in a trial database. The backend enforcement point in Odoo is the access rights and record rules above, not the interface.

### 6.3 Customer portal

- Customers can add and manage payment methods in the portal. ✅
- Portal self-service is controlled per recurring plan: closing, renewing, adding products and switching plans (section 4.1). ✅
- Whether the portal shows each customer a clean overview of subscriptions and invoices, and password reset by email, were not researched. ❓
- Third-party apps exist that add a customer dashboard to the portal, suggesting the standard portal is fairly basic. ⚠️

---

## 7. Reporting and Financial Visibility

### 7.1 Native subscription reports (16.x documentation)

Located under Subscriptions > Reporting. ⚠️ Menu names and metrics may differ in later versions.

| Report | Content | Confidence |
|---|---|---|
| Subscriptions analysis | Pivot/graph with measures such as MRR, quantity, recurring price, yearly recurring revenue, count | ✅ |
| Revenue KPIs | MRR, net revenue, non-recurring revenue, revenue per subscription, ARR, lifetime value | ✅ |
| Retention | Retention progression since subscription start | ✅ |
| Salesperson dashboard | MRR, non-recurring revenue, modifications and non-recurring invoices per salesperson | ✅ |
| Churn | Logo churn (cancellation rate) and revenue churn (MRR loss rate) are defined | ✅ |

All can be filtered by subscription, company and sales team. ✅

### 7.2 Accounting visibility

- Invoice analysis and receivables views exist in Invoicing. Aged receivables and full financial reports are associated with the Accounting app and are reported to be Enterprise-heavy. ⚠️
- A unified single-screen dashboard of active subscriptions, revenue, payments and overdue invoices (the finance lead's wish) is **not a single native screen.** It requires combining several reports. Third-party dashboard modules exist for part of this. ⚠️

### 7.3 Performance requirement

The "every page under two seconds with thousands of subscriptions" requirement is about deployment and design, not a module feature. ❓ No documented Odoo guarantee was found. It must be measured.

---

## 8. Potential Feature Feasibility

**Classification key**

- **A.** Already supported natively
- **B.** Possible through configuration
- **C.** Possible by extending existing Odoo modules
- **D.** Requires custom module development
- **E.** Requires external integration or additional infrastructure

### 8.1 Problem statement requirements

| # | Requirement | Class | Notes |
|---|---|---|---|
| 1 | Recurring plans: monthly, yearly, weekly | A | Units are weeks, months, years ✅ |
| 2 | **Daily billing plan** | D | Days unit is blocked for subscription products ✅. Needs custom handling or a workaround |
| 3 | Plan min quantity and availability dates | ❓ | Not confirmed in retrieved docs |
| 4 | Auto-close, early close, renew per plan | A/B | Automatic closing, Closable, Renew options ✅. Admin choosing "plan by plan" fits |
| 5 | **Pause** | ❓ | Not confirmed |
| 6 | Quotation templates with validity days | A/B | Templates exist ✅. Validity setting not verified ❓ |
| 7 | Subscription number, lines, taxes | A | Standard sales order structure ⚠️ |
| 8 | **Draft → Quotation → Confirmed → Active → Closed** status flow | B/C | Odoo has its own status values. Mapping or custom statuses needed ❓ |
| 9 | Auto-generated invoices, no duplicates | A | Scheduled action and exception flag ✅ |
| 10 | Product variants with price extras | A | Value extra price ✅ |
| 11 | Automatic tax calculation from rules | A | Standard tax engine ❓ (unverified here) |
| 12 | Discount rules with min purchase, dates, usage limit | B/C | Discount & Loyalty programs exist ✅. Usage limit and recurring-invoice behaviour ❓ |
| 13 | Admin-only discount creation | B | Via access rights ✅ |
| 14 | Record payments with method, amount, date, note | A | Standard payment registration ❓ |
| 15 | Paid vs outstanding, overdue view | A/B | Invoice and receivable views ❓. Edition dependent ⚠️ |
| 16 | Password rules (over 8 chars, upper, lower, special) | ❓ | Odoo has password policy settings; complexity coverage not verified |
| 17 | Reset link by email | A | Standard login flow ❓ (not verified here) |
| 18 | Roles: admin, staff, customer portal | A/B | Groups, access rights, record rules ✅ |
| 19 | Single dashboard for finance lead | C/D | Combine reports; custom dashboard for a unified view |
| 20 | Pages under 2 seconds at thousands of records | ❓ | Deployment dependent |

### 8.2 Candidate improvements for Recurly

| # | Improvement | Class | What exists natively | What is missing |
|---|---|---|---|---|
| 1 | **Revenue leakage detection** (active subscriptions that are not being billed, missed periods, expired-but-still-active) | D | MRR reports show revenue ✅; "Contract in exception" shows stuck billing ✅ | No documented check that compares expected billings with issued invoices. Would need a scheduled check and exception report |
| 2 | **Billing discrepancy detection** (invoice amount differs from subscription lines, tax or discount) | D | Invoices are generated from subscription lines ✅ | No documented comparison between subscription expectations and posted invoices |
| 3 | **Failed payment recovery** | C/D, E | Failure tag and exception flag ✅; email and portal card update ✅ | No documented retry schedule or staged dunning. Vendors sell this as an add-on ⚠️. Provider-side retry logic is E |
| 4 | **Smart payment reconciliation** | A (rule-based), D/E (beyond rules) | Reconciliation models with auto-validate ✅ | Fuzzy or learned matching beyond configured rules would be custom, or external (AI/OCR) |
| 5 | **Subscription health scoring** | B (simple), D (composite) | Alerts on MRR change and satisfaction rating ✅ | A single score combining payment behaviour, usage, tickets and trend does not exist |
| 6 | **Discount profitability validation** | C/D | Products have cost price ✅ (problem statement); pricelist docs mention margins ⚠️ | A rule that blocks or flags a discount that pushes margin below a threshold, including recurring invoices, was not found |
| 7 | **Renewal alerts** | B | Alerts with Mark as To Renew, activities, emails ✅ | Quality of lead-time and escalation rules depends on version ⚠️ |
| 8 | **Financial intelligence dashboards** | A (basics), D (custom unified view) | MRR, ARR, churn, retention reports ✅; third-party dashboards exist ⚠️ | One-screen view combining subscriptions, revenue, payments, overdue and leakage indicators |

---

## 9. Native vs Custom Development Comparison

| Area | Native (use as is) | Configuration | Extension of existing modules | Custom development | External or extra |
|---|---|---|---|---|---|
| Recurring plans (weekly/monthly/yearly) | ✔ | | | | |
| Daily plans | | | | ✔ | |
| Custom billing day (e.g. the 5th) | | | | ✔ | |
| Subscription statuses as defined by Brightloop | | ✔ | ✔ | maybe | |
| Recurring invoice generation | ✔ | | | | |
| Variant price extras | ✔ | | | | |
| Discounts (basic) | ✔ | ✔ | | | |
| Discount usage limits and auto-expiry on recurring invoices | | | ❓ | ❓ | |
| Tax calculation | ✔ | ✔ | | | |
| Payments and reconciliation (rule-based) | ✔ | ✔ | | | |
| Automatic card charging | | ✔ | | | ✔ (provider) |
| Payment retry and dunning | | | ✔ | ✔ | ✔ (provider) |
| Roles and portal access | ✔ | ✔ | | | |
| Standard MRR, ARR, churn reports | ✔ | | | | |
| Unified finance dashboard | | | ✔ | ✔ | |
| Leakage and discrepancy detection | | | | ✔ | |
| Health scoring | | ✔ (basic) | | ✔ (composite) | |

---

## 10. Technical Constraints

| # | Constraint | Detail | Confidence |
|---|---|---|---|
| 1 | **Edition** | Subscriptions is reported as Enterprise-only; much of full Accounting is also reported as Enterprise. If the hackathon expects Community, native Subscriptions may not be available. | ⚠️ Verify first |
| 2 | **Version** | Hackathon version unknown. Model structure, menu names and report names differ between versions (for example, subscriptions as separate records in older versions vs sales orders with a recurring plan in newer ones). | ❓ |
| 3 | **No daily billing** | Days unit is blocked for subscription products. | ✅ |
| 4 | **Fixed billing day** | Custom period start days require custom development. | ✅ |
| 5 | **Failed payment handling** | Failure freezes the subscription ("Contract in exception") until a person checks manually. | ✅ |
| 6 | **Tokenizing providers only** | Auto-charging works only with providers that support tokenization. | ✅ |
| 7 | **SMS** | Needs In-App Purchase credit. | ✅ |
| 8 | **Security bypass** | `sudo()` and raw SQL skip access rights and record rules. Custom code must be careful. | ✅ |
| 9 | **Global record rules** | Multiple global rules can remove all access by accident. | ✅ |
| 10 | **Third-party modules** | Often paid, version-specific and edition-specific. Risky for a hackathon deliverable. | ⚠️ |
| 11 | **Performance** | No documented guarantee for the two-second target. Must be tested with seeded data. | ❓ |

---

## 11. Opportunities for Recurly

Based on gaps found, these are areas where Recurly could add value beyond standard Odoo. They are hypotheses to test, not decisions.

1. **Billing integrity layer.** Detect leakage and discrepancies by comparing what each subscription should have billed against what was invoiced. Odoo prevents duplicate billing through its exception flag, but no native check for skipped or wrong invoices was found.
2. **Failed payment recovery.** Replace the manual "check the chatter" step with a retry schedule, staged reminders and a card-update link. Vendors already sell this, which confirms demand.
3. **Unified finance cockpit.** One screen with active subscriptions, revenue, payments received, amount outstanding and overdue invoices, matching the finance lead's scene.
4. **Subscription health score.** Combine payment behaviour, discount status, renewal proximity and MRR trend into one indicator. Odoo only offers rule-based alerts.
5. **Discount guardrails.** Validate profitability against cost price before a discount is applied, and expire or exhaust it automatically on recurring invoices.
6. **Plan flexibility.** Cover what the problem statement asks for and Odoo restricts: daily plans and custom billing days.
7. **Self-service polish.** Password rules, clean customer portal overview and renewal prompts.

**Risk to note:** if the hackathon expects a working Odoo module, Opportunities 1 to 5 are naturally "extend Odoo" tasks, and opportunities 6 and 7 are where native behaviour must be overridden or worked around.

---

## 12. Research Conclusions

1. **A large part of the Brightloop problem is already covered by Odoo Subscriptions** (recurring plans, invoice generation, renewals, upsells, automatic payment, MRR and churn reports), provided the edition and version allow it.
2. **Two problem statement requirements conflict with documented Odoo behaviour**: daily billing is blocked for subscription products, and custom billing days need custom development.
3. **Odoo's native weak spot is the failure path**: a failed automatic payment stops the subscription until someone manually checks. No native retry or dunning was found. This is the strongest candidate for genuine value.
4. **Reporting is split across many screens.** A single finance dashboard is not native.
5. **Detection features (leakage, discrepancy, discount profitability, health scoring) are not native** and would be custom work.
6. **Access control is well supported by Odoo's group, access right and record rule model**, which fits the three-role requirement.
7. **The two biggest unknowns are the Odoo edition and version.** Resolve these before anything else, because they decide whether Subscriptions can be used and which documentation applies.

**Suggested next checks (research only)**

1. Confirm edition and version with the hackathon organisers.
2. Spin up a trial database and verify the ❓ items: subscription statuses, pause, discount usage limits on recurring invoices, quotation validity, password complexity, payment states.
3. Compare this study against `docs/requirements.md` and update the tables.

---

## 13. Official References

Only pages actually retrieved are listed. Several pages are for different Odoo versions and languages, so confirm against your target version.

**Odoo Subscriptions**
- Subscriptions overview and recurring plans (19.4): https://www.odoo.com/documentation/saas-19.4/es/applications/sales/subscriptions.html
- Subscriptions overview (19.1): https://www.odoo.com/documentation/saas-19.1/es/applications/sales/subscriptions.html
- Subscriptions overview (18.1): https://www.odoo.com/documentation/saas-18.1/es/applications/sales/subscriptions.html
- Scheduled actions (17.0): https://www.odoo.com/documentation/17.0/th/applications/sales/subscriptions/scheduled_actions.html
- Automatic payments (18.4): https://www.odoo.com/documentation/saas-18.4/nl/applications/sales/subscriptions/automatic_payments.html
- Automatic alerts (16.4): https://www.odoo.com/documentation/saas-16.4/applications/sales/subscriptions/automatic_alerts.html
- Subscription reports (16.4): https://www.odoo.com/documentation/saas-16.4/applications/sales/subscriptions/reports.html

**Accounting and reconciliation**
- Bank reconciliation (master): https://www.odoo.com/documentation/master/applications/finance/accounting/bank/reconciliation.html

**Products and variants**
- Manage product variants (13.0): https://www.odoo.com/documentation/user/13.0/ecommerce/managing_products/variants.html

**Security**
- Security in Odoo (16.4): https://www.odoo.com/documentation/saas-16.4/developer/reference/backend/security.html
- Security in Odoo (17.1): https://www.odoo.com/documentation/saas-17.1/developer/reference/backend/security.html

**Odoo documentation repository (source of official pages)**
- Discount and loyalty programs: https://github.com/odoo/documentation/pull/4471/files
- Subscription automatic payments: https://github.com/odoo/documentation/pull/14955/files
- Subscription renewals: https://github.com/odoo/documentation/pull/14794/files

**Third-party material (context only, not authoritative)**
- Subscriptions Dashboard module: https://apps.odoo.com/apps/modules/19.0/codeerts_subscription_dashboard
- Dunning and smart retry module: https://ecosire.com/apps/odoo/odoo-subscription-dunning-smart-retry
- Community vs Enterprise comparison (Cybrosys): https://www.cybrosys.com/odoo/compare-odoo-community-vs-enterprise/
