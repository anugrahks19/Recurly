Subscription Management System
Project Name: Subscription Management System
Company: Brightloop Software

1. Introduction
The Subscription Management System is designed for Brightloop Software to manage its software products, subscription plans, customers, quotations, invoices, payments, and discounts through a single platform.

The system will help administrators and staff handle daily subscription operations while allowing customers to view and manage their own subscriptions and invoices.

It aims to reduce manual work, improve billing accuracy, and provide better visibility into subscription and financial activities.

2. Project Objectives
Manage software products and subscription plans.

Maintain customer and staff information.

Generate and manage quotations.

Track the complete subscription lifecycle.

Automatically generate invoices based on billing cycles.

Manage discounts and promotional offers.

Record payments and monitor outstanding amounts.

Provide a centralized financial dashboard.

Ensure secure, role-based access.

Maintain good performance even with thousands of subscriptions.

3. User Roles and Permissions
The system will support three main user roles.

Role	Permissions
Admin	Full access to all modules, settings, products, plans, users, subscriptions, discounts, invoices, payments, and reports.
Staff	Access to assigned daily operations, including customer records, quotations, subscriptions, invoices, and payments. Cannot add staff or access restricted administrative settings.
Customer	Can view and manage only their own subscriptions, invoices, and payment-related information.
Additional requirement: Only the Admin can create new staff accounts.

4. Functional Requirements
4.1 User Registration and Authentication
Users must be able to register and log in securely.

Each user must have a unique email address.

Passwords must contain more than 8 characters.

Passwords must include:

At least one uppercase letter.

At least one lowercase letter.

At least one special character.

Users must be able to reset forgotten passwords through email.

The system must provide role-based access after login.

Customers must not be able to access another customer's information.

4.2 Product Management
The Admin must be able to add, edit, view, and manage software products.

Each product should contain:

Product name.

Product type.

Sales price.

Cost price.

Description or notes.

Product variants.

Product Variants:

A product may have multiple variants.

Each variant can have a separate additional price.

Example: Selecting the Odoo brand variant may add ₹560 to the product price.

4.3 Subscription Plan Management
The Admin must be able to create and manage subscription plans.

Each plan should include:

Plan name.

Billing frequency.

Minimum quantity.

Availability start date.

Availability end date.

Associated products.

Pricing details.

Supported Billing Frequencies:

Daily.

Weekly.

Monthly.

Yearly.

The Admin must be able to:

Create and edit plans.

Pause and resume plans.

Close plans automatically or manually.

Close plans before their scheduled end date.

Renew plans when required.

4.4 Quotation Management
The system must allow users with appropriate permissions to create and manage quotations.

Requirements:

Create quotations using predefined templates.

Add multiple products and subscription plans.

Specify product quantities and prices.

Set quotation validity periods.

View and edit quotation details.

Convert an approved quotation into a subscription.

4.5 Subscription Management
The system must manage subscriptions throughout their lifecycle.

Subscription Lifecycle:

Draft → Quotation → Confirmed → Active → Closed

Each subscription must contain:

Subscription number.

Customer details.

Selected subscription plan.

Start date and end date.

Payment terms.

Subscription status.

Product and service lines.

Quantity.

Unit price.

Applicable taxes.

Total amount.

The system must allow authorized users to:

Create and update subscriptions.

View subscription details.

Confirm subscriptions.

Activate subscriptions.

Close subscriptions.

Track subscription status and renewal dates.

4.6 Automated Invoice Generation
The system must automatically generate invoices for subscriptions when their billing dates are due.

Requirements:

Identify subscriptions due for billing.

Generate invoices automatically according to the selected billing frequency.

Support bulk invoice generation for hundreds of subscriptions.

Automatically populate customer details.

Include product details, quantities, prices, and applicable taxes.

Calculate subtotal, discounts, taxes, and final amount.

Prevent duplicate invoice generation.

Ensure that no eligible billing cycle is accidentally missed.

Invoice Status:

Draft → Confirmed → Paid

Additional invoice operations:

View invoices.

Edit draft invoices.

Confirm invoices.

Cancel invoices when permitted.

Send invoices to customers.

Print or download invoices.

4.7 Discount Management
The Admin must be able to create and manage discount rules.

Supported discount types:

Fixed amount discount.

Percentage-based discount.

Each discount rule should include:

Discount name.

Discount type.

Discount value.

Minimum purchase amount.

Minimum quantity.

Start date and end date.

Usage limit.

Applicable products or subscriptions.

Requirements:

Apply discounts to selected products or entire subscriptions.

Automatically calculate eligible discounts.

Display applicable discounts on the next invoice.

Prevent discounts from being applied outside their validity period.

Track discount usage limits.

4.8 Payment Management
The system must allow authorized users to record and track customer payments.

Each payment should include:

Payment reference.

Customer details.

Linked invoice.

Payment method.

Payment amount.

Payment date.

Notes.

Requirements:

Record payments against invoices.

Track fully paid and partially paid invoices.

Calculate outstanding amounts.

Identify overdue invoices.

Maintain payment history.

Update invoice payment status when payments are recorded.

4.9 Finance Dashboard
The system must provide a centralized dashboard for monitoring subscription and financial activities.

The dashboard should display:

Total active subscriptions.

Total revenue.

Total payments received.

Outstanding payments.

Overdue invoices.

Subscription status overview.

Upcoming billing information.

Filtering Options:

Date range.

Subscription status.

Customer.

Invoice status.

Payment status.

The dashboard should present information clearly through summary cards, tables, and charts where appropriate.

5. Non-Functional Requirements
5.1 Performance
Every page should load within 2 seconds under normal operating conditions.

The system should support thousands of subscription records.

Bulk invoice generation should work efficiently for hundreds of subscriptions.

Database queries should be optimized to avoid unnecessary delays.

5.2 Security
Implement secure user authentication.

Store passwords securely using password hashing.

Enforce role-based access control.

Protect customer-specific information.

Validate user inputs.

Prevent unauthorized access to administrative operations.

5.3 Reliability
Prevent duplicate invoice generation.

Ensure accurate billing calculations.

Maintain consistency between subscriptions, invoices, and payments.

Handle billing operations without missing eligible subscriptions.

Provide appropriate error handling.

5.4 Usability
Provide a simple and user-friendly interface.

Use clear navigation and organized modules.

Display important information in an understandable format.

Make common operations easy to access.

5.5 Scalability
Support an increasing number of customers and subscriptions.

Handle growing invoice and payment records.

Allow future addition of products, plans, and features.

6. System Constraints
The system is intended for managing Brightloop Software's own software products and subscriptions.

Access to features depends on the user's assigned role.

Only Admin users can create staff accounts.

Customers must only access their own records.

Billing and discount calculations must follow the configured subscription and pricing rules.

7. Expected Outcome
The expected outcome is a centralized Subscription Management System that simplifies the management of software subscriptions, automates recurring billing, improves payment tracking, and provides clear financial insights.

The system should reduce manual administrative work, minimize billing errors, and offer a smooth experience for administrators, staff, and customers.

End of Requirements Document
