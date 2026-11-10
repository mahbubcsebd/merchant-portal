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

  const items = [
    {
      label: t("total_debit", "Total Debit"),
      value: totals.debit,
      icon: TrendingDown,
    },
    {
      label: t("total_credit", "Total Credit"),
      value: totals.credit,
      icon: TrendingUp,
    },
    {
      label: t("total_cash_in", "Total Cash In"),
      value: totals.cashIn,
      icon: ArrowDownLeft,
    },
    {
      label: t("total_cash_out", "Total Cash Out"),
      value: totals.cashOut,
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Icon size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatAmount(currency, item.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
