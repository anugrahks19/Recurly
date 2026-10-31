# Problem Overview

## 1. Introduction

The **Subscription Management System** challenge asks for one unified software platform to manage the full life of a subscription business. The platform is intended to support the process from setting up products and plans through quotations, subscriptions, recurring invoices, payment recording, and revenue reporting.

The challenge describes the platform as the digital backbone of a company that earns money through recurring subscriptions rather than one-time sales.

## 2. Background: Brightloop Software

Brightloop Software is the example business used in the challenge. It sells products and services on a subscription basis, including:

- Business software billed monthly or yearly.
- Add-ons that customers can enable or disable.
- Products available in different variants.
- Plans for small businesses as well as yearly contracts for larger companies.

An administrator manages products, plans, taxes, and discounts. Internal staff handle day-to-day customer operations. Customers are expected to be able to view and manage their own subscriptions without needing to email the company for routine tasks.

## 3. Existing Subscription Management Workflow

The problem statement describes Brightloop's current process as largely manual:

| Area | Current approach |
|---|---|
| Customer subscriptions | Tracked in spreadsheets |
| Renewals | Remembered by employees |
| Invoices | Prepared manually each month |
| Payments | Matched to invoices by reviewing bank statements |
| Revenue reports | Compiled manually at the end of each quarter |

The challenge states that this leads to missed renewals, incorrect invoices, and difficulty determining the company's recurring revenue.

## 4. Problems Described in the Challenge

### 4.1 Subscription records are fragmented

Subscription information is maintained in spreadsheets rather than one unified system. This makes it difficult for the team to maintain and view reliable subscription records.

### 4.2 Renewals can be missed

Renewals depend on an employee noticing that a subscription is due. The process is not centrally scheduled or reliably automated.

### 4.3 Invoice preparation is manual

Invoices are typed up every month. This creates avoidable work and can lead to incorrect invoice details or totals.

### 4.4 Payment matching takes manual effort

Employees review bank statements and match incoming payments to invoices. This makes it difficult to identify paid and outstanding invoices quickly.

### 4.5 Revenue visibility is delayed

Revenue reports are manually prepared at quarter-end. The business cannot easily see its recurring revenue and payment position when needed.

### 4.6 Customer and staff operations need clear access boundaries

Administrators, internal staff, and customers need different levels of access. Customers should only see their own subscriptions and invoices, while staff should have limited operational access.

### 4.7 Billing operations must handle volume reliably

The challenge describes hundreds of subscriptions becoming due on a billing day and thousands of subscriptions being present in the system. Invoice processing must avoid duplicate or skipped billing, and pages should respond in under two seconds.

## 5. Expected System Capabilities

The problem statement describes the following expected capabilities.

### 5.1 Accounts and access control

- Customers can create accounts using an email address and password.
- Each email address can belong to only one account.
- Passwords must be longer than eight characters and include uppercase, lowercase, and special characters.
- Customers can request a password reset link by email.
- The system distinguishes administrators, internal staff, and customers.
- Only administrators can add staff members.

### 5.2 Product and plan management

- Administrators can create products with a name, type, sales price, cost price, and notes.
- Products can have variants that affect price.
- Plans define price, billing frequency, minimum quantity, and availability dates.
- Billing frequencies include daily, weekly, monthly, and yearly.
- Plans can support configured lifecycle options such as automatic closure, early closure, pause, and renewal.

### 5.3 Quotations and subscriptions

- Sales representatives can create offers from quotation templates.
- Templates can contain the relevant plan and product lines and have a validity period.
- Each subscription has its own number, customer, plan, start date, expiry date, and payment terms.
- Subscription lines contain product, quantity, unit price, taxes, and amount.
- The described lifecycle is Draft → Quotation → Confirmed → Active → Closed.

### 5.4 Invoicing and taxes

- Invoices are generated from subscriptions.
- Customer details, product lines, taxes, and totals are populated from subscription data.
- Taxes are calculated using administrator-configured rules.
- Invoices support Draft, Confirmed, and Paid states.
- Staff can confirm, cancel, send, or print invoices.
- Billing must not be duplicated or skipped.

### 5.5 Discounts

- Administrators can create fixed-amount or percentage discounts.
- Rules can define minimum purchase or quantity, start and end dates, and usage limits.
- Discounts can apply to selected products or entire subscriptions.
- Eligible discounts are applied to the next invoice automatically.
- Discounts stop applying when they expire or reach their usage limit.

### 5.6 Payment tracking

- Payments can be recorded with method, amount, date, and note.
- Each payment is associated with the relevant invoice.
- Staff can see which invoices are paid and which remain outstanding.
- Overdue invoices can be identified for follow-up.

### 5.7 Reporting and performance

- The finance view should show active subscriptions, revenue received, outstanding amounts, and overdue invoices.
- Users should be able to filter the information and view summaries.
- Pages should respond in under two seconds, including when the system contains thousands of subscriptions.

### 5.8 Customer self-service

- Customers have a portal to view and manage their own subscriptions.
- Customers can access their own invoices without contacting internal staff for routine visibility.

## 6. Stakeholders

### Administrator

The administrator controls the overall system. Responsibilities described in the challenge include managing products, plans, taxes, discounts, and staff accounts, as well as configuring plan and discount rules.

### Internal Staff

Internal staff handle day-to-day operations with limited access. Their activities include working with quotations, subscriptions, invoices, and payment records, and following up on outstanding invoices.

### Customers

Customers create and access their accounts and use a portal to see and manage their own subscriptions and invoices. They should not have access to other customers' information.

### Finance Lead

The finance lead reviews the business's subscription and financial position, including active subscriptions, revenue received, outstanding payments, and overdue invoices.

## 7. Overall Objective

The objective of the challenge is to replace Brightloop Software's disconnected, manual subscription processes with one unified system that supports the complete subscription lifecycle.

The system is expected to make subscription records easier to manage, automate recurring invoice creation, organise payment tracking, enforce role-based access, and provide timely revenue and outstanding-payment visibility—while remaining responsive at the scale described in the problem statement.

---

*Source: Odoo Hackathon problem statement, “Subscription Management System” (Brightloop Software scenario). This document summarises the challenge requirements; it does not represent a final product design or claim that any feature has been implemented.*
