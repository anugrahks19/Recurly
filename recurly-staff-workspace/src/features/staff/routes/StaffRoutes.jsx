import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { StaffLayout } from '../components/StaffLayout.jsx';
import { StaffHome } from '../pages/StaffHome.jsx';
import { ManageCustomers } from '../pages/ManageCustomers.jsx';
import { DiscountsQueries } from '../pages/DiscountsQueries.jsx';
import { NewQuotation } from '../pages/NewQuotation.jsx';
import { ReachAdmin } from '../pages/ReachAdmin.jsx';

// Mount under /staff/* in the unified router, behind ProtectedRoute role="staff".
export function StaffRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
    <Route path="/staff" element={<StaffLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StaffHome />} />
      <Route path="customers" element={<ManageCustomers />} />
      <Route path="discounts-queries" element={<DiscountsQueries />} />
      <Route path="quotations" element={<NewQuotation />} />
      <Route path="reach-admin" element={<ReachAdmin />} />
    </Route>
    <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
  </Routes>;
}
