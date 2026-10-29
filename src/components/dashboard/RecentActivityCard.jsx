import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  QrCode,
  Landmark,
  Mail,
  PhoneCall,
  ScanLine,
  ImageIcon,
  AlertCircle,
  Bell,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

// Local image icon mappings from public/images/activity/
const SVG_ICON_MAP = {
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

// Lucide icon fallbacks with specific styles
const META_MAP = {
  PAYBILL: {
    icon: CreditCard,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  PAYQRCODE: {
    icon: QrCode,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  PAYTOBANK: {
    icon: Landmark,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  PAYTOEMAIL: {
    icon: Mail,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  PAYTOPHONE: {
    icon: PhoneCall,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  PROFBYQR: {
    icon: QrCode,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  REQBYQR: {
    icon: QrCode,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  SCANCOLLET: {
    icon: ScanLine,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  SCANTOCOLLECT: {
    icon: ScanLine,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  SCANGALERY: {
    icon: ImageIcon,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  SCANTOPAY: {
    icon: ScanLine,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  TOPUP: {
    icon: Smartphone,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  CASHOUT: {
    icon: ExternalLink,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  ALERT: {
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
  DEFAULT: {
    icon: Bell,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
  },
};

function resolveActivityMeta(notif) {
  const typeCode = (notif.notificationType || "").toUpperCase().trim();
  const typeName = (notif.notificationTypeName || "").toUpperCase().trim();

  // 1. Direct typeCode match
  if (META_MAP[typeCode]) {
    return { ...META_MAP[typeCode], svgSrc: SVG_ICON_MAP[typeCode] };
  }

  // 2. Keyword heuristic on name
  if (typeName.includes("BANK")) {
    return { ...META_MAP.PAYTOBANK, svgSrc: SVG_ICON_MAP.PAYTOBANK };
  }
  if (typeName.includes("BILL")) {
    return { ...META_MAP.PAYBILL, svgSrc: SVG_ICON_MAP.PAYBILL };
  }
  if (typeName.includes("QR") || typeName.includes("SCAN")) {
    return { ...META_MAP.PAYQRCODE, svgSrc: SVG_ICON_MAP.PAYQRCODE };
  }
  if (typeName.includes("EMAIL") || typeName.includes("MAIL")) {
    return { ...META_MAP.PAYTOEMAIL, svgSrc: SVG_ICON_MAP.PAYTOEMAIL };
  }
  if (typeName.includes("PHONE") || typeName.includes("MOBILE")) {
    return { ...META_MAP.PAYTOPHONE, svgSrc: SVG_ICON_MAP.PAYTOPHONE };
  }
  if (typeName.includes("CASH")) {
    return { ...META_MAP.CASHOUT, svgSrc: null };
  }
  if (typeName.includes("TOPUP") || typeName.includes("RECHARGE")) {
    return { ...META_MAP.TOPUP, svgSrc: SVG_ICON_MAP.TOPUP };
  }

  return { ...META_MAP.DEFAULT, svgSrc: null };
}

function ActivityIconItem({ meta, altText }) {
  const [imgError, setImgError] = useState(false);
  const FallbackIcon = meta.icon;

  if (meta.svgSrc && !imgError) {
    return (
      <img
        src={meta.svgSrc}
        alt={altText}
        className="w-4 h-4 object-contain dark:brightness-125 dark:contrast-125 transition-transform"
        onError={() => setImgError(true)}
      />
    );
  }

  return <FallbackIcon size={14} className={meta.color} />;
}

export function RecentActivityCard() {
  const { notifications } = useDashboardContext();
  const { t } = useLanguage();

  const activities = React.useMemo(() => {
    if (!notifications || notifications.length === 0) {
      return [];
    }

    return notifications
      .filter((notif) => {
        const title = notif.notificationTypeName || notif.notificationType || "";
        const msg = notif.notificationMsg || notif.message || notif.notificationText || "";
        return Boolean(title.trim() || msg.trim());
      })
      .slice(0, 4)
      .map((notif, index) => {
        const title =
          notif.notificationTypeName ||
          notif.notificationType ||
          t("activity", "Activity");
        const msg =
          notif.notificationMsg ||
          notif.message ||
          notif.notificationText ||
          "";
        const date = notif.timeAgo || notif.creationDate || notif.date || "";
        const isPending =
          title.toLowerCase().includes("pending") ||
          msg.toLowerCase().includes("pending");

        const meta = resolveActivityMeta(notif);

        return {
          id: notif.msgId || index,
          title,
          description: msg,
          date,
          status: isPending ? "Pending" : "Completed",
          meta,
        };
      });
  }, [notifications, t]);

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("recent_activity", "Recent activity")}
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ({activities.length})
          </span>
        </div>
        <Link
          to="/dashboard/reports"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t("view_all", "View all")}
        </Link>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {t("no_recent_activity", "No recent activity found")}
        </div>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {activities.map((act) => {
            const isCompleted = act.status === "Completed";
            return (
              <div key={act.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.meta.bg}`}
                  >
                    <ActivityIconItem meta={act.meta} altText={act.title} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {act.title}
                    </h4>
                    {act.description && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                        {act.description}
                      </p>
                    )}
                    {act.date && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        {act.date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
