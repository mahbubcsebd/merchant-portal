import React from "react";
import { Store, Users, AlertTriangle, Receipt, ChevronUp, ChevronDown } from "lucide-react";
import { formatAmount } from "@/lib/utils/formatters";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { CashierTransactionsDrawer } from "./CashierTransactionsDrawer";

export function ActiveCashiersTable({
  cashiers = [],
  isLoading,
  selectedBranchName,
  displayDate,
  currency,
  expandedCashierId,
  onToggleHistory,
  onCloseCashBin,
  isClosingBin,
  cashierTransactions = [],
  isLoadingTxns = false,
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Table / Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("active_cashiers_tills", "Active Cashiers & Cash Bins")}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {cashiers.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedBranchName} • {displayDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-200/60 dark:border-amber-500/20">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            {t(
              "close_all_cashiers_note",
              "Note: Please close all cashiers before end of day close.",
            )}
          </span>
        </div>
      </div>

      {/* Content: Loading, Empty, or Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
          <div className="w-8 h-8 border-3 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">
            {t("loading_cashier_data", "Loading cashier till status...")}
          </p>
        </div>
      ) : cashiers.length === 0 ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
            <Store size={26} />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {t("no_active_cashiers", "No active cashiers for this operating session")}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            {t(
              "no_cashiers_opened_bin_desc",
              "No cashier has opened a cash bin or recorded transactions under this branch for the selected date.",
            )}
          </p>
        </div>
      ) : (
        <div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                  <th className="py-3 px-5">{t("cashier_id", "Cashier ID")}</th>
                  <th className="py-3 px-5">{t("bin_status", "Bin Status")}</th>
                  <th className="py-3 px-5 text-right">{t("total_debit", "Total Debit")}</th>
                  <th className="py-3 px-5 text-right">{t("total_credit", "Total Credit")}</th>
                  <th className="py-3 px-5 text-right">{t("total_cash_in", "Cash In")}</th>
                  <th className="py-3 px-5 text-right">{t("total_cash_out", "Cash Out")}</th>
                  <th className="py-3 px-5 text-center">{t("actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {cashiers.map((c) => {
                  const isBinOpen = c.CASHBINSTATUS === "Y";
                  const isExpanded = expandedCashierId === c.CASHIERID;

                  return (
                    <React.Fragment key={c.CASHIERID}>
                      <tr
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isExpanded ? "bg-blue-50/30 dark:bg-blue-500/[0.03]" : ""
                        }`}
                      >
                        {/* Cashier ID */}
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>{c.CASHIERID}</span>
                          </div>
                        </td>

                        {/* Bin Status */}
                        <td className="py-4 px-5">
                          {isBinOpen ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {t("cash_bin_opened", "Cash Bin Opened")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              {t("cash_bin_closed_today", "Cash Bin Closed")}
                            </span>
                          )}
                        </td>

                        {/* Financials */}
                        <td className="py-4 px-5 text-right font-semibold text-rose-600 dark:text-rose-400">
                          {formatAmount(currency, c.TOTALDEBIT || 0)}
                        </td>
                        <td className="py-4 px-5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatAmount(currency, c.TOTALCREIDT || 0)}
                        </td>
                        <td className="py-4 px-5 text-right font-semibold text-blue-600 dark:text-blue-400">
                          {formatAmount(currency, c.TOTALCASHIN || 0)}
                        </td>
                        <td className="py-4 px-5 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {formatAmount(currency, c.TOTALCASHOUT || 0)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-2">
                            {isBinOpen && (
                              <button
                                type="button"
                                onClick={() => onCloseCashBin(c)}
                                disabled={isClosingBin}
                                className="h-8 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer border border-rose-200/60 dark:border-rose-500/20"
                              >
                                {t("close_bin", "Close Cash Bin")}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onToggleHistory(c.CASHIERID)}
                              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                isExpanded
                                  ? "bg-[#2563eb] text-white border-[#2563eb] shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80"
                              }`}
                            >
                              <Receipt size={13} />
                              <span>{t("transactions", "Transactions")}</span>
                              {isExpanded ? (
                                <ChevronUp size={13} />
                              ) : (
                                <ChevronDown size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Transaction History Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-900/40">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <CashierTransactionsDrawer
                              cashierId={c.CASHIERID}
                              transactions={cashierTransactions}
                              isLoading={isLoadingTxns}
                              currency={currency}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Feed View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 p-4 space-y-4">
            {cashiers.map((c) => {
              const isBinOpen = c.CASHBINSTATUS === "Y";
              const isExpanded = expandedCashierId === c.CASHIERID;

              return (
                <div key={c.CASHIERID} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.CASHIERID}
                      </span>
                    </div>
                    {isBinOpen ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {t("open", "Open")}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {t("closed", "Closed")}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {t("total_debit", "Debit")}
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {formatAmount(currency, c.TOTALDEBIT || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {t("total_credit", "Credit")}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatAmount(currency, c.TOTALCREIDT || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {t("total_cash_in", "Cash In")}
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatAmount(currency, c.TOTALCASHIN || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {t("total_cash_out", "Cash Out")}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {formatAmount(currency, c.TOTALCASHOUT || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isBinOpen && (
                      <button
                        type="button"
                        onClick={() => onCloseCashBin(c)}
                        disabled={isClosingBin}
                        className="flex-1 h-9 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-xs font-semibold"
                      >
                        {t("close_bin", "Close Bin")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleHistory(c.CASHIERID)}
                      className="flex-1 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Receipt size={13} />
                      <span>{t("transactions", "Transactions")}</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3">
                      <CashierTransactionsDrawer
                        cashierId={c.CASHIERID}
                        transactions={cashierTransactions}
                        isLoading={isLoadingTxns}
                        currency={currency}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

