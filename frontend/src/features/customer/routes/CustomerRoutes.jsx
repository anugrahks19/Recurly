import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CustomerLayout } from '../components/CustomerLayout.jsx';
import { Dashboard } from '../pages/Dashboard.jsx';
import { Plans } from '../pages/Plans.jsx';
import { PlanDetails } from '../pages/PlanDetails.jsx';
import { Checkout } from '../pages/Checkout.jsx';
import { Subscriptions } from '../pages/Subscriptions.jsx';
import { SubscriptionDetails } from '../pages/SubscriptionDetails.jsx';
import { Billing } from '../pages/Billing.jsx';
import { Invoices } from '../pages/Invoices.jsx';
import { Payments } from '../pages/Payments.jsx';
import { PaymentMethods } from '../pages/PaymentMethods.jsx';
import { Notifications } from '../pages/Notifications.jsx';
import { Profile } from '../pages/Profile.jsx';
import { Support } from '../pages/Support.jsx';

export function CustomerRoutes() { return <Routes><Route element={<CustomerLayout />}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<Dashboard />} /><Route path="plans" element={<Plans />} /><Route path="plans/:planId" element={<PlanDetails />} /><Route path="checkout/:planId" element={<Checkout />} />
  <Route path="subscriptions" element={<Subscriptions />} /><Route path="subscriptions/:subscriptionId" element={<SubscriptionDetails />} />
  <Route path="billing" element={<Billing />} /><Route path="invoices" element={<Invoices />} /><Route path="payments" element={<Payments />} /><Route path="payment-methods" element={<PaymentMethods />} />
  <Route path="notifications" element={<Notifications />} /><Route path="profile" element={<Profile />} /><Route path="support" element={<Support />} />
  </Route><Route path="*" element={<Navigate to="/customer/dashboard" replace />} /></Routes>; }
