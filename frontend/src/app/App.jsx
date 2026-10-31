import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth, homeForRole } from '../features/auth/AuthContext.jsx';
import { Landing } from '../features/public/Landing.jsx';
import { Login } from '../features/auth/Login.jsx';
import { Signup } from '../features/auth/Signup.jsx';
import { PasswordReset } from '../features/auth/PasswordReset.jsx';
import { CustomerRoutes } from '../features/customer/routes/CustomerRoutes.jsx';
import { CustomerProvider } from '../features/customer/hooks/useCustomer.jsx';
import AdminApp from '../features/admin/AdminApp.jsx';
import { StaffLayout } from '../features/staff/components/StaffLayout.jsx';
import { StaffDataProvider } from '../features/staff/components/StaffDataProvider.jsx';
import { StaffHome } from '../features/staff/pages/StaffHome.jsx';
import { ManageCustomers } from '../features/staff/pages/ManageCustomers.jsx';
import { DiscountsQueries } from '../features/staff/pages/DiscountsQueries.jsx';
import { NewQuotation } from '../features/staff/pages/NewQuotation.jsx';
import { ReachAdmin } from '../features/staff/pages/ReachAdmin.jsx';

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="loading-screen">Checking your session…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homeForRole[user.role] || '/'} replace />;
  return children;
}

export function App() {
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<PasswordReset />} />
    <Route path="/reset-password" element={<PasswordReset />} />
    <Route path="/account" element={<Navigate to="/customer/dashboard" replace />} />
    <Route path="/customer/*" element={<Protected role="user"><CustomerProvider><CustomerRoutes /></CustomerProvider></Protected>} />
    <Route path="/admin/*" element={<Protected role="admin"><AdminApp /></Protected>} />
    <Route path="/staff" element={<Protected role="staff"><StaffDataProvider><StaffLayout /></StaffDataProvider></Protected>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StaffHome />} />
      <Route path="customers" element={<ManageCustomers />} />
      <Route path="discounts-queries" element={<DiscountsQueries />} />
      <Route path="quotations" element={<NewQuotation />} />
      <Route path="reach-admin" element={<ReachAdmin />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
