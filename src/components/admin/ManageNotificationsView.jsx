import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  loadAlertNotificationSetting,
  updateAlertNotification,
} from "@/lib/api/endpoints";
import {
  Bell,
  Smartphone,
  Mail,
  MessageCircle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function ManageNotificationsView() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openSuccessDialog } = useDialog();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["alertNotificationSetting"],
    queryFn: () => loadAlertNotificationSetting(),
  });

  const [notifications, setNotifications] = useState({
    sms: false,
    email: false,
    whatsapp: false,
  });

  // Populate state when settings are loaded
  useEffect(() => {
    if (settingsData?.alertNotiFlag) {
      setNotifications({
        sms: !!settingsData.alertNotiFlag.smsFlag,
        email: !!settingsData.alertNotiFlag.emailFlag,
        whatsapp: !!settingsData.alertNotiFlag.whtFlag,
      });
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateAlertNotification(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({
          queryKey: ["alertNotificationSetting"],
        });
        openSuccessDialog({
          title: t("success", "Success"),
          message: data.message || "Alert notification updated successfully.",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description:
            data.message || "Failed to update notification settings.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description:
          err?.response?.data?.message ||
          t("something_went_wrong_try_again", "Something went wrong."),
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const toggle = (key) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updated);

    updateMutation.mutate({
      smsFlag: updated.sms,
      emailFlag: updated.email,
      pushFlag: true,
      whtFlag: updated.whatsapp,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-16 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="mt-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t("loading", "Loading Notification Settings...")}
          </p>
        </div>
      </div>
    );
  }

  const channels = [
    {
      id: "sms",
      label: t("mn_sms", t("sms_notifications", "SMS Notifications")),
      description: t(
        "sms_notif_desc",
        "Receive real-time text message alerts for every incoming merchant transaction and security code.",
      ),
      badgeText: t("carrier_standard", "Standard SMS"),
      icon: Smartphone,
      colorClass:
        "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
      active: notifications.sms,
    },
    {
      id: "email",
      label: t("mn_email", t("email_notifications", "Email Notifications")),
      description: t(
        "email_notif_desc",
        "Receive daily settlement statements, digital payment receipts, and monthly accounting logs.",
      ),
      badgeText: t("daily_digests", "Official Statements"),
      icon: Mail,
      colorClass:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      active: notifications.email,
    },
    {
      id: "whatsapp",
      label: t(
        "mn_wht",
        t("whatsapp_notifications", "WhatsApp Notifications"),
      ),
      description: t(
        "whatsapp_notif_desc",
        "Get instant interactive payment confirmations and cashier shift updates directly on WhatsApp.",
      ),
      badgeText: t("instant_chat", "Instant Chat"),
      icon: MessageCircle,
      colorClass:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      active: notifications.whatsapp,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in duration-300">
      {/* ── Section Header Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t("notification_channels", "Notification Channels")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                "notification_channels_sub",
                "Customize how and where you want to receive real-time merchant alerts",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Notification Channel List ───────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        {channels.map((ch) => {
          const ChannelIcon = ch.icon;
          return (
            <div
              key={ch.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                ch.active
                  ? "border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-500/5"
                  : "border-slate-100 dark:border-slate-800/70 bg-slate-50/40 dark:bg-slate-900/40"
              }`}
            >
              {/* Channel Info */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ch.colorClass}`}
                >
                  <ChannelIcon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {ch.label}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {ch.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ch.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 sm:hidden">
                  {ch.active ? t("enabled", "Enabled") : t("disabled", "Disabled")}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={ch.active}
                  onClick={() => toggle(ch.id)}
                  disabled={updateMutation.isPending}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    ch.active
                      ? "bg-[#2563eb]"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                      ch.active ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}

        {/* Permanent Security Push Notice */}
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 mt-4">
          <ShieldAlert
            size={18}
            className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
          />
          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t("app_push_notice", "In-App Push Notifications:")}
            </span>{" "}
            {t(
              "app_push_desc",
              "Critical security warnings and authorization prompts will always be delivered to your signed-in devices.",
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
