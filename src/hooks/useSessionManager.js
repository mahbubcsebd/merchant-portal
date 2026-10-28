import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { updateSession, logout } from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";

const DEFAULT_WARN_MS = 4 * 60 * 1000; // 4 minutes of inactivity before warning modal
const DEFAULT_GRACE_MS = 1 * 60 * 1000; // 1 minute countdown during warning before auto logout
const PING_THROTTLE_MS = 60 * 1000; // Throttled updateSession on activity at most once per 60s

export function useSessionManager(enabled = true) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openConfirmDialog, closeDialog } = useDialog();
  const { t } = useLanguage();

  const openConfirmDialogRef = useRef(openConfirmDialog);
  const closeDialogRef = useRef(closeDialog);
  const navigateRef = useRef(navigate);
  const queryClientRef = useRef(queryClient);
  const tRef = useRef(t);

  openConfirmDialogRef.current = openConfirmDialog;
  closeDialogRef.current = closeDialog;
  navigateRef.current = navigate;
  queryClientRef.current = queryClient;
  tRef.current = t;

  const warnTimerRef = useRef(null);
  const graceTimerRef = useRef(null);
  const lastPingRef = useRef(Date.now());
  const warningOpenRef = useRef(false);
  const sessionEndingRef = useRef(false);
  const sessionRedirectingRef = useRef(false);
  const currentSessionIdRef = useRef(
    typeof window !== "undefined"
      ? localStorage.getItem("session_active_id") || ""
      : "",
  );

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current);
      warnTimerRef.current = null;
    }
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  }, []);

  const finishExpiredSession = useCallback(() => {
    if (sessionRedirectingRef.current) return;
    sessionRedirectingRef.current = true;
    sessionEndingRef.current = true;
    warningOpenRef.current = false;
    clearTimers();
    closeDialogRef.current();

    localStorage.removeItem("is_authenticated");
    if (
      localStorage.getItem("session_active_id") === currentSessionIdRef.current
    ) {
      localStorage.removeItem("session_active_id");
    }
    try {
      localStorage.setItem("profileImage", "");
    } catch (e) {}

    queryClientRef.current.clear();
    navigateRef.current("/", { replace: true });
  }, [clearTimers]);

  const expireSessionNow = useCallback(async () => {
    if (sessionEndingRef.current || sessionRedirectingRef.current) return;
    sessionEndingRef.current = true;
    warningOpenRef.current = false;
    clearTimers();
    closeDialogRef.current();

    try {
      await logout();
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      finishExpiredSession();
    }
  }, [clearTimers, finishExpiredSession]);

  const handleSessionExpired = useCallback(
    (message) => {
      if (sessionEndingRef.current || sessionRedirectingRef.current) return;
      sessionEndingRef.current = true;
      warningOpenRef.current = false;
      clearTimers();
      closeDialogRef.current();

      localStorage.removeItem("is_authenticated");
      if (
        localStorage.getItem("session_active_id") === currentSessionIdRef.current
      ) {
        localStorage.removeItem("session_active_id");
      }
      queryClientRef.current.clear();

      openConfirmDialogRef.current({
        title: tRef.current("session_expired", "Session Expired"),
        description:
          message ||
          tRef.current(
            "session_expired_desc",
            "Your session has expired. Please sign in again to continue.",
          ),
        confirmText: tRef.current("authenticateSignIn", "Sign In"),
        iconType: "danger",
        hideCancel: true,
        onConfirm: () => {
          finishExpiredSession();
        },
        onClose: () => {
          finishExpiredSession();
        },
      });
    },
    [clearTimers, finishExpiredSession],
  );

  const startInactivityTimer = useCallback(() => {
    if (sessionEndingRef.current || warningOpenRef.current) return;
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current);
    }
    warnTimerRef.current = setTimeout(() => {
      showInactivityWarning();
    }, DEFAULT_WARN_MS);
  }, []);

  const staySignedIn = useCallback(async () => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    warningOpenRef.current = false;

    try {
      const res = await updateSession();
      if (
        res &&
        (String(res.statusCode) === "110" || String(res.errorCode) === "100")
      ) {
        handleSessionExpired(res.message);
        return false;
      }
      if (!res || res.status !== "success") {
        showInactivityWarning();
        return false;
      }
    } catch (err) {
      console.error("Failed to update session:", err);
      showInactivityWarning();
      return false;
    }

    startInactivityTimer();
    return true;
  }, [handleSessionExpired, startInactivityTimer]);

  const showInactivityWarning = useCallback(() => {
    if (sessionEndingRef.current || warningOpenRef.current) return;
    warningOpenRef.current = true;
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current);
      warnTimerRef.current = null;
    }

    openConfirmDialogRef.current({
      title: tRef.current("session_warning_title", "You are about to be logged out"),
      description: tRef.current(
        "session_warning_desc",
        "You are about to be logged out because of inactivity. Click Stay Signed In if you want to stay.",
      ),
      iconType: "warning",
      confirmText: tRef.current("stay_signed_in", "Stay Signed In"),
      cancelText: tRef.current("buttonLogout", "Log Out"),
      onConfirm: async () => {
        return await staySignedIn();
      },
      onCancel: async () => {
        await expireSessionNow();
        return true;
      },
      onClose: () => {
        if (warningOpenRef.current && !sessionEndingRef.current) {
          expireSessionNow();
        }
      },
    });

    graceTimerRef.current = setTimeout(() => {
      expireSessionNow();
    }, DEFAULT_GRACE_MS);
  }, [expireSessionNow, staySignedIn]);

  const onUserActivity = useCallback(() => {
    if (
      sessionEndingRef.current ||
      warningOpenRef.current ||
      sessionRedirectingRef.current
    ) {
      return;
    }

    startInactivityTimer();

    const now = Date.now();
    if (now - lastPingRef.current >= PING_THROTTLE_MS) {
      lastPingRef.current = now;
      updateSession().catch(() => {});
    }
  }, [startInactivityTimer]);

  useEffect(() => {
    if (!enabled) return;

    if (!localStorage.getItem("session_active_id")) {
      const newId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("session_active_id", newId);
      currentSessionIdRef.current = newId;
    } else {
      currentSessionIdRef.current = localStorage.getItem("session_active_id");
    }

    sessionEndingRef.current = false;
    sessionRedirectingRef.current = false;
    warningOpenRef.current = false;

    startInactivityTimer();

    const activityEvents = ["click", "keydown", "touchstart"];
    const handleActivity = () => onUserActivity();

    activityEvents.forEach((evt) => {
      document.addEventListener(evt, handleActivity, false);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onUserActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleStorageChange = (e) => {
      if (
        e.key === "session_active_id" &&
        e.newValue &&
        e.newValue !== currentSessionIdRef.current
      ) {
        handleSessionExpired(
          tRef.current(
            "session_another_tab",
            "Your session has expired because you signed in from another tab or window. Please sign in again.",
          ),
        );
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const handleCustomSessionExpired = (e) => {
      handleSessionExpired(e.detail?.message);
    };
    window.addEventListener("app:session-expired", handleCustomSessionExpired);

    return () => {
      clearTimers();
      activityEvents.forEach((evt) => {
        document.removeEventListener(evt, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "app:session-expired",
        handleCustomSessionExpired,
      );
    };
  }, [
    enabled,
    clearTimers,
    handleSessionExpired,
    onUserActivity,
    startInactivityTimer,
  ]);
}
