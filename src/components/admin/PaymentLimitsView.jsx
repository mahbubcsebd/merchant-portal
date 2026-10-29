import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getTransactionLimits } from "@/lib/api/endpoints";
import GlobalSelect from "@/components/globals/GlobalSelect";
import {
  Calendar,
  Clock,
  CalendarRange,
  Layers,
} from "lucide-react";

// ── Radial Progress Gauge (Exact Match to TransactionStatusCard) ──
function RadialGauge({
  ratio = 0,
  strokeColor = "#2563eb",
  trackColor = "rgba(37, 99, 235, 0.12)",
  size = 52,
  strokeWidth = 5,
}) {
  const safeRatio = typeof ratio === "number" && !isNaN(ratio) ? ratio : 0;
  const clampedRatio = Math.min(100, Math.max(0, safeRatio));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedRatio / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(offset) ? 0 : offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
        {Math.round(clampedRatio)}%
      </span>
    </div>
  );
}

export default function PaymentLimitsView() {
  const { t } = useLanguage();
  const { data: limitsData, isLoading } = useQuery({
    queryKey: ["transactionLimits"],
    queryFn: () => getTransactionLimits(),
  });

  const limitsList = limitsData?.txnLimitUsers || [];

  // Extract unique currency names
  const currencies = useMemo(() => {
    return Array.from(
      new Set(limitsList.map((item) => item.CURRNAME)),
    ).filter(Boolean);
  }, [limitsList]);

  const currencyOptions = useMemo(() => {
    return [
      { value: "all", label: t("all_currencies", "All Currencies") },
      ...currencies.map((curr) => ({
        value: curr,
        label: `${curr} ${t("limits", "Limits")}`,
      })),
    ];
  }, [currencies, t]);

  const [selectedCurrency, setSelectedCurrency] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all"); // 'all' | 'daily' | 'monthly' | 'annual'

  // Filter limits based on selected currency
  const filteredLimits = useMemo(() => {
    if (!Array.isArray(limitsList)) return [];
    return selectedCurrency === "all"
      ? limitsList
      : limitsList.filter((item) => item.CURRNAME === selectedCurrency);
  }, [limitsList, selectedCurrency]);

  // Aggregate totals for the 3 top colorful overview cards
  const summaryTotals = useMemo(() => {
    let dailyRemaining = 0;
    let monthlyRemaining = 0;
    let annualRemaining = 0;
    const curr = filteredLimits[0]?.CURRNAME || "XCG";

    filteredLimits.forEach((item) => {
      dailyRemaining += parseFloat(item.USERTXNDAILYREMAIN || 0) || 0;
      monthlyRemaining += parseFloat(item.USERTXNMONTHLYREMAIN || 0) || 0;
      annualRemaining += parseFloat(item.USERTXNANNUALREMAIN || 0) || 0;
    });

    return {
      currency: curr,
      dailyRemaining,
      monthlyRemaining,
      annualRemaining,
    };
  }, [filteredLimits]);

  // Transform all limit items with period tags and GUARANTEED UNIQUE KEYS
  const allCards = useMemo(() => {
    const list = [];
    filteredLimits.forEach((item, itemIdx) => {
      const curr = item.CURRNAME || "XCG";
      const title = item.TXNNAME || item.TXNID || `Transaction ${itemIdx + 1}`;
      const baseKey = `${item.TXNID || "txn"}-${curr}-${itemIdx}`;

      // Daily
      const dMax = parseFloat(item.USERTXNDAILYLIMIT || 0) || 0;
      const dUsed = parseFloat(item.USERTXNDAILYUSED || 0) || 0;
      const dRemain = parseFloat(item.USERTXNDAILYREMAIN || 0) || 0;

      // Monthly
      const mMax = parseFloat(item.USERTXNMONTHLYLIMIT || 0) || 0;
      const mUsed = parseFloat(item.USERTXNMONTHLYUSED || 0) || 0;
      const mRemain = parseFloat(item.USERTXNMONTHLYREMAIN || 0) || 0;

      // Annual
      const aMax = parseFloat(item.USERTXNANNUALLIMIT || 0) || 0;
      const aUsed = parseFloat(item.USERTXNANNUALUSED || 0) || 0;
      const aRemain = parseFloat(item.USERTXNANNUALREMAIN || 0) || 0;

      list.push({
        id: `${baseKey}-daily`,
        period: "daily",
        periodLabel: t("daily", "Daily"),
        title,
        currency: curr,
        max: dMax,
        used: dUsed,
        remaining: dRemain,
        theme: "blue",
        icon: Clock,
        strokeColor: "#2563eb",
        trackColor: "rgba(37, 99, 235, 0.12)",
      });

      list.push({
        id: `${baseKey}-monthly`,
        period: "monthly",
        periodLabel: t("monthly", "Monthly"),
        title,
        currency: curr,
        max: mMax,
        used: mUsed,
        remaining: mRemain,
        theme: "indigo",
        icon: Calendar,
        strokeColor: "#6366f1",
        trackColor: "rgba(99, 102, 241, 0.12)",
      });

      list.push({
        id: `${baseKey}-annual`,
        period: "annual",
        periodLabel: t("annual", "Annual"),
        title,
        currency: curr,
        max: aMax,
        used: aUsed,
        remaining: aRemain,
        theme: "emerald",
        icon: CalendarRange,
        strokeColor: "#10b981",
        trackColor: "rgba(16, 185, 129, 0.12)",
      });
    });

    return list;
  }, [filteredLimits, t]);

  // Filter cards by selected period
  const displayedCards = useMemo(() => {
    if (selectedPeriod === "all") return allCards;
    return allCards.filter((c) => c.period === selectedPeriod);
  }, [allCards, selectedPeriod]);

  const handlePeriodToggle = (periodId) => {
    setSelectedPeriod(periodId);
  };

  const handleKpiCardClick = (targetPeriod) => {
    // If already active, toggle back to all, otherwise switch to this period
    if (selectedPeriod === targetPeriod) {
      setSelectedPeriod("all");
    } else {
      setSelectedPeriod(targetPeriod);
    }
  };

  if (isLoading && limitsList.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-16 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="mt-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t("loading_limits", "Loading transaction limits...")}
          </p>
        </div>
      </div>
    );
  }

  const formatAmount = (curr, num) => {
    const val = typeof num === "number" && !isNaN(num) ? num : parseFloat(num || 0) || 0;
    return `${curr || "XCG"} ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)}`;
  };

  const periodTabs = [
    { id: "all", label: t("all_quotas", "All Quotas") },
    { id: "daily", label: t("daily", "Daily") },
    { id: "monthly", label: t("monthly", "Monthly") },
    { id: "annual", label: t("annual", "Annual") },
  ];

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* ── Row 1: 3 Colorful KPI Overview Cards (Clickable to Filter!) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Daily Quota Card (Blue) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick("daily")}
          className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer transition-all hover:shadow-md ${
            selectedPeriod === "daily"
              ? "border-blue-600 ring-2 ring-blue-500/30 dark:border-blue-500"
              : "border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("daily_limits", "Daily Quotas")}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {summaryTotals.currency}
            </span>
          </div>

          <div className="relative z-10 mt-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatAmount(summaryTotals.currency, summaryTotals.dailyRemaining)}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1.5 flex items-center justify-between">
              <span>{t("resets_midnight", "Resets every midnight at 00:00")}</span>
              {selectedPeriod === "daily" && (
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {t("filter_active", "Active Filter")}
                </span>
              )}
            </p>
          </div>

          {/* Soft SVG Wave */}
          <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
            <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
                fill="url(#blue-grad-limit)"
              />
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
                stroke="#2563eb"
                strokeWidth="1.2"
                fill="none"
              />
              <defs>
                <linearGradient id="blue-grad-limit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 2. Monthly Quota Card (Indigo) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick("monthly")}
          className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer transition-all hover:shadow-md ${
            selectedPeriod === "monthly"
              ? "border-indigo-600 ring-2 ring-indigo-500/30 dark:border-indigo-500"
              : "border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("monthly_limits", "Monthly Quotas")}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {summaryTotals.currency}
            </span>
          </div>

          <div className="relative z-10 mt-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatAmount(summaryTotals.currency, summaryTotals.monthlyRemaining)}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1.5 flex items-center justify-between">
              <span>{t("resets_first_day", "Resets 1st of every month")}</span>
              {selectedPeriod === "monthly" && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {t("filter_active", "Active Filter")}
                </span>
              )}
            </p>
          </div>

          {/* Soft SVG Wave */}
          <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
            <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
                fill="url(#indigo-grad-limit)"
              />
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
                stroke="#6366f1"
                strokeWidth="1.2"
                fill="none"
              />
              <defs>
                <linearGradient id="indigo-grad-limit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 3. Annual Quota Card (Emerald) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick("annual")}
          className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer transition-all hover:shadow-md ${
            selectedPeriod === "annual"
              ? "border-emerald-600 ring-2 ring-emerald-500/30 dark:border-emerald-500"
              : "border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CalendarRange size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("annual_limits", "Annual Quotas")}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {summaryTotals.currency}
            </span>
          </div>

          <div className="relative z-10 mt-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatAmount(summaryTotals.currency, summaryTotals.annualRemaining)}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1.5 flex items-center justify-between">
              <span>{t("resets_january", "Resets every January 1st")}</span>
              {selectedPeriod === "annual" && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {t("filter_active", "Active Filter")}
                </span>
              )}
            </p>
          </div>

          {/* Soft SVG Wave */}
          <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
            <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
                fill="url(#green-grad-limit)"
              />
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
                stroke="#10b981"
                strokeWidth="1.2"
                fill="none"
              />
              <defs>
                <linearGradient id="green-grad-limit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Row 2: Interactive Filter Controls ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Period Pill Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto no-scrollbar">
          {periodTabs.map((tab) => {
            const isActive = selectedPeriod === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePeriodToggle(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Currency Dropdown */}
        {currencyOptions.length > 1 && (
          <div className="w-full sm:w-52 shrink-0">
            <GlobalSelect
              value={selectedCurrency}
              onChange={(val) => setSelectedCurrency(val)}
              options={currencyOptions}
              placeholder={t("selectCurrency", "Select Currency")}
            />
          </div>
        )}
      </div>

      {/* ── Row 3: Limit Cards Grid (Clean 2-Column Responsive Layout) ── */}
      {displayedCards.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-12 text-center flex flex-col items-center">
          <Layers size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            {t("no_limits_for_filter", "No limits found for selected filter")}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {t("try_switching_currency", "Try selecting another currency or quota period.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {displayedCards.map((card) => {
            const percentageUsed =
              card.max > 0 ? (card.used / card.max) * 100 : 0;
            const clampedUsed = Math.min(100, Math.max(0, percentageUsed));

            // Dynamic color selection
            let statusColor = "#10b981"; // emerald
            let statusBg = "rgba(16, 185, 129, 0.12)";
            let badgeClass =
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
            if (clampedUsed >= 85) {
              statusColor = "#f43f5e"; // rose
              statusBg = "rgba(244, 63, 94, 0.12)";
              badgeClass =
                "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
            } else if (clampedUsed >= 60) {
              statusColor = "#f59e0b"; // amber
              statusBg = "rgba(245, 158, 11, 0.12)";
              badgeClass =
                "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
            }

            const IconComponent = card.icon;

            return (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-all group"
              >
                {/* Header: Icon, Name, Period Badge & Radial Gauge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        card.theme === "blue"
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : card.theme === "indigo"
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {card.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            card.theme === "blue"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                              : card.theme === "indigo"
                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          }`}
                        >
                          {card.periodLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {card.currency} · {t("quota_policy", "Merchant Quota Policy")}
                      </p>
                    </div>
                  </div>

                  {/* Radial Gauge */}
                  <RadialGauge
                    ratio={clampedUsed}
                    strokeColor={statusColor}
                    trackColor={statusBg}
                    size={48}
                    strokeWidth={4.5}
                  />
                </div>

                {/* Remaining Amount */}
                <div className="mb-3.5">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">
                    {t("remaining_balance", "Remaining Allowed Balance")}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {formatAmount(card.currency, card.remaining)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}
                    >
                      {clampedUsed.toFixed(0)}% {t("used", "used")}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-3.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${clampedUsed}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>

                {/* Footer Micro-Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">
                      {t("used_amount", "Used Amount")}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {formatAmount(card.currency, card.used)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">
                      {t("maximum_limit", "Maximum Limit")}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {formatAmount(card.currency, card.max)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
