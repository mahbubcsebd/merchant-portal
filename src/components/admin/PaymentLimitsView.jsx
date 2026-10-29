import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getTransactionLimits } from "@/lib/api/endpoints";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalPagination from "@/components/globals/GlobalPagination";
import { cn } from "@/lib/utils";
import {
  Layers,
  ArrowUpRight,
} from "lucide-react";

// Mapping of transaction types/keywords to real SVG/PNG activity icons in public/images/activity/
const ACTIVITY_ICON_MAP = {
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
  DEFAULT: "/images/activity/qr-code-payByCode.svg",
};

function resolveActivityIcon(txnId = "", txnName = "") {
  const code = (txnId || "").toUpperCase().trim();
  const name = (txnName || "").toUpperCase().trim();

  if (ACTIVITY_ICON_MAP[code]) return ACTIVITY_ICON_MAP[code];

  if (code.includes("BANK") || name.includes("BANK")) {
    return ACTIVITY_ICON_MAP.PAYTOBANK;
  }
  if (code.includes("BILL") || name.includes("BILL")) {
    return ACTIVITY_ICON_MAP.PAYBILL;
  }
  if (code.includes("SCAN") || name.includes("SCAN") || code.includes("QR") || name.includes("QR")) {
    return ACTIVITY_ICON_MAP.SCANTOPAY;
  }
  if (code.includes("TOPUP") || name.includes("RECHARGE") || code.includes("MOBILE")) {
    return ACTIVITY_ICON_MAP.TOPUP;
  }
  if (code.includes("EMAIL") || name.includes("EMAIL") || name.includes("MAIL")) {
    return ACTIVITY_ICON_MAP.PAYTOEMAIL;
  }
  if (code.includes("PHONE") || name.includes("PHONE")) {
    return ACTIVITY_ICON_MAP.PAYTOPHONE;
  }
  if (code.includes("COLLECT") || name.includes("COLLECT")) {
    return ACTIVITY_ICON_MAP.SCANCOLLET;
  }

  return ACTIVITY_ICON_MAP.DEFAULT;
}

// ── Compact Radial Progress Gauge ──
function RadialGauge({
  ratio = 0,
  strokeColor = "#2563eb",
  trackColor = "rgba(37, 99, 235, 0.12)",
  size = 42,
  strokeWidth = 3.5,
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
      <span className="absolute text-[9px] font-bold text-slate-700 dark:text-slate-300">
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filter limits based on selected currency
  const filteredLimits = useMemo(() => {
    if (!Array.isArray(limitsList)) return [];
    return selectedCurrency === "all"
      ? limitsList
      : limitsList.filter((item) => item.CURRNAME === selectedCurrency);
  }, [limitsList, selectedCurrency]);

  // Transform all limit items with period tags and real activity icons
  const allCards = useMemo(() => {
    const list = [];
    filteredLimits.forEach((item, itemIdx) => {
      const curr = item.CURRNAME || "XCG";
      const title = item.TXNNAME || item.TXNID || `Transaction ${itemIdx + 1}`;
      const baseKey = `${item.TXNID || "txn"}-${curr}-${itemIdx}`;
      const iconSrc = resolveActivityIcon(item.TXNID, item.TXNNAME);

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
        iconSrc,
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
        iconSrc,
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
        iconSrc,
      });
    });

    return list;
  }, [filteredLimits, t]);

  // Filter cards by selected period
  const displayedCards = useMemo(() => {
    if (selectedPeriod === "all") return allCards;
    return allCards.filter((c) => c.period === selectedPeriod);
  }, [allCards, selectedPeriod]);

  // Paginated subset of cards
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return displayedCards.slice(startIndex, startIndex + pageSize);
  }, [displayedCards, currentPage, pageSize]);

  const handlePeriodToggle = (periodId) => {
    setSelectedPeriod(periodId);
    setCurrentPage(1);
  };

  const handleCurrencyChange = (val) => {
    setSelectedCurrency(val);
    setCurrentPage(1);
  };

  if (isLoading && limitsList.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-16 bg-white dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#2563eb] border-t-transparent" />
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
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* ── Filter Bar: Consistent Segmented Tabs & Currency Selector ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
        {/* Segmented Tab Filter (Same design as Reports / Live Transactions) */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-0.5 shadow-2xs shrink-0 overflow-x-auto no-scrollbar">
          {periodTabs.map((tab, idx) => {
            const isActive = selectedPeriod === tab.id;
            const isNextActive = periodTabs[idx + 1]?.id === selectedPeriod;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePeriodToggle(tab.id)}
                className={cn(
                  "h-8 px-3.5 flex items-center justify-center text-xs font-semibold transition-all rounded-md cursor-pointer whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-[#2563eb] text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5",
                  !isActive &&
                    !isNextActive &&
                    idx < periodTabs.length - 1 &&
                    "border-r border-slate-200/70 dark:border-white/10",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Currency Dropdown (Right Side) */}
        {currencyOptions.length > 1 && (
          <div className="w-full sm:w-52 shrink-0">
            <GlobalSelect
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              options={currencyOptions}
              placeholder={t("selectCurrency", "Select Currency")}
            />
          </div>
        )}
      </div>

      {/* ── Limit Cards Grid (2-Column Responsive Layout) ── */}
      {displayedCards.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-12 text-center flex flex-col items-center shadow-sm">
          <Layers size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            {t("no_limits_for_filter", "No limits found for selected filter")}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {t("try_switching_currency", "Try selecting another currency or quota period.")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {paginatedCards.map((card) => {
              const percentageUsed =
                card.max > 0 ? (card.used / card.max) * 100 : 0;
              const clampedUsed = Math.min(100, Math.max(0, percentageUsed));

              // Clean color-coding for status
              let statusColor = "#2563eb"; // Brand Blue
              let statusBg = "rgba(37, 99, 235, 0.12)";
              let badgeClass =
                "bg-blue-50 text-[#2563eb] dark:bg-blue-500/10 dark:text-blue-400";

              if (clampedUsed >= 85) {
                statusColor = "#f43f5e"; // Rose
                statusBg = "rgba(244, 63, 94, 0.12)";
                badgeClass =
                  "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
              } else if (clampedUsed >= 60) {
                statusColor = "#f59e0b"; // Amber
                statusBg = "rgba(245, 158, 11, 0.12)";
                badgeClass =
                  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
              }

              return (
                <div
                  key={card.id}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  {/* Top Row: Real Activity Icon, Title, Period Pill & Single Clean Radial Gauge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Real Activity Icon from public/images/activity */}
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0 p-1.5">
                        <img
                          src={card.iconSrc}
                          alt={card.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/activity/qr-code-payByCode.svg";
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {card.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                            {card.periodLabel}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {card.currency} · {t("quota_policy", "Merchant Quota Policy")}
                        </p>
                      </div>
                    </div>

                    {/* Single Radial Progress Indicator */}
                    <RadialGauge
                      ratio={clampedUsed}
                      strokeColor={statusColor}
                      trackColor={statusBg}
                      size={40}
                      strokeWidth={3.5}
                    />
                  </div>

                  {/* Middle Row: Remaining Balance Metric */}
                  <div className="my-2 p-2.5 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block leading-none">
                        {t("remaining_balance", "Remaining Allowed Balance")}
                      </span>
                      <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">
                        {formatAmount(card.currency, card.remaining)}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}
                    >
                      {clampedUsed.toFixed(0)}% {t("used", "used")}
                    </span>
                  </div>

                  {/* Footer Metrics Row: Used Amount & Maximum Limit */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 dark:border-white/10 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-normal">
                        {t("used_amount", "Used Amount")}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-xs">
                        {formatAmount(card.currency, card.used)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-normal">
                        {t("maximum_limit", "Maximum Limit")}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-xs">
                        {formatAmount(card.currency, card.max)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination Controls ── */}
          {displayedCards.length > pageSize && (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-3 shadow-sm">
              <GlobalPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalRecords={displayedCards.length}
                currentCount={paginatedCards.length}
                pageSizeOptions={[6, 12, 24, 48]}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
