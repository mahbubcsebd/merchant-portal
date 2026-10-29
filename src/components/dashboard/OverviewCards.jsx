import React, { useMemo } from "react";
import {
  CreditCard,
  ArrowUp,
  ArrowDown,
  BarChart2,
} from "lucide-react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function OverviewCards() {
  const { accounts, currency, dashboardInfo, transactions } = useDashboardContext();
  const { t } = useLanguage();

  const activeAccount = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    return (
      accounts.find(
        (a) => a.ACCOUNTNUMBER === currency || a.ACCOUNTNO === currency,
      ) || accounts[0]
    );
  }, [accounts, currency]);

  const currencyStr = activeAccount?.CURSHRTNAME || activeAccount?.CURCODE || "XCG";

  // Balance
  const totalBalanceRaw = activeAccount ? parseFloat(activeAccount.AVBALANCE || 0) : 0;
  const totalBalanceStr = `${currencyStr} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalBalanceRaw)}`;

  // Incoming calculations (fallback to transactions if dashboardInfo is empty)
  const incomingCalculated = useMemo(() => {
    if (dashboardInfo?.totalAmountIncoming != null) {
      return {
        amount: parseFloat(dashboardInfo.totalAmountIncoming || 0),
        count: parseInt(dashboardInfo.totalCountIncoming || 0, 10),
      };
    }
    const list = transactions || [];
    const credits = list.filter((tx) => tx.txnDebitCreditCode === "C");
    const amount = credits.reduce((sum, tx) => sum + (parseFloat(tx.amount || 0)), 0);
    return {
      amount,
      count: credits.length,
    };
  }, [dashboardInfo, transactions]);

  const incomingStr = `${currencyStr} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(incomingCalculated.amount)}`;

  // Outgoing calculations (fallback to transactions if dashboardInfo is empty)
  const outgoingCalculated = useMemo(() => {
    if (dashboardInfo?.totalAmountOutgoing != null) {
      return {
        amount: parseFloat(dashboardInfo.totalAmountOutgoing || 0),
        count: parseInt(dashboardInfo.totalCountOutgoing || 0, 10),
      };
    }
    const list = transactions || [];
    const debits = list.filter((tx) => tx.txnDebitCreditCode === "D");
    const amount = debits.reduce((sum, tx) => sum + (parseFloat(tx.amount || 0)), 0);
    return {
      amount,
      count: debits.length,
    };
  }, [dashboardInfo, transactions]);

  const outgoingStr = `${currencyStr} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(outgoingCalculated.amount)}`;

  // Net Movement: incoming - outgoing
  const netMovement = incomingCalculated.amount - outgoingCalculated.amount;
  const netSign = netMovement < 0 ? "-" : "";
  const netMovementStr = `${netSign}${currencyStr} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(netMovement))}`;

  // Month-over-month trends if chart data is available
  const trends = useMemo(() => {
    const chart = dashboardInfo?.chart || [];
    if (chart.length >= 2) {
      const prev = chart[chart.length - 2];
      const curr = chart[chart.length - 1];

      const prevIn = parseFloat(prev.totalAmountIncoming || 0);
      const currIn = parseFloat(curr.totalAmountIncoming || 0);
      let inTrend = null;
      if (prevIn > 0) {
        const diff = (((currIn - prevIn) / prevIn) * 100).toFixed(1);
        inTrend = `${diff >= 0 ? "↑ +" : "↓ "}${diff}%`;
      }

      const prevOut = parseFloat(prev.totalAmountOutgoing || 0);
      const currOut = parseFloat(curr.totalAmountOutgoing || 0);
      let outTrend = null;
      if (prevOut > 0) {
        const diff = (((currOut - prevOut) / prevOut) * 100).toFixed(1);
        outTrend = `${diff >= 0 ? "↑ +" : "↓ "}${diff}%`;
      }

      return { inTrend, outTrend };
    }
    return { inTrend: null, outTrend: null };
  }, [dashboardInfo]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* ── 1. Available Balance ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t("available_balance", "Available balance")}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            {currencyStr}
          </span>
        </div>

        <div className="relative z-10 mt-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalBalanceStr}
          </h3>
          <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-2">
            {t("updated_just_now", "Updated just now")}
          </p>
        </div>

        {/* Soft, subtle SVG wave in bottom-right */}
        <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
          <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
              fill="url(#blue-grad)"
            />
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
              stroke="#2563eb"
              strokeWidth="1.2"
              fill="none"
            />
            <defs>
              <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── 2. Incoming ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUp size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t("incoming", "Incoming")}
            </span>
          </div>
          {trends.inTrend && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              {trends.inTrend}
            </span>
          )}
        </div>

        <div className="relative z-10 mt-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {incomingStr}
          </h3>
          <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-2">
            {incomingCalculated.count} {t("transactions", "transactions")}
          </p>
        </div>

        {/* Soft, subtle SVG wave in bottom-right */}
        <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
          <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
              fill="url(#green-grad)"
            />
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
              stroke="#10b981"
              strokeWidth="1.2"
              fill="none"
            />
            <defs>
              <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── 3. Outgoing ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <ArrowDown size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t("outgoing", "Outgoing")}
            </span>
          </div>
          {trends.outTrend && (
            <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-0.5">
              {trends.outTrend}
            </span>
          )}
        </div>

        <div className="relative z-10 mt-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {outgoingStr}
          </h3>
          <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-2">
            {outgoingCalculated.count} {t("transactions", "transactions")}
          </p>
        </div>

        {/* Soft, subtle SVG wave in bottom-right */}
        <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
          <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
              fill="url(#rose-grad)"
            />
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
              stroke="#f43f5e"
              strokeWidth="1.2"
              fill="none"
            />
            <defs>
              <linearGradient id="rose-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── 4. Net Movement ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart2 size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t("net_movement", "Net movement")}
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {netMovementStr}
          </h3>
          <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-2">
            {t("total_incoming_outgoing", "Total incoming – outgoing")}
          </p>
        </div>

        {/* Soft, subtle SVG wave in bottom-right */}
        <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
          <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
              fill="url(#indigo-grad)"
            />
            <path
              d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
              stroke="#6366f1"
              strokeWidth="1.2"
              fill="none"
            />
            <defs>
              <linearGradient id="indigo-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
