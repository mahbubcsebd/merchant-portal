import { Bell, QrCode } from "lucide-react";
import { useState } from "react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

const ICON_MAP = {
  PAYTOPHONE: "/images/activity/payPhoneNo.svg",
  SCANTOPAY: "/images/activity/qr-code-scan2pay.svg",
  PAYQRCODE: "/images/activity/qr-code-payByCode.svg",
  PAYTOBANK: "/images/activity/pay2Bank.svg",
  PAYTOEMAIL: "/images/activity/payPhoneNo.svg",
  PAYBILL: "/images/activity/payBills.svg",
  TOPUP: "/images/activity/mobile-recharge-icon.svg",
  SPEXPENSE: "/images/activity/split_expanse.svg",
  FORGOTPASSWORD: "/images/activity/payPhoneNo.svg",
  USERACTIVATED: "/images/activity/user_outline.png",
  PROFBYQR: "/images/activity/qr-code-payByCode.svg",
  REQBYQR: "/images/activity/qr-code-payByCode.svg",
  SCANCOLLET: "/images/activity/icon_scanToCollect.svg",
  SCANTOCOLLECT: "/images/activity/icon_scanToCollect.svg",
  SCANGALERY: "/images/activity/gallery.svg",
  REMINDER: "/images/activity/notification.png",
  ALERT: "/images/activity/notification.png",
  PROMOTION: "/images/activity/notification.png",
};

function getActivityIcon(activity) {
  const code = (activity.notificationType || "").toUpperCase().trim();
  if (ICON_MAP[code]) {
    return ICON_MAP[code];
  }

  // Fallback heuristic based on notificationTypeName
  const name = (activity.notificationTypeName || "").toUpperCase();
  if (name.includes("SCAN TO COLLECT") || name.includes("SCANCOLLET")) {
    return "/images/activity/icon_scanToCollect.svg";
  }
  if (name.includes("SCAN TO PAY") || name.includes("SCANTOPAY")) {
    return "/images/activity/qr-code-scan2pay.svg";
  }
  if (
    name.includes("PROFILE QR") ||
    name.includes("REQUEST QR") ||
    name.includes("QR")
  ) {
    return "/images/activity/qr-code-payByCode.svg";
  }
  if (
    name.includes("MOBILE") ||
    name.includes("PHONE") ||
    name.includes("EMAIL")
  ) {
    return "/images/activity/payPhoneNo.svg";
  }
  if (name.includes("BANK")) {
    return "/images/activity/pay2Bank.svg";
  }
  if (name.includes("BILL")) {
    return "/images/activity/payBills.svg";
  }
  if (name.includes("TOPUP") || name.includes("RECHARGE")) {
    return "/images/activity/mobile-recharge-icon.svg";
  }

  return "/images/activity/qr-code-payByCode.svg";
}

function ActivityIconItem({ activity }) {
  const [hasError, setHasError] = useState(false);
  const iconSrc = getActivityIcon(activity);

  if (hasError || !iconSrc) {
    return <QrCode size={18} className="text-[#083bac] dark:text-blue-400" />;
  }

  return (
    <img
      src={iconSrc}
      alt={activity.notificationTypeName || "Activity"}
      className="w-5 h-5 object-contain dark:brightness-125 dark:contrast-125 transition-transform"
      onError={() => setHasError(true)}
    />
  );
}

export function LatestActivities() {
  const { notifications } = useDashboardContext();
  const { t } = useLanguage();

  const recentNotifications = [...notifications]
    .sort((a, b) => Number(b.msgId) - Number(a.msgId))
    .slice(0, 8);

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="flex items-center justify-between h-9 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t("latest_activities", "Latest Activities")}
        </h3>
      </div>

      <div
        className="flex-1 flex flex-col rounded-xl overflow-hidden
        border border-slate-200 dark:border-white/8
        bg-white dark:bg-white/[0.03]
        shadow-sm dark:shadow-none min-h-[440px]"
      >
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {recentNotifications.length === 0 ? (
            <div className="flex h-full min-h-[200px] items-center justify-center p-8 text-center text-slate-500 text-sm">
              {t("no_recent_activities", "No recent activities found.")}
            </div>
          ) : (
            recentNotifications.map((activity) => (
              <div
                key={activity.msgId}
                className="flex items-start gap-4 px-5 py-3.5
                  hover:bg-slate-50 dark:hover:bg-white/[0.03]
                  transition-colors"
              >
                {/* Dynamic Icon matching legacy portal */}
                <div
                  className="w-10 h-10 rounded-xl
                  bg-blue-50/80 dark:bg-[#2563eb]/15
                  border border-blue-100/70 dark:border-[#2563eb]/20
                  flex items-center justify-center shrink-0 mt-0.5"
                >
                  <ActivityIconItem activity={activity} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {activity.notificationTypeName}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed line-clamp-2 whitespace-pre-line">
                    {activity.notificationMsg}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-white/25 font-medium mt-1.5">
                    {activity.timeAgo}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
