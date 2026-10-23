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

  // Check demo mode flag
  const isDemo =
    typeof window !== "undefined" &&
    localStorage.getItem("is_demo") === "true";

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
    enabled: !isDemo,
  });

  const isSessionValid =
    isDemo ||
    sessionResponse?.status === "success" ||
    sessionResponse?.statusCode === 0;

  // Handle Session Expiration with App's Consistent Dialog Popup
  useEffect(() => {
    if (
      !isDemo &&
      !isLoadingSession &&
      (isSessionError || !isSessionValid) &&
      !sessionExpiredShown
    ) {
      setSessionExpiredShown(true);
      localStorage.removeItem("is_authenticated");
      localStorage.removeItem("is_demo");
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
    isDemo,
    isLoadingSession,
    isSessionError,
    isSessionValid,
    sessionExpiredShown,
    sessionResponse,
    openConfirmDialog,
    navigate,
    t,
  ]);

  // Demo Fallback Data for Client Presentations
  const demoProfile = useMemo(
    () => ({
      FIRSTNAME: "Demo",
      LASTNAME: "Merchant",
      custName: "Demo Merchant Corp",
      email: "demo@gmail.com",
      EMAIL: "demo@gmail.com",
      mobilePhone: "+1 (555) 019-2834",
      mobile: "+1 (555) 019-2834",
      PHONE: "+1 (555) 019-2834",
      custType: "C",
      ACCOUNTNUMBER: "9876543210",
      MERCHANTID: "MER-DEMO-001",
      BUSINESSNAME: "Demo Global Retail",
      STATUS: "Active",
      country: "US",
      resCountry: "US",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      addrStreetNo: "123",
      addrStreetName: "Broadway",
      userName: "mahbub.cse",
      qrcode: [
        {
          currency: "XCG",
          qrcode: "MPAY#Demo Merchant Corp#mahbub.cse#XCG#9876543210",
        },
        {
          currency: "USD",
          qrcode: "MPAY#Demo Merchant Corp#mahbub.cse#USD#9876543211",
        },
      ],
    }),
    [],
  );

  const demoAccounts = useMemo(
    () => [
      {
        ACCOUNTNUMBER: "9876543210",
        ACCOUNTTITLE: "Demo Operating Account",
        CURSHRTNAME: "XCG",
        CURCODE: "0",
        AVBALANCE: "128450.00",
        STATUS: "Active",
      },
      {
        ACCOUNTNUMBER: "9876543211",
        ACCOUNTTITLE: "Demo Savings Account",
        CURSHRTNAME: "USD",
        CURCODE: "1",
        AVBALANCE: "45200.00",
        STATUS: "Active",
      },
    ],
    [],
  );

  const demoDashboardInfo = useMemo(
    () => ({
      totalAmountIncoming: "348500.00",
      totalCountIncoming: 142,
      totalAmountOutgoing: "123050.00",
      totalCountOutgoing: 38,
      totalSettled: "225450.00",
      chart: [
        { itemLabel: "May", totalAmountIncoming: "42000.00", totalAmountOutgoing: "18000.00" },
        { itemLabel: "Jun", totalAmountIncoming: "58000.00", totalAmountOutgoing: "24000.00" },
        { itemLabel: "Jul", totalAmountIncoming: "63000.00", totalAmountOutgoing: "31000.00" },
        { itemLabel: "Aug", totalAmountIncoming: "79000.00", totalAmountOutgoing: "28000.00" },
        { itemLabel: "Sep", totalAmountIncoming: "84000.00", totalAmountOutgoing: "35000.00" },
        { itemLabel: "Oct", totalAmountIncoming: "96000.00", totalAmountOutgoing: "39000.00" },
      ],
    }),
    [],
  );

  const demoNotifications = useMemo(
    () => [
      {
        msgId: "1",
        notificationTypeName: "Settlement Processed",
        notificationMsg: "Batch settlement #20261023 of 12,450.00 XCG completed successfully.",
        timeAgo: "10 mins ago",
        notificationStatus: "U",
      },
      {
        msgId: "2",
        notificationTypeName: "Payment Received",
        notificationMsg: "Payment of 450.00 XCG received from POS Terminal 2.",
        timeAgo: "2 hours ago",
        notificationStatus: "U",
      },
      {
        msgId: "3",
        notificationTypeName: "Bill Payment",
        notificationMsg: "Monthly utility bill payment of 320.00 XCG was processed.",
        timeAgo: "1 day ago",
        notificationStatus: "R",
      },
    ],
    [],
  );

  const demoTransactions = useMemo(
    () => [
      {
        txnName: "QR Code Sale",
        description: "Counter POS - Order #9021",
        amount: "450.00",
        currencyCode: "XCG",
        txnDebitCreditCode: "C",
        txnDate: "2026-10-23 10:15",
      },
      {
        txnName: "Settlement Payout",
        description: "Automatic Daily Batch Settlement",
        amount: "12450.00",
        currencyCode: "XCG",
        txnDebitCreditCode: "D",
        txnDate: "2026-10-23 09:30",
      },
      {
        txnName: "Card Payment",
        description: "Store Terminal 1 - Customer #3812",
        amount: "285.50",
        currencyCode: "XCG",
        txnDebitCreditCode: "C",
        txnDate: "2026-10-22 18:45",
      },
      {
        txnName: "Vendor Payment",
        description: "Wholesale Supplier Supplies",
        amount: "1850.00",
        currencyCode: "XCG",
        txnDebitCreditCode: "D",
        txnDate: "2026-10-22 14:00",
      },
      {
        txnName: "Online Transfer",
        description: "Direct Client Payment",
        amount: "1200.00",
        currencyCode: "XCG",
        txnDebitCreditCode: "C",
        txnDate: "2026-10-21 16:20",
      },
    ],
    [],
  );

  // 2. Profile & Accounts queries (Only executed if session is valid and not demo)
  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => loadUserProfile(),
    enabled: !isDemo && isSessionValid,
    retry: false,
  });

  const { data: accountsResponse } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: !isDemo && isSessionValid,
    retry: false,
  });

  const profile = isDemo ? demoProfile : profileResponse?.data || null;
  const accounts = isDemo ? demoAccounts : accountsResponse?.data || [];

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
    enabled: !isDemo && isSessionValid && !!activeAccountId,
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      getPortalNotifications({ custType: profile?.custType || "C" }),
    enabled: !isDemo && isSessionValid && !!profile,
  });

  const { data: transactionsResponse } = useQuery({
    queryKey: ["transactions", activeAccountId],
    queryFn: () =>
      transactionHistory({
        pageSize: 10,
        pageNum: 1,
        accountId: activeAccountId,
      }),
    enabled: !isDemo && isSessionValid && !!activeAccountId,
  });

  // 3. Loading State (Only for authenticated users while verifying profile data)
  if (!isDemo && (isLoadingSession || (isSessionValid && isLoadingProfile))) {
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
    !isDemo &&
    (isSessionError ||
    !isSessionValid ||
    isProfileError ||
    (!isLoadingProfile && !profile))
  ) {
    return <Navigate to="/" replace />;
  }

  const dashboardInfo = isDemo
    ? demoDashboardInfo
    : dashboardInfoResponse || null;
  const notifications = isDemo
    ? demoNotifications
    : notificationsResponse?.notifications || [];
  const transactions = isDemo
    ? demoTransactions
    : transactionsResponse?.transactionHistories || [];

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
