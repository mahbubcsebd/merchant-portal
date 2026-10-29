import React, { useMemo } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getTransactionStatusCode } from "@/lib/utils/formatters";

// Radial Progress Gauge SVG Component
function RadialGauge({ ratio, strokeColor, trackColor, size = 52, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedRatio = Math.min(100, Math.max(0, ratio));
  const offset = circumference - (clampedRatio / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Filled Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Inner Label */}
      <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
        {Math.round(clampedRatio)}%
      </span>
    </div>
  );
}

export function TransactionStatusCard() {
  const { transactions } = useDashboardContext();
  const { t } = useLanguage();

  const metrics = useMemo(() => {
    const list = transactions || [];
    let success = 0;
    let pending = 0;
    let failed = 0;

    list.forEach((tx) => {
      const code = getTransactionStatusCode(tx);
      const rawStatus = String(tx.txnStatus ?? tx.status ?? "").trim().toUpperCase();

      if (code === "P") {
        success++;
      } else if (code === "C") {
        pending++;
      } else if (code === "R" || rawStatus === "F") {
        failed++;
      } else {
        success++;
      }
    });

    const total = list.length;
    const successRatio = total > 0 ? (success / total) * 100 : 0;
    const pendingRatio = total > 0 ? (pending / total) * 100 : 0;
    const failedRatio = total > 0 ? (failed / total) * 100 : 0;

    return {
      total,
      successCount: success,
      pendingCount: pending,
      failedCount: failed,
      successRatio,
      pendingRatio,
      failedRatio,
      successPct: total > 0 ? `${successRatio.toFixed(1)}%` : "0.0%",
      pendingPct: total > 0 ? `${pendingRatio.toFixed(1)}%` : "0.0%",
      failedPct: total > 0 ? `${failedRatio.toFixed(1)}%` : "0.0%",
    };
  }, [transactions]);

  const items = [
    {
      label: t("successful", "Successful"),
      count: metrics.successCount,
      percentage: metrics.successPct,
      ratio: metrics.successRatio,
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      strokeColor: "#10b981", // emerald-500
      trackColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      label: t("pending", "Pending"),
      count: metrics.pendingCount,
      percentage: metrics.pendingPct,
      ratio: metrics.pendingRatio,
      icon: Clock,
      iconColor: "text-amber-500",
      strokeColor: "#f59e0b", // amber-500
      trackColor: "rgba(245, 158, 11, 0.12)",
    },
    {
      label: t("failed", "Failed"),
      count: metrics.failedCount,
      percentage: metrics.failedPct,
      ratio: metrics.failedRatio,
      icon: XCircle,
      iconColor: "text-rose-500",
      strokeColor: "#f43f5e", // rose-500
      trackColor: "rgba(244, 63, 94, 0.12)",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("transaction_status", "Transaction status")}
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ({metrics.total} {metrics.total === 1 ? t("transaction", "transaction") : t("transactions", "transactions")})
          </span>
        </div>
        <Link
          to="/dashboard/live-transactions"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t("view_all", "View all")}
        </Link>
      </div>

      {/* 3 Status Cards with Radial Gauges (Uniform Plain White Background) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/70 bg-white dark:bg-slate-900/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
          >
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <item.icon size={14} className={`${item.iconColor} shrink-0`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {item.count}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {item.percentage} of total
              </span>
            </div>

            {/* Radial Gauge */}
            <RadialGauge
              ratio={item.ratio}
              strokeColor={item.strokeColor}
              trackColor={item.trackColor}
              size={54}
              strokeWidth={5}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
