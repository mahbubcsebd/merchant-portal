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
  Loader2,
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

  // Track which toggle is actively pending
  const [pendingChannel, setPendingChannel] = useState(null);

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
      setPendingChannel(null);
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
      setPendingChannel(null);
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
    setPendingChannel(key);

    updateMutation.mutate({
      smsFlag: updated.sms,
      emailFlag: updated.email,
      pushFlag: true,
      whtFlag: updated.whatsapp,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-16 bg-white dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#2563eb] border-t-transparent" />
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
      icon: Smartphone,
      active: notifications.sms,
    },
    {
      id: "email",
      label: t("mn_email", t("email_notifications", "Email Notifications")),
      description: t(
        "email_notif_desc",
        "Receive daily settlement statements, digital payment receipts, and monthly accounting logs.",
      ),
      icon: Mail,
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
      icon: MessageCircle,
      active: notifications.whatsapp,
    },
  ];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* ── Top Header Card (Matching Linked Bank Accounts & Language Settings) ── */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("notification_channels", "Notification Channels")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                "notification_channels_sub",
                "Configure alert destinations for customer transactions and reports",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Notification Channel List Card ── */}
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm space-y-3">
        {channels.map((ch) => {
          const ChannelIcon = ch.icon;
          const isPending = updateMutation.isPending && pendingChannel === ch.id;

          return (
            <div
              key={ch.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                ch.active
                  ? "border-blue-200/80 dark:border-blue-500/30 bg-blue-50/20 dark:bg-blue-500/5 shadow-2xs"
                  : "border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]"
              }`}
            >
              {/* Channel Info */}
              <div className="flex items-start gap-3 min-w-0">
                {/* Unified Single Brand-Blue Icon Container */}
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0 p-1.5 mt-0.5">
                  <ChannelIcon size={17} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {ch.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                    {ch.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center pl-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 sm:hidden">
                  {ch.active ? t("enabled", "Enabled") : t("disabled", "Disabled")}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={ch.active}
                  onClick={() => toggle(ch.id)}
                  disabled={updateMutation.isPending}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    ch.active
                      ? "bg-[#2563eb]"
                      : "bg-slate-200 dark:bg-white/15"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center ${
                      ch.active ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  >
                    {isPending && (
                      <Loader2 size={10} className="animate-spin text-[#2563eb]" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
