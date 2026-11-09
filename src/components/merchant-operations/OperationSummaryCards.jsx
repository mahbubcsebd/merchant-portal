import React, { useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { formatAmount } from "@/lib/utils/formatters";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function OperationSummaryCards({ storeData, currency }) {
  const { t } = useLanguage();

  const totals = useMemo(() => {
    const cashiers = storeData?.cashiers || [];

    // 1. Check if backend provided root-level totals (camelCase or UPPERCASE)
    const rootDebit = storeData?.totalDebit ?? storeData?.TOTALDEBIT;
    const rootCredit =
      storeData?.totalCredit ??
      storeData?.TOTALCREDIT ??
      storeData?.TOTALCREIDT;
    const rootCashIn = storeData?.totalCashIn ?? storeData?.TOTALCASHIN;
    const rootCashOut = storeData?.totalCashOut ?? storeData?.TOTALCASHOUT;

    if (
      rootDebit !== undefined ||
      rootCredit !== undefined ||
      rootCashIn !== undefined ||
      rootCashOut !== undefined
    ) {
      return {
        debit: parseFloat(rootDebit) || 0,
        credit: parseFloat(rootCredit) || 0,
        cashIn: parseFloat(rootCashIn) || 0,
        cashOut: parseFloat(rootCashOut) || 0,
      };
    }

    // 2. Fallback: Aggregate totals from the branch cashiers list
    return cashiers.reduce(
      (acc, c) => ({
        debit:
          acc.debit + (parseFloat(c.TOTALDEBIT || c.totalDebit) || 0),
        credit:
          acc.credit +
          (parseFloat(
            c.TOTALCREIDT || c.TOTALCREDIT || c.totalCredit,
          ) || 0),
        cashIn:
          acc.cashIn + (parseFloat(c.TOTALCASHIN || c.totalCashIn) || 0),
        cashOut:
          acc.cashOut +
          (parseFloat(c.TOTALCASHOUT || c.totalCashOut) || 0),
      }),
      { debit: 0, credit: 0, cashIn: 0, cashOut: 0 },
    );
  }, [storeData]);

  const metrics = [
    {
      title: t("total_debit", "Total Debit"),
      amount: totals.debit,
      description: t("total_debits_charged", "Total debits processed today"),
      icon: TrendingDown,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      title: t("total_credit", "Total Credit"),
      amount: totals.credit,
      description: t("total_credits_received", "Total credits received today"),
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: t("total_cash_in", "Total Cash In"),
      amount: totals.cashIn,
      description: t("cash_inflow_to_bins", "Cash inflow deposited into tills"),
      icon: ArrowDownLeft,
      color: "text-[#2563eb] dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: t("total_cash_out", "Total Cash Out"),
      amount: totals.cashOut,
      description: t("cash_disbursed_from_bins", "Cash disbursed or paid out"),
      icon: ArrowUpRight,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.title}
              </p>
              <div
                className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}
              >
                <IconComponent size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatAmount(currency, item.amount)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

