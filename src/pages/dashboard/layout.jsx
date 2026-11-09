import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard/DashboardLayout";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  getUserProfile,
  loadUserProfile,
  getAccounts,
  getDashboardInfo,
  getPortalNotifications,
  transactionHistory,
  updateSession,
  logout,
} from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useSessionManager } from "@/hooks/useSessionManager";
import { DashboardContext } from "./context";
import ChangePinView from "@/components/admin/ChangePinView";

const FORCE_CHANGE_PIN_FLAG = 1;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { openConfirmDialog } = useDialog();
  const [period, setPeriod] = useState("last3months");
  const [currency, setCurrency] = useState("");
  const [sessionExpiredShown, setSessionExpiredShown] = useState(false);

  const isAuthenticatedFlag =
    typeof window !== "undefined" &&
    localStorage.getItem("is_authenticated") === "true";

  const [isSoftLogin, setIsSoftLogin] = useState(() => {
    return (
      typeof window !== "undefined" &&
      localStorage.getItem("is_soft_login") === "true"
    );
  });

  if (!isAuthenticatedFlag) {
    return <Navigate to="/" replace />;
  }

  const storedIsGroup =
    typeof window !== "undefined" &&
    localStorage.getItem("is_merchant_group") === "true";

  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["userProfile", storedIsGroup, isSoftLogin],
    queryFn: async () => {
      // In Merchant Group Admin mode, getUserProfile is the authoritative endpoint
      if (storedIsGroup && !isSoftLogin) {
        return getUserProfile();
      }
      try {
        const res = await getUserProfile();
        if (res?.status === "success" || res?.statusCode === 0) {
          return res;
        }
      } catch (err) {
        console.warn("getUserProfile failed, trying loadUserProfile fallback:", err);
      }
      return loadUserProfile();
    },
    enabled: Boolean(isAuthenticatedFlag),
    retry: false,
    staleTime: 30 * 1000,
  });

  const {
    data: sessionResponse,
    isLoading: isLoadingSession,
    isError: isSessionError,
  } = useQuery({
    queryKey: ["userSession"],
    queryFn: () => updateSession(),
    staleTime: 60 * 1000, // 1 minute
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticatedFlag),
  });

  const isSessionValid =
    (profileResponse?.status === "success" || profileResponse?.statusCode === 0) ||
    (!sessionResponse || sessionResponse?.status === "success" || sessionResponse?.statusCode === 0);

  useSessionManager(isAuthenticatedFlag && isSessionValid);

  useEffect(() => {
    const isProfileExpired =
      profileResponse &&
      (profileResponse.status === "error" || String(profileResponse.statusCode) === "110");
    const isSessionExpired =
      sessionResponse &&
      (sessionResponse.status === "error" || String(sessionResponse.statusCode) === "110");

    if (
      !isLoadingSession &&
      !isLoadingProfile &&
      (isProfileExpired || (isSessionExpired && !profileResponse?.data)) &&
      !sessionExpiredShown
    ) {
      setSessionExpiredShown(true);
      localStorage.removeItem("is_authenticated");
      localStorage.removeItem("session_active_id");
      localStorage.removeItem("is_merchant_group");
      localStorage.removeItem("is_soft_login");
      openConfirmDialog({
        title: t("session_expired", "Session Expired"),
        description:
          profileResponse?.message ||
          sessionResponse?.message ||
          t(
            "session_expired_desc",
            "Your session has expired or is invalid. Please sign in again to continue.",
          ),
        confirmText: t("authenticateSignIn", "Sign In"),
        iconType: "danger",
        hideCancel: true,
        onConfirm: () => {
          navigate("/", { replace: true });
        },
        onClose: () => {
          navigate("/", { replace: true });
        },
      });
    }
  }, [
    isLoadingSession,
    isLoadingProfile,
    profileResponse,
    sessionResponse,
    sessionExpiredShown,
    openConfirmDialog,
    navigate,
    t,
  ]);

  const isMerchantGroup = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("is_merchant_group") === "true" ||
      Boolean(profileResponse?.data?.merchantGroupInfo) ||
      Boolean(profileResponse?.isMerchantGroup) ||
      Boolean(profileResponse?.data?.isMerchantGroup)
    );
  }, [profileResponse]);

  // Keep localStorage aligned if profile indicates merchantGroupInfo
  useEffect(() => {
    if (
      profileResponse?.data?.merchantGroupInfo ||
      profileResponse?.isMerchantGroup ||
      profileResponse?.data?.isMerchantGroup
    ) {
      localStorage.setItem("is_merchant_group", "true");
    }
  }, [profileResponse]);

  const { data: accountsResponse, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: Boolean(isAuthenticatedFlag),
    retry: false,
  });

  const profile = useMemo(() => {
    if (isMerchantGroup && !isSoftLogin) {
      return (
        profileResponse?.data?.merchantGroupInfo ||
        profileResponse?.data ||
        profileResponse?.records ||
        null
      );
    }
    return (
      profileResponse?.data ||
      profileResponse?.records ||
      null
    );
  }, [isMerchantGroup, isSoftLogin, profileResponse]);

  const accounts = accountsResponse?.data || [];

  const merchantGroupAccounts = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    return accounts
      .map((a) => a.ACCOUNTNUMBER || a.ACCOUNTNO)
      .filter(Boolean);
  }, [accounts]);

  const defaultAccountId = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    const primary = accounts.find((a) => a.ACCOUNTTYPE === "PRIMARY");
    const first = primary || accounts[0];
    return first.ACCOUNTNUMBER || first.ACCOUNTNO || null;
  }, [accounts]);

  const activeAccountId = currency || defaultAccountId;

  useEffect(() => {
    if (
      defaultAccountId &&
      (!currency ||
        !accounts.some(
          (a) => (a.ACCOUNTNUMBER || a.ACCOUNTNO) === currency,
        ))
    ) {
      setCurrency(defaultAccountId);
    }
  }, [defaultAccountId, currency, accounts]);

  // In aggregated Merchant Group mode, accountId is an array of all accounts
  const effectiveDashboardAccountId = useMemo(() => {
    if (isMerchantGroup && !isSoftLogin && merchantGroupAccounts.length > 0) {
      return merchantGroupAccounts;
    }
    return activeAccountId;
  }, [isMerchantGroup, isSoftLogin, merchantGroupAccounts, activeAccountId]);

  const isDashboardAccountReady = useMemo(() => {
    if (Array.isArray(effectiveDashboardAccountId)) {
      return effectiveDashboardAccountId.length > 0;
    }
    return Boolean(effectiveDashboardAccountId);
  }, [effectiveDashboardAccountId]);

  const { data: dashboardInfoResponse } = useQuery({
    queryKey: ["dashboardInfo", effectiveDashboardAccountId, period],
    queryFn: () =>
      getDashboardInfo({ period, accountId: effectiveDashboardAccountId }),
    enabled: isSessionValid && isDashboardAccountReady,
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      getPortalNotifications({ custType: profile?.custType || "C" }),
    enabled: isSessionValid && !!profile,
  });

  const { data: transactionsResponse } = useQuery({
    queryKey: ["transactions", effectiveDashboardAccountId],
    queryFn: () =>
      transactionHistory({
        pageSize: 200,
        pageNum: 1,
        accountId: effectiveDashboardAccountId,
      }),
    enabled: isSessionValid && isDashboardAccountReady,
  });

  // Role-Based URL Guards
  useEffect(() => {
    const currentPath = location.pathname;

    if (isMerchantGroup && !isSoftLogin) {
      const groupBlockedPaths = [
        "/dashboard/manage-cashiers",
        "/dashboard/branches",
        "/dashboard/reports",
        "/dashboard/admin",
        "/dashboard/merchant-operations",
        "/dashboard/pay-bills",
        "/dashboard/transfer",
      ];
      if (groupBlockedPaths.some((p) => currentPath.startsWith(p))) {
        navigate("/dashboard", { replace: true });
      }
    } else if (isSoftLogin) {
      const softLoginBlockedPaths = [
        "/dashboard/merchant-group",
        "/dashboard/pay-bills",
        "/dashboard/transfer",
      ];
      if (softLoginBlockedPaths.some((p) => currentPath.startsWith(p))) {
        navigate("/dashboard", { replace: true });
      }
    } else if (!isMerchantGroup) {
      if (currentPath.startsWith("/dashboard/merchant-group")) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [location.pathname, isMerchantGroup, isSoftLogin, navigate]);

  if (isLoadingProfile) {
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

  if (!isLoadingProfile && !profile) {
    return <Navigate to="/" replace />;
  }

  const isForceChangePin =
    Number(
      profileResponse?.data?.forceChangePassword ??
        profile?.forceChangePassword,
    ) === FORCE_CHANGE_PIN_FLAG;

  if (isForceChangePin) {
    return (
      <div className="min-h-screen w-full flex items-start justify-center bg-slate-50 dark:bg-[#0f1829] px-4 py-10">
        <div className="w-full max-w-5xl">
          <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
            {t("create_pin", "Create PIN")}
          </h1>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "create_pin_required",
              "Your PIN was reset. Set a new PIN to continue.",
            )}
          </p>
          <ChangePinView
            onSuccess={async () => {
              try {
                await logout();
              } catch (err) {
                console.error("Logout after PIN change error:", err);
              } finally {
                localStorage.removeItem("is_authenticated");
                localStorage.removeItem("session_active_id");
                try {
                  localStorage.setItem("profileImage", "");
                } catch (e) {}
                queryClient.clear();
                navigate("/", { replace: true });
              }
            }}
          />
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
        rawProfile: profileResponse?.data,
        accounts,
        dashboardInfo,
        notifications,
        transactions,
        period,
        setPeriod,
        currency,
        setCurrency,
        isMerchantGroup,
        isSoftLogin,
        setIsSoftLogin,
        merchantGroupAccounts,
      }}
    >
      <DashboardLayoutComponent>
        <Outlet />
      </DashboardLayoutComponent>
    </DashboardContext.Provider>
  );
}
