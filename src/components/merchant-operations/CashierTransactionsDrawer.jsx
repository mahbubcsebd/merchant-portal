import React, { useState, useMemo, useEffect } from "react";
import { Loader2, Search, X } from "lucide-react";
import { formatAmount } from "@/lib/utils/formatters";
import { useLanguage } from "@/components/globals/LanguageProvider";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalPagination from "@/components/globals/GlobalPagination";

export function CashierTransactionsDrawer({
  cashierId,
  transactions = [],
  isLoading,
  currency,
}) {
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'C' | 'D'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Reset page when transactions or cashier changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setTypeFilter("all");
  }, [cashierId, transactions]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const credits = transactions.filter((tx) => tx.TXNDCCODE === "C").length;
    const debits = transactions.filter((tx) => tx.TXNDCCODE === "D").length;
    return {
      all: transactions.length,
      credit: credits,
      debit: debits,
    };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Type filter
      if (typeFilter !== "all" && tx.TXNDCCODE !== typeFilter) return false;

      // 2. Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const nameMatch = String(tx.txnName || "").toLowerCase().includes(query);
        const descMatch = String(tx.TXNDESC1 || "").toLowerCase().includes(query);
        const amountMatch = String(tx.TXNAMOUNT || "").includes(query);
        return nameMatch || descMatch || amountMatch;
      }

      return true;
    });
  }, [transactions, typeFilter, searchTerm]);

  // Paginated slice
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="py-6 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 size={16} className="animate-spin text-[#2563eb]" />
        <span className="text-xs">
          {t("loading_txns", "Loading transactions...")}
        </span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
        {t(
          "no_txns_at_this_time",
          "There are no transactions at this time.",
        )}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      {/* ── Drawer Header with Search & Filter ──────────────── */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t("cashier_transactions", "Cashier Transactions")}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            (#{cashierId})
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Credit/Debit Filter Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                typeFilter === "all"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {t("all", "All")} ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("C");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                typeFilter === "C"
                  ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {t("credit", "Credit")} ({counts.credit})
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("D");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                typeFilter === "D"
                  ? "bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {t("debit", "Debit")} ({counts.debit})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <GlobalInput
              placeholder={t("filter_transactions", "Filter txns...")}
              leftIcon={<Search size={13} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              inputClassName="h-8 text-xs pl-8 pr-7"
              containerClassName="w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={t("clear_search", "Clear search")}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Content ────────────────────────────────────── */}
      {filteredTransactions.length === 0 ? (
        <div className="py-6 px-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            {t(
              "no_matching_txns",
              "No transactions match your search or filter.",
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-[#2563eb] hover:underline cursor-pointer"
          >
            {t("clear_filters", "Clear filters")}
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-4">
                    {t("transaction_name", "Transaction")}
                  </th>
                  <th className="py-2.5 px-4">
                    {t("description", "Description")}
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    {t("amount", "Amount")}
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    {t("time", "Time")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedTransactions.map((tx, idx) => {
                  const rawTime = String(tx.CREATIONTIME || "").padStart(6, "0");
                  const formattedTime =
                    rawTime.length === 6
                      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2, 4)}:${rawTime.substring(4, 6)}`
                      : rawTime;
                  const isCredit = tx.TXNDCCODE === "C";
                  const amountStr = formatAmount(
                    tx.currencyCode || currency,
                    tx.TXNAMOUNT || 0,
                  );

                  return (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0
                          ? "bg-white dark:bg-transparent"
                          : "bg-blue-50/40 dark:bg-white/[0.02]"
                      } hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                        {tx.txnName || t("transaction", "Transaction")}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {tx.TXNDESC1 || "-"}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          isCredit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isCredit ? "" : "-"}
                        {amountStr}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {formattedTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Drawer Pagination */}
          {filteredTransactions.length > pageSize && (
            <div className="px-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <GlobalPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalRecords={filteredTransactions.length}
                currentCount={paginatedTransactions.length}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20]}
                className="py-2.5"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
