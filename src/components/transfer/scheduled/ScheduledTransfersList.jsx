import React from "react";
import { Eye, Pencil, Clock, Trash2 } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";

export default function ScheduledTransfersList({
  transfers,
  isLoading,
  isError,
  setParentView,
  handleView,
  handleEdit,
  handleHistory,
  handleDelete,
}) {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Scheduled Transfers
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 dark:text-white/50 text-sm border border-slate-200 dark:border-white/10 rounded-xl">
            Loading scheduled transfers...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 text-sm border border-slate-200 dark:border-white/10 rounded-xl">
            Error loading scheduled transfers.
          </div>
        ) : (
          <>
            {/* Table — Desktop View (Hidden on mobile) */}
            <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                    <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      Pay To
                    </th>
                    <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-center">
                      How Often
                    </th>
                    <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-center">
                      Until
                    </th>
                    <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">
                      Amount
                    </th>
                    <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-center">
                      Status
                    </th>
                    <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {transfers.map((t, idx) => (
                    <tr
                      key={t.SCHEDULEDTXNID || t.id || idx}
                      className={`${
                        idx % 2 === 0
                          ? "bg-blue-50/50 dark:bg-white/[0.02]"
                          : "bg-white dark:bg-transparent"
                      } hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}
                    >
                      <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                        {t.BENFNAME || t.payTo}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-white/70 text-center">
                        {/* We will need to map frequency code to text, assuming it's done before or we do it here */}
                        {t.howOften || t.FREQUENCY}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-white/70 text-center">
                        {t.until || t.ENDDATE}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-white/70 text-right">
                        {t.currency || t.BENFACCUR} {t.amount || t.TXNAMOUNT}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-white/70 text-center uppercase text-xs font-semibold">
                        {t.TXNSTATUS || t.status}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleView(t)}
                            className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(t)}
                            className="text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleHistory(t)}
                            className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                            title="History"
                          >
                            <Clock size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-8 text-center text-slate-500 dark:text-white/50"
                      >
                        No scheduled transfers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Card Feed — Mobile View (Hidden on desktop) */}
            <div className="md:hidden space-y-3 mb-8">
              {transfers.map((t, idx) => (
                <div
                  key={t.SCHEDULEDTXNID || t.id || idx}
                  className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
                >
                  {/* Row 1: Name & Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {t.BENFNAME || t.payTo}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-white/45 mt-1">
                        {t.howOften || t.FREQUENCY} · Until:{" "}
                        {t.until || t.ENDDATE || "Endless"}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        (t.TXNSTATUS || t.status) === "WAITING"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                          : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                      }`}
                    >
                      {t.TXNSTATUS || t.status}
                    </span>
                  </div>

                  {/* Row 2: Amount & Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {t.currency || t.BENFACCUR} {t.amount || t.TXNAMOUNT}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(t)}
                        className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                        title="View"
                      >
                        <Eye size={18} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleHistory(t)}
                        className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                        title="History"
                      >
                        <Clock size={18} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="text-slate-500 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {transfers.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-white/50 text-sm bg-white dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  No scheduled transfers found.
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-center mt-2">
          <GlobalButton
            onClick={() => setParentView("transfer")}
            variant="secondary"
            className="w-full sm:w-64 text-xs font-bold uppercase tracking-wider h-11"
          >
            Back to Transfer
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
