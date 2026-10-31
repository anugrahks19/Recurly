# Current Problems in Brightloop's Subscription Management Process

Brightloop Software earns its money on subscriptions (monthly and yearly plans, add-ons, product variants). Today, almost every step of the subscription lifecycle is manual. This document lists the problems with the current process, why they matter, and what our system must do about each one.

## 1. Summary

| Area | How it works today | Core problem |
|---|---|---|
| Customer subscriptions | Tracked in a spreadsheet | No single source of truth |
| Renewals | Remembered by whoever notices first | Renewals get missed |
| Invoices | Typed up by hand every month | Slow and error-prone |
| Payments | Matched to invoices by scrolling through bank statements | Hard to know who has paid |
| Revenue reports | Built manually at the end of each quarter | No real-time visibility |

**Overall result:** renewals are missed, invoices go out wrong, and nobody can say how much recurring revenue the company actually has.

## 2. Detailed problems

### 2.1 Customer subscriptions tracked in a spreadsheet
- **Problem:** Subscription data lives in a spreadsheet that anyone can edit, with no validation, history or access control.
- **Consequences:**
  - Duplicate, outdated or inconsistent customer records
  - No clear status (draft, confirmed, active, closed) for each subscription
  - No audit trail of who changed what
  - Hard to search and filter as the customer base grows
  - Customers cannot view their own subscriptions, so they have to email the team
- **What we need:** A central database with unique subscription numbers, a defined status flow (Draft, Quotation, Confirmed, Active, Closed), role-based access and a customer portal.

### 2.2 Renewals remembered by whoever notices first
- **Problem:** There is no owner and no automated reminder for renewals.
- **Consequences:**
  - Missed renewals mean lost revenue
  - Customers get lapsed service or surprise charges
  - Inconsistent handling between team members
- **What we need:** Plans with rules for auto-close, early close, pause and renew, and automatic renewal handling based on expiry dates.

### 2.3 Invoices typed by hand every month
- **Problem:** Each invoice is created manually from the spreadsheet.
- **Consequences:**
  - Typing mistakes in amounts, quantities and customer details
  - Wrong tax calculations
  - Discounts forgotten or applied inconsistently
  - Invoices missed or sent twice, so customers are skipped or double billed
  - Hundreds of invoices on billing day take huge amounts of staff time
- **What we need:** Automatic invoice generation from each subscription, with customer details, product lines, taxes and totals pre-filled. Duplicate prevention. A clear status flow (Draft, Confirmed, Paid).

### 2.4 Taxes and discounts handled manually
- **Problem:** Tax rules and discount deals are applied by memory or by hand.
- **Consequences:**
  - Incorrect tax amounts, with possible compliance risk
  - Customers who were promised a discount do not get it, or keep it after it expires
  - No limit on how many times a discount is used
- **What we need:** Admin-defined tax rules calculated automatically. Admin-only discount rules (fixed or percentage, minimum purchase or quantity, start and end dates, usage limits) that appear on the next invoice on their own.

### 2.5 Payments matched by scrolling through bank statements
- **Problem:** The team must read bank statements line by line to work out which invoice a payment belongs to.
- **Consequences:**
  - Slow and error-prone reconciliation
  - Payments applied to the wrong invoice, or not at all
  - No quick answer to "has this customer paid?"
  - Overdue invoices are noticed late, so money is chased late or lost
- **What we need:** Payments recorded against a specific invoice (method, amount, date, note), plus a live view of paid versus outstanding invoices and overdue alerts.

### 2.6 Revenue reports built manually each quarter
- **Problem:** Reporting means collecting data from spreadsheets and statements by hand, only once a quarter.
- **Consequences:**
  - Answering basic questions takes days: how many subscriptions are active, how much revenue came in, how much is owed, which invoices are overdue
  - Decisions are made on stale or inaccurate numbers
  - Nobody can state the company's recurring revenue with confidence
- **What we need:** A dashboard with active subscriptions, revenue, payments and overdue invoices, with filters and summaries, loading in under 2 seconds even with thousands of records.

### 2.7 No access control or customer self-service
- **Problem:** Everyone works from the same spreadsheet, and customers have no way to see their own data.
- **Consequences:**
  - Risk of accidental or unauthorized changes
  - Staff time wasted answering "what is my plan?" and "where is my invoice?" emails
- **What we need:** Three roles (Admin, Internal staff, Customer) with strict permissions, enforced on the backend.

## 3. Root causes

1. **Everything is manual.** Data entry, invoicing, reconciliation and reporting all depend on people.
2. **No single source of truth.** Information is scattered across spreadsheets and bank statements.
3. **No automation or reminders.** Renewals, taxes, discounts and billing all rely on memory.
4. **No visibility.** There is no real-time view of subscriptions, payments or revenue.
5. **No controls.** There are no status rules, validation, permissions or audit trail.

## 4. Business impact

- **Lost revenue** from missed renewals and unchased overdue invoices
- **Billing errors** that damage customer trust
- **Wasted staff time** on repetitive manual work
- **Poor decision-making** due to slow, unreliable reporting
- **Scaling risk:** the manual process will break as the customer base grows

## 5. How our system addresses these problems

| Problem | Planned solution |
|---|---|
| Spreadsheet tracking | Central database with subscription lifecycle and status flow |
| Missed renewals | Plan rules for renew, pause and auto-close |
| Manual invoices | Auto-generated invoices with duplicate prevention |
| Wrong taxes and discounts | Rule-based tax calculation and automatic discount application |
| Payment matching | Payments recorded against invoices, with paid and outstanding views |
| Manual reporting | Real-time dashboard with filters and summaries |
| No access control | Role-based access and customer portal |
