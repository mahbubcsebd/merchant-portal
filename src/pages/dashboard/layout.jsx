import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard/DashboardLayout";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  getUserProfile,
  loadUserProfile,
  getAccounts,
  getDashboardInfo,
  getPortalNotifications,
  transactionHistory,
} from "@/lib/api/endpoints";

import { DashboardContext } from "./context";

export default function DashboardLayout() {
  const [period, setPeriod] = useState("last3months");
  const [currency, setCurrency] = useState("");

  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => loadUserProfile(),
  });

  const { data: accountsResponse, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
  });

  const profile = profileResponse?.data || null;
  const accounts = accountsResponse?.data || [];

  const defaultAccountId =
    accounts.length > 0 ? accounts[0].ACCOUNTNUMBER : null;
  const activeAccountId = currency || defaultAccountId;

  useEffect(() => {
    if (!currency && defaultAccountId) {
      setCurrency(defaultAccountId);
    }
  }, [defaultAccountId, currency]);

  useEffect(() => {
    if (profile) {
      console.log("Logged In User Profile Details:", profile);
    }
    if (accounts && accounts.length > 0) {
      console.log("Logged In User Accounts Details:", accounts);
    }
  }, [profile, accounts]);

  const { data: dashboardInfoResponse, isLoading: isLoadingDashboardInfo } =
    useQuery({
      queryKey: ["dashboardInfo", activeAccountId, period],
      queryFn: () => getDashboardInfo({ period, accountId: activeAccountId }),
      enabled: !!activeAccountId,
    });

  const { data: notificationsResponse, isLoading: isLoadingNotifications } =
    useQuery({
      queryKey: ["notifications"],
      queryFn: () =>
        getPortalNotifications({ custType: profile?.custType || "C" }),
      enabled: !!profile,
    });

  const { data: transactionsResponse, isLoading: isLoadingTransactions } =
    useQuery({
      queryKey: ["transactions", activeAccountId],
      queryFn: () =>
        transactionHistory({
          pageSize: 10,
          pageNum: 1,
          accountId: activeAccountId,
        }),
      enabled: !!activeAccountId,
    });

  const isLoading =
    isLoadingProfile ||
    isLoadingAccounts ||
    isLoadingDashboardInfo ||
    isLoadingNotifications ||
    isLoadingTransactions;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0f1829]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const dashboardInfo = dashboardInfoResponse || null;
  const notifications = notificationsResponse?.notifications || [];
  const transactions = transactionsResponse?.transactionHistories || [];

  return (
    <DashboardContext.Provider
      value={{
        profile,
        accounts,
        dashboardInfo,
        notifications,
        transactions,
        period,
        setPeriod,
        currency,
        setCurrency,
      }}
    >
      <DashboardLayoutComponent>
        <Outlet />
      </DashboardLayoutComponent>
    </DashboardContext.Provider>
  );
}
