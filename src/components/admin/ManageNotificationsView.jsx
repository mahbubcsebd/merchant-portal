import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  loadAlertNotificationSetting,
  updateAlertNotification,
} from "@/lib/api/endpoints";

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
      <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("loading", "Loading Notification Settings...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-4 mb-2">
          {[
            {
              id: "sms",
              label: t("mn_sms", t("sms_notifications", "SMS Notifications")),
            },
            {
              id: "email",
              label: t(
                "mn_email",
                t("email_notifications", "Email Notifications"),
              ),
            },
            {
              id: "whatsapp",
              label: t(
                "mn_wht",
                t("whatsapp_notifications", "WhatsApp Notifications"),
              ),
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0"
            >
              <span className="font-semibold text-[#1b55ad] dark:text-blue-400 text-sm">
                {item.label}
              </span>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                disabled={updateMutation.isPending}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${notifications[item.id] ? "bg-[#1b55ad]" : "bg-slate-300 dark:bg-slate-600"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${notifications[item.id] ? "right-1" : "left-1"}`}
                ></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
