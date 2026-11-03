import React from "react";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { formatAmount } from "@/lib/utils/formatters";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function CashierTransactionsDrawer({
  cashierId,
  transactions,
  isLoading,
  currency,
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Receipt size={15} className="text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t("cashier_transactions_today", "Cashier Daily Transactions")}
            <span className="text-slate-400 font-normal lowercase ml-1">
              ({cashierId})
            </span>
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {transactions.length}{" "}
          {transactions.length === 1
            ? t("record", "record")
            : t("records", "records")}
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">
            {t("loading_txns", "Loading cashier transactions...")}
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
          {t(
            "no_txns_at_this_time",
            "There are no transactions recorded at this time.",
          )}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">
                  {t("transaction_name", "Transaction")}
                </th>
                <th className="py-2.5 px-3">{t("description", "Description")}</th>
                <th className="py-2.5 px-3 text-right">
                  {t("amount", "Amount")}
                </th>
                <th className="py-2.5 px-3 text-right">{t("time", "Time")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.map((tx, idx) => {
                const rawTime = String(tx.CREATIONTIME || "").padStart(6, "0");
                const formattedTime =
                  rawTime.length === 6
                    ? `${rawTime.substring(0, 2)}:${rawTime.substring(2, 4)}:${rawTime.substring(4, 6)}`
                    : rawTime;
                const isCredit = tx.TXNDCCODE === "C";

                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {tx.txnName || t("transaction", "Transaction")}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {tx.TXNDESC1 || "-"}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isCredit
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {formatAmount(
                        tx.currencyCode || currency,
                        tx.TXNAMOUNT || 0,
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {formattedTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

