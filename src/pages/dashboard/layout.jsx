import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard/DashboardLayout";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  getUserProfile,
  loadUserProfile,
  getAccounts,
  getDashboardInfo,
  getPortalNotifications,
  transactionHistory,
  updateSession,
} from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { DashboardContext } from "./context";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { openConfirmDialog } = useDialog();
  const [period, setPeriod] = useState("last3months");
  const [currency, setCurrency] = useState("");
  const [sessionExpiredShown, setSessionExpiredShown] = useState(false);

  // Instant Client Check: If user is not authenticated at all, redirect immediately without showing full-screen spinner
  const isAuthenticatedFlag =
    typeof window !== "undefined" &&
    localStorage.getItem("is_authenticated") === "true";

  if (!isAuthenticatedFlag) {
    return <Navigate to="/" replace />;
  }

  // 1. Session Protection Query: Check & Update User Session
  const {
    data: sessionResponse,
    isLoading: isLoadingSession,
    isError: isSessionError,
  } = useQuery({
    queryKey: ["userSession"],
    queryFn: () => updateSession(),
    staleTime: 60 * 1000, // 1 minute
    retry: false,
    refetchInterval: 2 * 60 * 1000, // Keep session alive every 2 minutes
  });

  const isSessionValid =
    sessionResponse?.status === "success" || sessionResponse?.statusCode === 0;

  // Handle Session Expiration with App's Consistent Dialog Popup
  useEffect(() => {
    if (
      !isLoadingSession &&
      (isSessionError || !isSessionValid) &&
      !sessionExpiredShown
    ) {
      setSessionExpiredShown(true);
      localStorage.removeItem("is_authenticated");
      openConfirmDialog({
        title: t("session_expired", "Session Expired"),
        description:
          sessionResponse?.message ||
          t("session_expired_desc", "Your session has expired or is invalid. Please sign in again to continue."),
        confirmText: t("authenticateSignIn", "Sign In"),
        iconType: "danger",
        hideCancel: true,
        onConfirm: () => {
          navigate("/", { replace: true });
        },
      });
    }
  }, [
    isLoadingSession,
    isSessionError,
    isSessionValid,
    sessionExpiredShown,
    sessionResponse,
    openConfirmDialog,
    navigate,
    t,
  ]);

  // 2. Profile & Accounts queries (Only executed if session is valid)
  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => loadUserProfile(),
    enabled: isSessionValid,
    retry: false,
  });

  const { data: accountsResponse } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: isSessionValid,
    retry: false,
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

  const { data: dashboardInfoResponse } = useQuery({
    queryKey: ["dashboardInfo", activeAccountId, period],
    queryFn: () => getDashboardInfo({ period, accountId: activeAccountId }),
    enabled: isSessionValid && !!activeAccountId,
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      getPortalNotifications({ custType: profile?.custType || "C" }),
    enabled: isSessionValid && !!profile,
  });

  const { data: transactionsResponse } = useQuery({
    queryKey: ["transactions", activeAccountId],
    queryFn: () =>
      transactionHistory({
        pageSize: 10,
        pageNum: 1,
        accountId: activeAccountId,
      }),
    enabled: isSessionValid && !!activeAccountId,
  });

  // 3. Loading State (Only for authenticated users while verifying profile data)
  if (isLoadingSession || (isSessionValid && isLoadingProfile)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0f1829]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("verifying_session", "Verifying Dashboard Session...")}
          </p>
        </div>
      </div>
    );
  }

  // 4. Protection Fallback Check
  if (
    isSessionError ||
    !isSessionValid ||
    isProfileError ||
    (!isLoadingProfile && !profile)
  ) {
    return <Navigate to="/" replace />;
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
