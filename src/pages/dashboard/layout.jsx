import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard/DashboardLayout";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
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
} from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useSessionManager } from "@/hooks/useSessionManager";
import { DashboardContext } from "./context";
import ChangePinView from "@/components/admin/ChangePinView";

const FORCE_CHANGE_PIN_FLAG = 1;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { openConfirmDialog } = useDialog();
  const [period, setPeriod] = useState("last3months");
  const [currency, setCurrency] = useState("");
  const [sessionExpiredShown, setSessionExpiredShown] = useState(false);

  const isAuthenticatedFlag =
    typeof window !== "undefined" &&
    localStorage.getItem("is_authenticated") === "true";

  if (!isAuthenticatedFlag) {
    return <Navigate to="/" replace />;
  }

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
  });

  const isSessionValid =
    sessionResponse?.status === "success" || sessionResponse?.statusCode === 0;

  useSessionManager(isAuthenticatedFlag && isSessionValid);

  useEffect(() => {
    if (
      !isLoadingSession &&
      (isSessionError || !isSessionValid) &&
      !sessionExpiredShown
    ) {
      setSessionExpiredShown(true);
      localStorage.removeItem("is_authenticated");
      localStorage.removeItem("session_active_id");
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
        onClose: () => {
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

  // Temporary PIN (e.g. after Forgot PIN) => backend sets forceChangePassword=1
  const { data: userProfileResponse, isLoading: isLoadingForceFlag } = useQuery({
    queryKey: ["userProfileForceFlag"],
    queryFn: () => getUserProfile(),
    enabled: isSessionValid,
    retry: false,
    staleTime: 0,
  });

  const { data: accountsResponse, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: isSessionValid,
    retry: false,
  });

  const profile = profileResponse?.data || null;
  const accounts = accountsResponse?.data || [];

  const defaultAccountId = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    const primary = accounts.find((a) => a.ACCOUNTTYPE === "PRIMARY");
    const first = primary || accounts[0];
    return first.ACCOUNTNUMBER || first.ACCOUNTNO || null;
  }, [accounts]);

  const activeAccountId = currency || defaultAccountId;

  useEffect(() => {
    if (defaultAccountId && (!currency || !accounts.some((a) => (a.ACCOUNTNUMBER || a.ACCOUNTNO) === currency))) {
      setCurrency(defaultAccountId);
    }
  }, [defaultAccountId, currency, accounts]);

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
        pageSize: 200,
        pageNum: 1,
        accountId: activeAccountId,
      }),
    enabled: isSessionValid && !!activeAccountId,
  });

  if (
    isLoadingSession ||
    (isSessionValid &&
      (isLoadingProfile || isLoadingAccounts || isLoadingForceFlag))
  ) {
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

  if (
    isSessionError ||
    !isSessionValid ||
    isProfileError ||
    (!isLoadingProfile && !profile)
  ) {
    return <Navigate to="/" replace />;
  }

  const isForceChangePin =
    Number(
      userProfileResponse?.data?.forceChangePassword ??
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
            onSuccess={() =>
              queryClient.invalidateQueries({
                queryKey: ["userProfileForceFlag"],
              })
            }
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
