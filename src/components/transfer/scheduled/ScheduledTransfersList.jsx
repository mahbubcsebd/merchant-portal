import React, { useState, useMemo } from "react";
import {
  Eye,
  Pencil,
  Clock,
  Trash2,
  CalendarClock,
  Search,
  ArrowLeft,
  Building2,
  Calendar,
  Repeat,
  DollarSign,
  Plus,
} from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalPagination from "@/components/globals/GlobalPagination";
import { useLanguage } from "@/components/globals/LanguageProvider";

export const isPendingScheduledTxn = (itemOrStatus) => {
  const status =
    typeof itemOrStatus === "string"
      ? itemOrStatus
      : itemOrStatus?.TXNSTATUS || itemOrStatus?.status || "";
  const s = String(status).trim().toUpperCase();
  return s === "WAITING" || (s !== "" && s !== "CANCELLED" && s !== "SUCCESS");
};

export default function ScheduledTransfersList({
  transfers = [],
  isLoading,
  isError,
  setParentView,
  handleView,
  handleEdit,
  handleHistory,
  handleDelete,
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter transfers by search term
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = String(item.BENFNAME || item.payTo || "").toLowerCase();
      const bank = String(item.bank || item.BENFBNKID || "").toLowerCase();
      const account = String(item.BENFBNKAC || item.BENFACC || "").toLowerCase();
      const amount = String(item.amount || item.TXNAMOUNT || "").toLowerCase();
      const frequency = String(item.howOften || item.FREQUENCY || "").toLowerCase();
      const status = String(item.TXNSTATUS || item.status || "").toLowerCase();

      return (
        name.includes(term) ||
        bank.includes(term) ||
        account.includes(term) ||
        amount.includes(term) ||
        frequency.includes(term) ||
        status.includes(term)
      );
    });
  }, [transfers, searchTerm]);

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalRecords = filteredTransfers.length;
  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransfers.slice(start, start + pageSize);
  }, [filteredTransfers, currentPage, pageSize]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setParentView("transfer")}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm group"
            title={t("back_to_transfer", "Back to Transfer")}
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider">
              <span>{t("transfer_to_bank", "Transfer To Bank")}</span>
              <span>/</span>
              <span className="text-[#2563eb] dark:text-blue-400">
                {t("scheduled_transfers", "Scheduled Transfers")}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t("manage_scheduled_transfers", "Manage Scheduled Transfers")}
            </h3>
          </div>
        </div>

        <GlobalButton
          onClick={() => setParentView("transfer")}
          variant="primary"
          className="h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          {t("new_scheduled_transfer", "New Scheduled Transfer")}
        </GlobalButton>
      </div>

      {/* ── Summary & Search Bar Card ── */}
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-[#2563eb] dark:text-blue-400 shrink-0">
            <CalendarClock size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-white/50">
              {t("total_scheduled", "Total Scheduled")}
            </p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              {transfers.length}
              <span className="text-xs font-medium text-slate-400 dark:text-white/40 ml-1.5">
                {transfers.length === 1 ? "schedule" : "schedules"}
              </span>
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <GlobalInput
            placeholder={t("search_scheduled_ph", "Search by beneficiary, bank, status...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} className="text-slate-400" />}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-white/40">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">
              {t("loading_scheduled_transfers", "Loading scheduled transfers...")}
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-500 text-sm">
            {t(
              "error_loading_scheduled_transfers",
              "Error loading scheduled transfers.",
            )}
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-white/30 mb-4">
              <CalendarClock size={26} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {searchTerm
                ? t("no_matching_scheduled_transfers", "No matching scheduled transfers found")
                : t("no_scheduled_transfers_found", "No scheduled transfers found")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mb-5">
              {searchTerm
                ? t("try_different_search", "Try searching with a different term or clear the search.")
                : t("schedule_first_transfer_hint", "Create recurring or future-dated transfers directly from the bank transfer form.")}
            </p>
            {searchTerm ? (
              <GlobalButton
                variant="secondary"
                onClick={() => setSearchTerm("")}
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
              >
                {t("clear_search", "Clear Search")}
              </GlobalButton>
            ) : (
              <GlobalButton
                variant="primary"
                onClick={() => setParentView("transfer")}
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={15} />
                {t("new_scheduled_transfer", "New Scheduled Transfer")}
              </GlobalButton>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
                      {t("pay_to", "Pay To")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-center">
                      {t("how_often", "How Often")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-center">
                      {t("until", "Until")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-right">
                      {t("amount", "Amount")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-center">
                      {t("status", "Status")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-right">
                      {t("actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paginatedTransfers.map((tItem, idx) => {
                    const isPending = isPendingScheduledTxn(tItem);
                    const statusStr = String(
                      tItem.TXNSTATUS || tItem.status || "",
                    )
                      .trim()
                      .toUpperCase();

                    return (
                      <tr
                        key={tItem.SCHEDULEDTXNID || tItem.id || idx}
                        className={`${
                          idx % 2 === 0
                            ? "bg-white dark:bg-transparent"
                            : "bg-blue-50/50 dark:bg-white/[0.02]"
                        } hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group`}
                      >
                        {/* Pay To / Beneficiary & Bank */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors">
                                {tItem.BENFNAME || tItem.payTo}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/40 mt-0.5">
                                {tItem.bank && <span>{tItem.bank}</span>}
                                {tItem.bank && tItem.BENFBNKAC && <span>•</span>}
                                {tItem.BENFBNKAC && (
                                  <span className="font-mono">{tItem.BENFBNKAC}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Frequency / How Often */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white/80">
                            <Repeat size={12} className="text-slate-400" />
                            {tItem.howOften || tItem.FREQUENCY}
                          </span>
                        </td>

                        {/* Until / End Date */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-medium text-slate-600 dark:text-white/70">
                            {tItem.until || (tItem.ENDDATE && tItem.ENDDATE !== "0" ? tItem.ENDDATE : "") || "—"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {tItem.amount || tItem.TXNAMOUNT}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-white/50 ml-1">
                            {tItem.currency || tItem.BENFACCUR}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              statusStr === "WAITING" || isPending
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/20"
                                : statusStr === "SUCCESS"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20"
                            }`}
                          >
                            {tItem.TXNSTATUS || tItem.status}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleView(tItem)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
                              title={t("view", "View")}
                            >
                              <Eye size={17} />
                            </button>
                            {isPending && (
                              <button
                                onClick={() => handleEdit(tItem)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors"
                                title={t("edit", "Edit")}
                              >
                                <Pencil size={17} />
                              </button>
                            )}
                            <button
                              onClick={() => handleHistory(tItem)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
                              title={t("history", "History")}
                            >
                              <Clock size={17} />
                            </button>
                            {isPending && (
                              <button
                                onClick={() => handleDelete(tItem)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                                title={t("delete", "Delete")}
                              >
                                <Trash2 size={17} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Feed (Hidden on desktop) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
              {paginatedTransfers.map((tItem, idx) => {
                const isPending = isPendingScheduledTxn(tItem);
                const statusStr = String(
                  tItem.TXNSTATUS || tItem.status || "",
                )
                  .trim()
                  .toUpperCase();

                return (
                  <div
                    key={`mobile-${tItem.SCHEDULEDTXNID || tItem.id || idx}`}
                    className="p-4 space-y-3.5 hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Header Row: Beneficiary Name & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {tItem.BENFNAME || tItem.payTo}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/45 mt-0.5">
                          {tItem.bank && <span>{tItem.bank}</span>}
                          {tItem.bank && tItem.BENFBNKAC && <span>•</span>}
                          {tItem.BENFBNKAC && (
                            <span className="font-mono">{tItem.BENFBNKAC}</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-block shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          statusStr === "WAITING" || isPending
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/20"
                            : statusStr === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20"
                        }`}
                      >
                        {tItem.TXNSTATUS || tItem.status}
                      </span>
                    </div>

                    {/* Details: Frequency & Amount */}
                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-white/40 uppercase">
                          {t("frequency", "Frequency")}
                        </span>
                        <p className="font-semibold text-slate-700 dark:text-white/80">
                          {tItem.howOften || tItem.FREQUENCY}
                          {Boolean(tItem.until || (tItem.ENDDATE && tItem.ENDDATE !== "0")) && (
                            <> · {tItem.until || tItem.ENDDATE}</>
                          )}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-white/40 uppercase">
                          {t("amount", "Amount")}
                        </span>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {tItem.amount || tItem.TXNAMOUNT}{" "}
                          <span className="text-xs font-semibold text-slate-500 dark:text-white/50">
                            {tItem.currency || tItem.BENFACCUR}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => handleView(tItem)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
                      >
                        <Eye size={14} />
                        {t("view", "View")}
                      </button>
                      {isPending && (
                        <button
                          onClick={() => handleEdit(tItem)}
                          className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-1.5 transition-colors"
                        >
                          <Pencil size={14} />
                          {t("edit", "Edit")}
                        </button>
                      )}
                      <button
                        onClick={() => handleHistory(tItem)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
                      >
                        <Clock size={14} />
                        {t("history", "History")}
                      </button>
                      {isPending && (
                        <button
                          onClick={() => handleDelete(tItem)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          {t("delete", "Delete")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalRecords > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-transparent">
                <GlobalPagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalRecords={totalRecords}
                  currentCount={paginatedTransfers.length}
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
    </div>
  );
}

