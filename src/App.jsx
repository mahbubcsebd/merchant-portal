import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { welcomeApi } from '@/lib/api/endpoints';
import { globalDefaultParams } from '@/lib/api/api';

import { LanguageProvider } from '@/components/globals/LanguageProvider';

// Layouts
import RootAuthLayout from './pages/(root)/layout';
import DashboardLayout from './pages/dashboard/layout';

// Auth Pages
import Home from './pages/(root)/page';
import Enroll from './pages/(root)/enroll/page';
import ForgotPin from './pages/(root)/forgot-pin/page';

// Root Pages
import Contact from './pages/contact/page';
import Help from './pages/help/page';

// Dashboard Pages
import DashboardIndex from './pages/dashboard/page';
import DashboardAdmin from './pages/dashboard/admin/page';
import DashboardBranches from './pages/dashboard/branches/page';
import DashboardBusinessProfile from './pages/dashboard/business-profile/page';
import DashboardContact from './pages/dashboard/contact/page';
import DashboardHelp from './pages/dashboard/help/page';
import DashboardLiveTransactions from './pages/dashboard/live-transactions/page';
import DashboardManageCashiers from './pages/dashboard/manage-cashiers/page';
import DashboardPayBills from './pages/dashboard/pay-bills/page';
import DashboardPayBillsTemplates from './pages/dashboard/pay-bills/templates/page';
import DashboardReports from './pages/dashboard/reports/page';
import DashboardTransfer from './pages/dashboard/transfer/page';

function BootLoader({ children }) {
  const { isLoading } = useQuery({
    queryKey: ['welcome'],
    queryFn: async () => {
      const response = await welcomeApi();
      if (response && response.status === 'success') {
        // Automatically inject institutionID into all future API requests
        if (response.institutionID) {
          globalDefaultParams.institutionID = response.institutionID.toString();
        }
      }
      return response;
    },
    // We only need to fetch this once when the app loads
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0f1829]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading Merchant Portal...</p>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <BootLoader>
          <Routes>
            {/* Auth routes */}
            <Route element={<RootAuthLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/enroll" element={<Enroll />} />
              <Route path="/forgot-pin" element={<ForgotPin />} />
            </Route>

            {/* Other Root routes without auth layout */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />
              <Route path="admin" element={<DashboardAdmin />} />
              <Route path="branches" element={<DashboardBranches />} />
              <Route path="business-profile" element={<DashboardBusinessProfile />} />
              <Route path="contact" element={<DashboardContact />} />
              <Route path="help" element={<DashboardHelp />} />
              <Route path="live-transactions" element={<DashboardLiveTransactions />} />
              <Route path="manage-cashiers" element={<DashboardManageCashiers />} />
              <Route path="pay-bills" element={<DashboardPayBills />} />
              <Route path="pay-bills/templates" element={<DashboardPayBillsTemplates />} />
              <Route path="reports" element={<DashboardReports />} />
              <Route path="transfer" element={<DashboardTransfer />} />
            </Route>
          </Routes>
        </BootLoader>
      </LanguageProvider>
    </BrowserRouter>
  );
}
