# Innovation Opportunities for Recurly

## 1. Introduction

Recurly is a four-member Odoo Hackathon project for Brightloop Software. The team is still exploring ideas; this document does not select a final solution or feature set.

Brightloop's immediate problems are missed renewals, incorrect or missing invoices, manual payment matching, and delayed reporting. The required subscription platform remains the baseline. Innovation should make a difficult business decision or exception easier, rather than simply add CRUD screens or an AI chatbot.

**Research date:** 31 October 2026. **Scope:** desk research using project documents and official vendor sources; no customer interviews, production data, or hands-on competitor testing.

## 2. Innovation Research Methodology

### Project documents inspected first

- [README.md](../README.md): research stage, four-member team, no final technology choice.
- [Problem overview](../docs/problem-overview.md): official challenge summary and stakeholders.
- [Current problems](../docs/current-problems.md): operational pain and consequences.
- [Existing solutions](../docs/Existingsolutions.md): initial competitor comparison.
- [Requirements](../docs/requirements.md): functional, security, reliability, and performance needs.

The requirements document includes implementation details such as partial payments. These are useful project requirements, but do not automatically establish new official challenge requirements. The previously supplied official problem statement is the authority if documents disagree.

### Research and evidence rules

1. Check Odoo, Stripe, Chargebee, and Zoho before calling an idea new.
2. Prefer official documentation; identify marketing claims separately.
3. Separate **documented limitations** from **proposed improvement hypotheses**.
4. Score the narrow demo described here, not an imagined enterprise product.
5. Use synthetic data for demonstrations and label it clearly.
6. Treat absence from reviewed documentation as unknown, not proof that a competitor lacks a feature.

This is a targeted comparison, not a complete market survey. Edition, region, version, configuration, and account access can change feature availability. No numerical business-benefit claims are made.

## 3. Potential Innovation Areas

Each area answers the same ten questions. "Difference" is a hypothesis to validate, not a claim of market uniqueness.

### 3.1 Revenue Leakage Detection

1. **Problem:** A billable subscription period has no invoice, or a charge is lower than the agreed terms.
2. **Who:** Finance lead and billing staff.
3. **Importance:** Work may be delivered without the expected billing.
4. **Existing solutions:** Odoo already generates recurring invoices; Chargebee provides revenue and leakage-related analytics. [R1](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html), [R8](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/chargebee-analytics)
5. **Remaining limitation:** Odoo documents payment exceptions that suspend scheduled actions pending manual verification. This is a specific workflow gap, not evidence that Odoo generally misses invoices. [R2](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html)
6. **Difference:** Show expected versus actual billing, the exact missing period, evidence, owner, and next action.
7. **Data:** Subscription dates, billing rules, agreed prices, invoice lines, cancellations, and exceptions.
8. **Approach:** Deterministic period checks and comparisons; AI is unnecessary.
9. **Hackathon demo:** Yes. Seed a missing invoice and show it alongside correctly excluded paused/closed cases.
10. **Dependencies/risks:** Billing eligibility, grace periods, credits, and proration must be defined. A warning is potential exposure, not recovered revenue.

### 3.2 Intelligent Payment Recovery

1. **Problem:** Failed payments stay unpaid because the appropriate follow-up is unclear.
2. **Who:** Collections staff and customers.
3. **Importance:** Recoverable payment problems can interrupt subscriptions.
4. **Existing solutions:** Stripe Smart Retries, Chargebee Smart Dunning, and Zoho dunning already automate recovery. [R5](https://docs.stripe.com/billing/revenue-recovery/smart-retries), [R7](https://www.chargebee.com/docs/payments/2.0/kb/payments/smart-and-manual-dunning-management), [R10](https://www.zoho.com/in/billing/help/settings/subscriptions/dunning-management.html)
5. **Remaining limitation:** Stripe documents non-retryable situations, including hard declines and India-issued cards; a retry cannot solve every failure. [R5](https://docs.stripe.com/billing/revenue-recovery/smart-retries)
6. **Difference:** Explain whether to wait, request a payment update, or assign a staff task; coordinate with the provider's existing retry schedule.
7. **Data:** Failure reason, payment method, attempt history, provider status, and due amount.
8. **Approach:** Rules-based decision tree; let the payment provider execute eligible retries.
9. **Hackathon demo:** Yes, using simulated failure events and suggested actions; real recovery improvement cannot be proven.
10. **Dependencies/risks:** Gateway access, mandates, regional restrictions, duplicate retries, and customer notification consent.

### 3.3 Subscription Health Monitoring

1. **Problem:** Staff cannot quickly identify subscriptions needing attention.
2. **Who:** Customer-success and account-management staff.
3. **Importance:** Problems may remain invisible until renewal or escalation.
4. **Existing solutions:** Odoo 18 documents contract-health automation; Chargebee reports subscription and customer-success metrics. [R3](https://www.odoo.com/documentation/18.0/applications/sales/subscriptions/automatic_alerts.html), [R8](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/chargebee-analytics)
5. **Remaining limitation:** Health automation already exists. Whether staff need clearer reasons or prioritisation requires user validation.
6. **Difference:** Display separate billing, renewal, and engagement signals with visible reasons and data freshness.
7. **Data:** Overdue balances, renewal dates, payment failures; optional usage/support data.
8. **Approach:** Explainable rules with editable thresholds.
9. **Hackathon demo:** Yes. Show healthy, overdue, and renewal-risk examples.
10. **Dependencies/risks:** Billing health is not customer satisfaction or churn probability. Missing usage data must be marked unknown.

### 3.4 Predictive Churn Analysis

1. **Problem:** Customers may cancel before the team takes action.
2. **Who:** Customer-success staff and business leaders.
3. **Importance:** Retaining suitable customers supports recurring business.
4. **Existing solutions:** Chargebee markets AI-driven churn signals; Zoho reports churn-related analytics. [R9](https://www.chargebee.com/solutions/usecases/churn-management/), [R11](https://www.zoho.com/de-de/billing/help/reports/zia-insights.html)
5. **Remaining limitation:** Vendor claims do not establish accuracy for Brightloop. Brightloop has no supplied labelled churn dataset.
6. **Difference:** Eventually connect interpretable risk factors to reviewable interventions.
7. **Data:** Historical customer snapshots, cancellations, tenure, payments, usage, and intervention outcomes.
8. **Approach:** Start with rules; consider logistic regression after collecting representative labels.
9. **Hackathon demo:** A risk-screen prototype is possible; a credible validated predictive model is not supported by current data.
10. **Dependencies/risks:** Cold start, class imbalance, future-information leakage, bias, and misleading accuracy claims.

### 3.5 Profitability-Aware Discount Management

1. **Problem:** An attractive discount may leave too little contribution after costs.
2. **Who:** Admin, sales representative, and finance lead.
3. **Importance:** Higher sales do not necessarily mean healthier margins.
4. **Existing solutions:** Odoo already calculates sales margins and applies discounts; marketplace margin-control extensions also exist. [R4](https://www.odoo.com/documentation/19.0/applications/sales/sales/sales_quotations/margin.html), [R14](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/prices/discounts.html), [R18](https://apps.odoo.com/apps/modules/19.0/sale_margin_block_pro)
5. **Remaining limitation:** Margin arithmetic and approval blocks are not novel. A subscription-period view using Brightloop's cost assumptions remains a hypothesis.
6. **Difference:** Preview discounted contribution over several billing periods, show assumptions, and require admin approval below a chosen threshold.
7. **Data:** Product/variant prices, cost basis, quantities, discount duration, and optional service/payment costs.
8. **Approach:** Transparent calculator and approval rule; no predictive AI required.
9. **Hackathon demo:** Yes. Compare two offers and explain why one crosses a configured threshold.
10. **Dependencies/risks:** Cost must use the same period as revenue. Product cost alone is not full SaaS profitability; exclude taxes collected from contribution revenue.

### 3.6 Automated Payment Reconciliation

1. **Problem:** Staff manually match statement entries to invoices.
2. **Who:** Finance and payment-operations staff.
3. **Importance:** Incorrect allocation creates inaccurate balances and unnecessary collection messages.
4. **Existing solutions:** Odoo Accounting matches transactions; Stripe supports bank-transfer reconciliation; Zoho Books provides reconciliation. [R6](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation.html), [R12](https://support.stripe.com/questions/bank-transfer-reconciliation?locale=en-GB), [R13](https://www.zoho.com/us/books/help/banking/reconciliation.html)
5. **Remaining limitation:** Stripe explicitly leaves unmatched transfers for manual reconciliation. Zoho Books is a separate accounting product, not proof of identical Zoho Billing functionality. [R12](https://support.stripe.com/questions/bank-transfer-reconciliation?locale=en-GB), [R13](https://www.zoho.com/us/books/help/banking/reconciliation.html)
6. **Difference:** Explain candidate matches and send ambiguous transfers to review rather than guessing.
7. **Data:** Statement reference, payer, amount, date, currency, and invoice balances.
8. **Approach:** Exact reference matching first; then ranked candidates and human approval.
9. **Hackathon demo:** Yes, with a CSV containing exact, partial, ambiguous, and unmatched payments.
10. **Dependencies/risks:** Duplicate imports, split payments, fees, and wrong-customer matches. Matching heuristics are not calibrated probabilities.

### 3.7 Billing Discrepancy Detection

1. **Problem:** An invoice exists but its quantity, price, variant adjustment, tax, or discount is wrong.
2. **Who:** Billing staff and customers.
3. **Importance:** Errors create disputes, underbilling, and loss of trust.
4. **Existing solutions:** Established billing engines calculate invoices; Odoo documents discount behaviour that depends on how the discount is applied. [R14](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/prices/discounts.html)
5. **Remaining limitation:** Odoo's global discount line does not automatically change when products are added or removed. This is specific behaviour, not a universal billing defect. [R14](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/prices/discounts.html)
6. **Difference:** Compare a draft invoice with its agreed subscription snapshot and explain each difference before sending.
7. **Data:** Agreed terms, effective dates, invoice lines, tax/discount versions, and authorised amendments.
8. **Approach:** Independent checks and a line-by-line difference view.
9. **Hackathon demo:** Yes. Detect an expired discount or missing variant adjustment.
10. **Dependencies/risks:** Legitimate amendments and rounding can cause false alerts. Posted documents need proper correction workflows.

### 3.8 Revenue Forecasting

1. **Problem:** Finance cannot see likely future billing or collection timing.
2. **Who:** Finance lead and business leadership.
3. **Importance:** Planning requires visibility into upcoming obligations and uncertainty.
4. **Existing solutions:** Chargebee documents expected revenue; Zoho Billing supports forecasting analysis. [R15](https://www.chargebee.com/docs/billing/2.0/kb/reports-and-analytics/how-to-find-what-is-the-expected-revenue-for-the-current-monthdaily), [R11](https://www.zoho.com/de-de/billing/help/reports/zia-insights.html)
5. **Remaining limitation:** Chargebee's calculation depends on configurable inclusions. A forecast's definition and assumptions matter as much as its chart. [R15](https://www.chargebee.com/docs/billing/2.0/kb/reports-and-analytics/how-to-find-what-is-the-expected-revenue-for-the-current-monthdaily)
6. **Difference:** Show scheduled billing separately from assumption-based cash scenarios, with a subscription-level breakdown.
7. **Data:** Renewal schedule, prices, discounts, expiry dates, due terms, and payment history.
8. **Approach:** Schedule projection first; statistical cash forecasting only with sufficient history.
9. **Hackathon demo:** Yes for clearly labelled scenarios, not validated predictive accuracy.
10. **Dependencies/risks:** Uncertain renewals, missing history, and confusion between cash, MRR, invoices, and recognised revenue.

### 3.9 Customer Billing Transparency

1. **Problem:** Customers cannot easily understand a changed invoice.
2. **Who:** Customers and support staff.
3. **Importance:** Clear explanations may reduce avoidable billing questions.
4. **Existing solutions:** Stripe provides a customer portal; Odoo supports subscription self-service. [R16](https://docs.stripe.com/customer-management), [R1](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html)
5. **Remaining limitation:** Portal availability alone does not prove that customers understand changes. Chargebee's add-on restrictions are configuration/scenario-specific, not a blanket lack of support. [R17](https://www.chargebee.com/docs/billing/2.0/kb/billing/can-i-purchase-one-time-addon-for-a-subscription-from-the-customer-portal)
6. **Difference:** Explain "what changed since last bill" using quantity, variant, discount expiry, and tax changes.
7. **Data:** Current/prior invoice snapshots and effective subscription changes.
8. **Approach:** Deterministic change summaries and an authorised upcoming-bill preview.
9. **Hackathon demo:** Yes. Show a discount expiring and its impact on the next bill.
10. **Dependencies/risks:** Customer isolation, concurrent changes, and previews being mistaken for final invoices.

### 3.10 Intelligent Exception Resolution

1. **Problem:** Staff see errors but lack a clear sequence for resolving them.
2. **Who:** Billing staff and administrators.
3. **Importance:** Unresolved exceptions can delay billing and collections.
4. **Existing solutions:** Odoo documents manual payment-exception handling; Zoho advertises workflow and AI assistance. [R2](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html), [R19](https://www.zoho.com/us/billing/features/ai-features/)
5. **Remaining limitation:** Odoo requires payment verification before clearing an exception to avoid double charging. [R2](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html)
6. **Difference:** An evidence-backed case with owner, suggested next step, prerequisites, approval, and resolution history.
7. **Data:** Subscription, invoice, payment/provider state, exception reason, and action log.
8. **Approach:** Small runbooks and a state machine; optional AI only drafts explanations.
9. **Hackathon demo:** Yes. Demonstrate two cases, including an unknown payment outcome requiring verification.
10. **Dependencies/risks:** Never clear exceptions or charge customers solely on an AI recommendation; stale evidence and races must block unsafe actions.

### 3.11 Subscription Lifecycle Anomaly Detection

1. **Problem:** Subscription state conflicts with dates, plan rules, or billing events.
2. **Who:** Operations staff and administrators.
3. **Importance:** Invalid transitions can cause billing or service mistakes.
4. **Existing solutions:** Odoo supports lifecycle automation; Zoho offers report anomaly analysis. [R1](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html), [R11](https://www.zoho.com/de-de/billing/help/reports/zia-insights.html)
5. **Remaining limitation:** Report anomalies and record-level lifecycle invariants are different checks; the reviewed sources do not establish market absence of the latter.
6. **Difference:** Explain contradictions such as billing after an effective closure or an active record without a next billing date.
7. **Data:** Transition history, plan permissions, effective dates, invoices, and pause/renewal rules.
8. **Approach:** State-transition validation and scheduled invariant checks.
9. **Hackathon demo:** Yes. Seed invalid records and legitimate exceptions.
10. **Dependencies/risks:** Define plan availability versus subscription expiry, pause semantics, migration exceptions, and time zones first.

### 3.12 AI-Assisted Financial Insights

1. **Problem:** Finance spends time interpreting reports and finding contributing records.
2. **Who:** Finance lead and administrators.
3. **Importance:** Explanations may help focus investigation.
4. **Existing solutions:** Zoho explicitly markets AI summaries, anomaly detection, forecasting, and a conversational assistant; Chargebee provides analytics. [R19](https://www.zoho.com/us/billing/features/ai-features/), [R8](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/chargebee-analytics)
5. **Remaining limitation:** These are existing capabilities; a chatbot or narrative summary has low differentiation. Vendor marketing is not evidence of Brightloop-specific accuracy.
6. **Difference:** Generate a short summary whose every numerical claim links to a reproducible query and supporting records.
7. **Data:** Authorised aggregates, metric definitions, record links, and freshness timestamps.
8. **Approach:** Calculate in code, then optionally use an LLM for wording; templates remain a fallback.
9. **Hackathon demo:** Yes for grounded summaries; no credible autonomous financial advisor.
10. **Dependencies/risks:** Hallucinations, confidential data exposure, prompt injection, model availability, and response latency.

### 3.13 Additional Opportunity: Billing Change Simulation

1. **Problem:** A new rule may affect many subscriptions before staff understand its impact.
2. **Who:** Admin and finance lead.
3. **Importance:** Preventing a bad configuration change can avoid many exceptions.
4. **Existing solutions:** Stripe test clocks and Chargebee Time Machine already simulate billing events. [R20](https://docs.stripe.com/billing/testing), [R21](https://apidocs.chargebee.com/docs/api/time_machines)
5. **Remaining limitation:** Simulation itself is established. Whether a business-facing before/after comparison is useful requires testing.
6. **Difference:** Preview affected subscriptions and estimated charges when a discount or plan rule changes.
7. **Data:** Versioned configuration, sample subscriptions, effective dates, and expected outcomes.
8. **Approach:** Read-only sandbox calculation with a controllable clock.
9. **Hackathon demo:** Yes for one rule and a few billing periods.
10. **Dependencies/risks:** The simulation must use the real billing rules, remain isolated, and never claim complete tax or payment-provider fidelity.

## 4. Existing Market Solutions

| Platform | Comparable capabilities checked | Implication for Recurly |
|---|---|---|
| Odoo | Recurring subscriptions, quotations, portal, payment exceptions, accounting reconciliation, sales margins, discounts; contract-health automation documented in version 18. [R1](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html), [R2](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html), [R3](https://www.odoo.com/documentation/18.0/applications/sales/subscriptions/automatic_alerts.html), [R4](https://www.odoo.com/documentation/19.0/applications/sales/sales/sales_quotations/margin.html), [R6](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation.html), [R14](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/prices/discounts.html) | Strong extension candidate. Do not rebuild these features just to claim innovation. Verify the hackathon version and installed modules. |
| Stripe | Smart Retries, portal, bank-transfer reconciliation, billing simulations. [R5](https://docs.stripe.com/billing/revenue-recovery/smart-retries), [R12](https://support.stripe.com/questions/bank-transfer-reconciliation?locale=en-GB), [R16](https://docs.stripe.com/customer-management), [R20](https://docs.stripe.com/billing/testing) | Recovery and payments are mature categories. Provider-aware workflow may be more realistic than a competing retry engine. |
| Chargebee | Smart Dunning, RevenueStory, expected revenue, configurable portal add-ons, Time Machine; predictive churn is also marketed. [R7](https://www.chargebee.com/docs/payments/2.0/kb/payments/smart-and-manual-dunning-management), [R8](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/chargebee-analytics), [R9](https://www.chargebee.com/solutions/usecases/churn-management/), [R15](https://www.chargebee.com/docs/billing/2.0/kb/reports-and-analytics/how-to-find-what-is-the-expected-revenue-for-the-current-monthdaily), [R17](https://www.chargebee.com/docs/billing/2.0/kb/billing/can-i-purchase-one-time-addon-for-a-subscription-from-the-customer-portal), [R21](https://apidocs.chargebee.com/docs/api/time_machines) | Analytics, retention, and simulation are not unexplored categories. Confirm package access before comparing implementation scope. |
| Zoho | Dunning, Zia report analysis, and marketed AI billing assistance; bank reconciliation is documented separately in Zoho Books. [R10](https://www.zoho.com/in/billing/help/settings/subscriptions/dunning-management.html), [R11](https://www.zoho.com/de-de/billing/help/reports/zia-insights.html), [R13](https://www.zoho.com/us/books/help/banking/reconciliation.html), [R19](https://www.zoho.com/us/billing/features/ai-features/) | Anomaly detection, forecasting, and an AI assistant alone provide little differentiation. |

The initial project competitor document is background, not independent proof of weaknesses. This research does not repeat its portal pricing or coupon-limit observations as universal current facts.

## 5. Identified Improvement Opportunities

The most credible hypotheses concern **how staff verify and resolve a specific problem**:

| Ordinary automation | Potentially useful improvement | Evidence still needed |
|---|---|---|
| Generate invoices | Independently verify every eligible period was billed | Do staff miss exceptions after standard automation? |
| Show an error | Present evidence, owner, prerequisites, and a resolution path | Does this reduce investigation time? |
| Apply a discount | Explain multi-period contribution and approval consequences | Is cost data reliable enough? |
| Display an invoice | Explain changes from the previous bill | Can customers answer billing questions without support? |
| Match a payment | Explain candidates and decline ambiguous matches | Does review remain accurate and faster? |

These are workflow differentiation hypotheses, not proven competitive advantages. Leakage, discrepancy detection, and lifecycle checks overlap: do not count the same incident or monetary amount three times.

## 6. Technical Feasibility

### Extend Odoo where practical

If the event provides suitable Odoo modules and allows custom add-ons, reuse products, customers, sales/quotation records, subscriptions, invoices, taxes, payments, portal access, and accounting workflows. Explore a small add-on for checks, evidence, and review actions.

Do not presume a particular edition, deployment, API, or module licence is available. The reviewed Odoo 19 documentation explicitly excludes daily subscription billing, while the challenge requires daily billing. [R1](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html) Confirm the event environment and evaluate an extension or alternative implementation before assuming full baseline coverage.

Odoo 18 contract-health documentation is historical evidence of comparable functionality, not proof that the event's version exposes the same interface. [R3](https://www.odoo.com/documentation/18.0/applications/sales/subscriptions/automatic_alerts.html)

### A manageable four-person validation exercise

This is an optional experiment structure, not an architecture decision:

- Member 1: map requirements and prepare reproducible data cases.
- Member 2: investigate Odoo extension access and implement one narrow check.
- Member 3: build the evidence/review screen.
- Member 4: verify calculations, permissions, edge cases, and demo timing.

Use seeded ordinary and faulty records. Compare detection against known expected results; track false alerts, review steps, and time to resolve. Demonstrated correctness on fixtures does not prove real revenue uplift or predictive accuracy.

For scale, evaluate a declared workload such as 5,000 synthetic subscriptions and hundreds of due invoices. Run checks in batches, paginate evidence, index lookups, and measure page response under stated hardware and concurrency. Treat the official under-two-second target as something to test, not an achievement already established.

## 7. Innovation Evaluation Matrix

### Scoring methodology

All seven criteria use **1 = weakest and 5 = strongest**. Intermediate scores represent the midpoint between the anchors.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Business impact (BI) | Cosmetic benefit | Useful operational gain | Directly protects a central Brightloop revenue process |
| Problem severity (PS) | Occasional inconvenience | Recurring friction | Failure can cause missed/wrong billing or unreliable balances |
| Market differentiation (MD) | Already standard | Specific workflow hypothesis beyond baseline | Strongly validated unmet need |
| Technical feasibility (TF) | Major unresolved technical barriers | Several integrations/rules | Straightforward with known data and methods |
| Hackathon feasibility (HF) | Not credibly demonstrable | Narrow prototype possible | Small, clear end-to-end demonstration |
| Data availability (DA) | Missing representative/labelled data | Requires external inputs | Core operational fields available or easily seeded |
| Official relevance (OR) | Outside challenge | Adjacent enhancement | Directly addresses an explicit requirement/problem |

Scores are analyst judgments, not measured outcomes. **Data availability refers to a demonstrator**: synthetic records are acceptable for rules, but cannot validate a trained prediction model. Technical feasibility concerns engineering complexity; hackathon feasibility additionally considers four-person delivery and limited time. Event duration and team skills are unconfirmed.

Total = sum of seven scores, maximum 35. Equal weighting is transparent but subjective; retain the individual scores. No idea receives a differentiation score above 3 because no unmet need has been validated through interviews or competitor trials. AI earns no automatic credit.

| Opportunity | BI | PS | MD | TF | HF | DA | OR | Total /35 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Revenue leakage detection | 5 | 5 | 3 | 4 | 5 | 5 | 5 | 32 |
| Intelligent payment recovery | 5 | 5 | 2 | 3 | 3 | 3 | 4 | 25 |
| Subscription health monitoring | 4 | 3 | 2 | 5 | 5 | 4 | 4 | 27 |
| Predictive churn analysis | 4 | 3 | 2 | 2 | 2 | 1 | 3 | 17 |
| Profitability-aware discounts | 4 | 4 | 3 | 4 | 5 | 4 | 5 | 29 |
| Automated payment reconciliation | 5 | 5 | 2 | 3 | 4 | 3 | 5 | 27 |
| Billing discrepancy detection | 5 | 5 | 3 | 4 | 5 | 5 | 5 | 32 |
| Revenue forecasting | 4 | 3 | 2 | 4 | 4 | 3 | 4 | 24 |
| Customer billing transparency | 4 | 3 | 2 | 5 | 5 | 5 | 5 | 29 |
| Intelligent exception resolution | 5 | 5 | 3 | 3 | 4 | 4 | 5 | 29 |
| Lifecycle anomaly detection | 4 | 4 | 3 | 4 | 5 | 5 | 5 | 30 |
| AI-assisted financial insights | 3 | 3 | 1 | 3 | 4 | 4 | 4 | 22 |
| Billing change simulation | 4 | 4 | 2 | 3 | 4 | 4 | 4 | 25 |

### Why these scores differ

- Leakage and discrepancies directly address skipped and incorrect billing using core records. Their novelty remains moderate.
- Lifecycle checks are easy to demonstrate, but legitimate exceptions need careful rules.
- Discount evaluation uses the required cost-price field; broader service costs remain uncertain.
- Transparency scores well for delivery and relevance, not uniqueness.
- Exception resolution has strong relevance but must coordinate state across records and possibly a provider.
- Reconciliation has direct impact, but real statements and ambiguous matching increase difficulty.
- Recovery depends on provider data and mandates; a simulated decision tree is easier than a functioning recovery service.
- Forecasting can project schedules, but realistic cash predictions need history.
- Churn prediction is constrained by missing labels and validation data.
- AI insights are already marketed by competitors and add grounding, privacy, and latency work.
- Simulation is established elsewhere and requires a reliable billing foundation.

Totals do not decide the product. If differentiation receives double weight, leakage/discrepancy checks remain stronger hypotheses than a generic AI summary; no candidate gains evidence of uniqueness. If Odoo access or reliable cost data is absent, reassess feasibility before using these rankings.

## 8. Highest-Potential Opportunities

These are **candidates for the next research experiment**, not an approved feature set.

| Candidate | Why investigate | Small demonstration | Decision gate |
|---|---|---|---|
| Leakage/discrepancy checks | Closest to explicit missed/wrong billing pain | Expected-versus-actual invoice comparison | Can rules distinguish a real error from a valid exception? |
| Lifecycle anomaly checks | Uses core subscription records | Explain a date/state contradiction | Are transition and pause rules agreed? |
| Guided exception resolution | Makes a documented operational exception concrete | Evidence, owner, verification, resolution history | Can staff resolve it without risking another charge? |
| Discount contribution preview | Connects required discounts with required cost fields | Compare two offers across periods | Are cost basis and approval policy meaningful? |
| Billing-change explanations | Easy to understand in a customer portal | Explain an expired discount | Do users understand the change without assistance? |

Test one narrow scenario before committing to a direction. Recovery, reconciliation, and forecasting remain viable alternatives if the required integrations/data are available. Predictive churn should remain exploratory until representative history exists.

## 9. Risks and Dependencies

| Risk/dependency | Practical response |
|---|---|
| Baseline work overwhelms innovation | Reuse permitted platform capabilities; validate one small improvement. |
| Odoo edition/version or daily-billing mismatch | Verify installed features and event rules early; document gaps. |
| Ambiguous billing rules | Agree pause, expiry, renewal, proration, tax ordering, rounding, and discount stacking. |
| Stale or incomplete evidence | Show snapshot time and unknown data; recheck before an action. |
| Incorrect financial changes | Preview and approve; preserve posted records and use proper accounting corrections. |
| Duplicate events or retries | Deduplicate events, use idempotent operations, and coordinate retry ownership. Stripe documents duplicate and unordered webhook delivery. [R22](https://docs.stripe.com/webhooks) |
| Inflated opportunity totals | Separate missing billing, outstanding receivables, cash collected, and confirmed corrections. |
| AI invents explanations | Compute amounts outside the model and link supporting records; provide template fallback. |
| Customer data exposure | Enforce server-side permissions; keep cost/margin details internal. |
| Unrealistic performance claims | Measure the complete page path under a stated workload; show freshness for cached results. |
| Synthetic data looks like business evidence | Label all demo fixtures; do not report synthetic recovery or churn accuracy as real results. |

## 10. Research Conclusions

Core subscriptions, recurring invoices, portals, dunning, and analytics are established capabilities. Adding AI does not make those categories unique.

The strongest initial research hypotheses address a specific unanswered operational question: **What went wrong, what evidence supports it, and what should an authorised person do next?** Explainable checks, guided review, and transparent billing changes appear more demonstrable with Brightloop's stated data than a validated churn model.

This research does not finalise Recurly's solution, architecture, stack, or feature set. Next steps are to verify the hackathon environment, clarify billing rules, and test one candidate with representative scenarios and user feedback.

## 11. References

All external sources below were checked on 31 October 2026. Vendor documentation describes capabilities and constraints, not independent proof of effectiveness. Marketing pages are labelled. Project sources are linked in Section 2.

- **R1:** [Odoo 19 — Subscriptions and recurring-plan constraints](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions.html). Core workflows and exclusion of daily subscription billing.
- **R2:** [Odoo 19 — Subscriptions and automatic payments](https://www.odoo.com/documentation/19.0/applications/sales/subscriptions/automatic_payments.html). Payment exceptions and manual verification.
- **R3:** [Odoo 18 — Automation rules](https://www.odoo.com/documentation/18.0/applications/sales/subscriptions/automatic_alerts.html). Contract-health actions; version-specific evidence.
- **R4:** [Odoo 19 — Margins](https://www.odoo.com/documentation/19.0/applications/sales/sales/sales_quotations/margin.html). Cost-based sales margins and pricelist effects.
- **R5:** [Stripe — Automate payment retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries). Smart Retries, failure constraints, and payment-method ordering.
- **R6:** [Odoo 19 — Bank reconciliation](https://www.odoo.com/documentation/19.0/applications/finance/accounting/bank/reconciliation.html). Matching, partial amounts, and manual reconciliation.
- **R7:** [Chargebee — Smart and Manual Dunning Management](https://www.chargebee.com/docs/payments/2.0/kb/payments/smart-and-manual-dunning-management). Retry options and plan-specific availability.
- **R8:** [Chargebee — RevenueStory](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/chargebee-analytics). Revenue, retention, and customer-success analytics.
- **R9:** [Chargebee — Churn management](https://www.chargebee.com/solutions/usecases/churn-management/). Marketing claim of AI-driven risk signals; not an accuracy benchmark.
- **R10:** [Zoho Billing — Dunning Management](https://www.zoho.com/in/billing/help/settings/subscriptions/dunning-management.html). Recovery settings and payment-method-specific behaviour.
- **R11:** [Zoho Billing — Zia Insights](https://www.zoho.com/de-de/billing/help/reports/zia-insights.html). Anomaly, contribution, comparative, and forecasting analysis; edition/access restrictions.
- **R12:** [Stripe — Bank transfer reconciliation](https://support.stripe.com/questions/bank-transfer-reconciliation?locale=en-GB). Automatic matching and manual fallback.
- **R13:** [Zoho Books — Reconciliation](https://www.zoho.com/us/books/help/banking/reconciliation.html). Accounting-product capability, distinguished from Zoho Billing.
- **R14:** [Odoo 19 — Discounts](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/prices/discounts.html). Line/global discounts and changes to order lines.
- **R15:** [Chargebee — Expected revenue calculations](https://www.chargebee.com/docs/billing/2.0/kb/reports-and-analytics/how-to-find-what-is-the-expected-revenue-for-the-current-monthdaily). Configurable expected-revenue components.
- **R16:** [Stripe — Customer portal](https://docs.stripe.com/customer-management). Customer subscription/account self-service.
- **R17:** [Chargebee — One-time add-ons in the customer portal](https://www.chargebee.com/docs/billing/2.0/kb/billing/can-i-purchase-one-time-addon-for-a-subscription-from-the-customer-portal). Supported configurations and scenario restrictions.
- **R18:** [Odoo Apps — Sales Margin Block PRO](https://apps.odoo.com/apps/modules/19.0/sale_margin_block_pro). Third-party vendor listing, not core Odoo documentation or an independently tested capability.
- **R19:** [Zoho Billing — AI features](https://www.zoho.com/us/billing/features/ai-features/). Marketing descriptions of conversational assistance, summaries, forecasting, and anomalies.
- **R20:** [Stripe — Test your Billing integration](https://docs.stripe.com/billing/testing). Test-clock simulations.
- **R21:** [Chargebee API — Time Machine](https://apidocs.chargebee.com/docs/api/time_machines). Test-site simulation of billing events.
- **R22:** [Stripe — Webhooks](https://docs.stripe.com/webhooks). Duplicate-event handling and event ordering.
