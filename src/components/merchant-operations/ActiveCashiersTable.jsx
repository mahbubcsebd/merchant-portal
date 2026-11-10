import React, { useState, useMemo, useEffect } from "react";
import {
  Loader2,
  Lock,
  Receipt,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { formatAmount } from "@/lib/utils/formatters";
import { useLanguage } from "@/components/globals/LanguageProvider";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalPagination from "@/components/globals/GlobalPagination";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'open' | 'closed'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when branch/cashiers change
  useEffect(() => {
    setCurrentPage(1);
  }, [cashiers]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const openCount = cashiers.filter((c) => c.CASHBINSTATUS === "Y").length;
    const closedCount = cashiers.length - openCount;
    return {
      all: cashiers.length,
      open: openCount,
      closed: closedCount,
    };
  }, [cashiers]);

  // Filtered cashiers by search & status
  const filteredCashiers = useMemo(() => {
    return cashiers.filter((c) => {
      // 1. Status filter
      if (statusFilter === "open" && c.CASHBINSTATUS !== "Y") return false;
      if (statusFilter === "closed" && c.CASHBINSTATUS === "Y") return false;

      // 2. Search query filter (cashier ID)
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const idMatch = String(c.CASHIERID || "").toLowerCase().includes(query);
        return idMatch;
      }

      return true;
    });
  }, [cashiers, statusFilter, searchTerm]);

  // Paginated slice
  const paginatedCashiers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCashiers.slice(start, start + pageSize);
  }, [filteredCashiers, currentPage, pageSize]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* ── Header with Title, Note, Search & Filter Controls ─── */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("active_cashiers", "Active Cashiers")}
            </h3>
            {cashiers.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  "close_all_cashiers_note",
                  "Note: Please close all cashiers before end of day close",
                )}
              </p>
            )}
          </div>
        </div>

        {/* Search & Status Filter Bar (visible when cashiers exist) */}
        {cashiers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Status Segmented Filter */}
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-0.5 text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("all", "All")} ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("open");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === "open"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("open", "Open")} ({counts.open})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("closed");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === "closed"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("closed", "Closed")} ({counts.closed})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <GlobalInput
                placeholder={t("search_cashier_id", "Search Cashier ID...")}
                leftIcon={<Search size={14} />}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                inputClassName="h-9 text-xs pl-9 pr-8"
                containerClassName="w-full"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                  title={t("clear_search", "Clear search")}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Content: Loading, Empty, or Table ──────────────────── */}
      {isLoading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin text-[#2563eb]" />
          <span className="text-xs font-medium">
            {t("loading", "Loading...")}
          </span>
        </div>
      ) : cashiers.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              "no_cashiers_opened_bin",
              "No cashiers has opened Cash Bin.",
            )}
          </p>
        </div>
      ) : filteredCashiers.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {t(
              "no_matching_cashiers",
              "No cashiers match your search or filter criteria.",
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-[#2563eb] hover:underline cursor-pointer"
          >
            {t("clear_filters", "Clear filters")}
          </button>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">{t("cashier_id", "Cashier ID")}</th>
                  <th className="py-3 px-5">{t("bin_status", "Bin Status")}</th>
                  <th className="py-3 px-5 text-right">
                    {t("total_debit", "Total Debit")}
                  </th>
                  <th className="py-3 px-5 text-right">
                    {t("total_credit", "Total Credit")}
                  </th>
                  <th className="py-3 px-5 text-right">
                    {t("total_cash_in", "Total Cash In")}
                  </th>
                  <th className="py-3 px-5 text-right">
                    {t("total_cash_out", "Total Cash Out")}
                  </th>
                  <th className="py-3 px-5 text-center">
                    {t("action", "Action")}
                  </th>
                  <th className="py-3 px-5 text-center">
                    {t("history", "History")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedCashiers.map((c, idx) => {
                  const isBinOpen = c.CASHBINSTATUS === "Y";
                  const isExpanded = expandedCashierId === c.CASHIERID;

                  return (
                    <React.Fragment key={`${c.CASHIERID}-${idx}`}>
                      <tr
                        className={`transition-colors ${
                          isExpanded
                            ? "bg-blue-50/70 dark:bg-white/[0.06]"
                            : idx % 2 === 0
                              ? "bg-white dark:bg-transparent"
                              : "bg-blue-50/50 dark:bg-white/[0.02]"
                        } hover:bg-slate-50 dark:hover:bg-white/[0.04]`}
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {c.CASHIERID}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {isBinOpen
                            ? t("cash_bin_opened", "Cash Bin Opened")
                            : t(
                                "cash_bin_closed_today",
                                "Cash Bin Closed For Today",
                              )}
                        </td>
                        <td className="py-3.5 px-5 text-right font-medium text-slate-800 dark:text-slate-200">
                          {formatAmount(currency, c.TOTALDEBIT || 0)}
                        </td>
                        <td className="py-3.5 px-5 text-right font-medium text-slate-800 dark:text-slate-200">
                          {formatAmount(currency, c.TOTALCREIDT || 0)}
                        </td>
                        <td className="py-3.5 px-5 text-right font-medium text-slate-800 dark:text-slate-200">
                          {formatAmount(currency, c.TOTALCASHIN || 0)}
                        </td>
                        <td className="py-3.5 px-5 text-right font-medium text-slate-800 dark:text-slate-200">
                          {formatAmount(currency, c.TOTALCASHOUT || 0)}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          {isBinOpen && (
                            <button
                              type="button"
                              onClick={() => onCloseCashBin(c)}
                              disabled={isClosingBin}
                              className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Lock size={12} />
                              <span>{t("close_cash_bin", "Close Cash Bin")}</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onToggleHistory(c.CASHIERID)}
                            className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer border inline-flex items-center gap-1.5 ${
                              isExpanded
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <Receipt size={13} />
                            <span>{t("transaction_history", "Transaction History")}</span>
                            {isExpanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Transaction History */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-800/20">
                          <td colSpan={8} className="p-5">
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

          {/* ── Mobile Cards ─────────────────────────────────── */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedCashiers.map((c) => {
              const isBinOpen = c.CASHBINSTATUS === "Y";
              const isExpanded = expandedCashierId === c.CASHIERID;

              return (
                <div
                  key={`mobile-cashier-${c.CASHIERID}-${idx}`}
                  className="p-4 space-y-3"
                >
                  {/* Cashier ID + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {c.CASHIERID}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isBinOpen
                        ? t("cash_bin_opened", "Cash Bin Opened")
                        : t(
                            "cash_bin_closed_today",
                            "Cash Bin Closed",
                          )}
                    </span>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/60 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">
                        {t("total_debit", "Debit")}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatAmount(currency, c.TOTALDEBIT || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">
                        {t("total_credit", "Credit")}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatAmount(currency, c.TOTALCREIDT || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">
                        {t("total_cash_in", "Cash In")}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatAmount(currency, c.TOTALCASHIN || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">
                        {t("total_cash_out", "Cash Out")}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatAmount(currency, c.TOTALCASHOUT || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isBinOpen && (
                      <button
                        type="button"
                        onClick={() => onCloseCashBin(c)}
                        disabled={isClosingBin}
                        className="flex-1 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lock size={13} />
                        <span>{t("close_cash_bin", "Close Cash Bin")}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleHistory(c.CASHIERID)}
                      className={`flex-1 h-9 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isExpanded
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Receipt size={13} />
                      <span>{t("transaction_history", "Transaction History")}</span>
                      {isExpanded ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <CashierTransactionsDrawer
                      cashierId={c.CASHIERID}
                      transactions={cashierTransactions}
                      isLoading={isLoadingTxns}
                      currency={currency}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Table Pagination ────────────────────────────── */}
          {filteredCashiers.length > 0 && (
            <div className="px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <GlobalPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalRecords={filteredCashiers.length}
                currentCount={paginatedCashiers.length}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
