import { format } from "date-fns";
import { Download, FileText, Printer, CheckCircle2, XCircle, Clock } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  downloadCSV,
  openPrintWindow,
  formatAmount,
  formatReportDate,
} from "@/lib/utils/reportUtils";
import { getTransactionStatusCode } from "@/lib/utils/formatters";

export default function ResultTable({
  data,
  reportTitle,
  filename,
  fromDate,
  toDate,
  onReset,
}) {
  const { t } = useLanguage();
  if (!data) return null;

  const getStatusBadge = (row) => {
    const code = getTransactionStatusCode(row);
    if (code === "P") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
          <CheckCircle2 size={11} />
          {t("processed", "Processed")}
        </span>
      );
    }
    if (code === "C") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20">
          <Clock size={11} />
          {t("pending", "Pending")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20">
        <XCircle size={11} />
        {t("rejected", "Rejected")}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {reportTitle || t("report_results", "Report Results")}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data.length} {data.length === 1 ? t("record_found", "record found") : t("records_found", "records found")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t("resetFilter", "Reset Filter")}
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              {[
                t("date", "Date"),
                t("confirmation_no", "Confirmation No."),
                t("to_account", "To Account"),
                t("beneficiary_name", "Beneficiary Name"),
                t("amount", "Amount"),
                t("transaction_type", "Transaction Type"),
                t("global_status", "Status"),
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  {t("no_transactions_found", "No transactions available")}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.confirmationNumber || i}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {formatReportDate(row.when, row.creationDate)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {row.confirmationNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                    {row.to || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-semibold">
                    {row.benficiaryName || "—"}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatAmount(row.amount)} {row.currencyCode}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {row.txnName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(row)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2.5">
        {data.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            {t("no_transactions_found", "No transactions available")}
          </div>
        ) : (
          data.map((row, i) => (
            <div
              key={row.confirmationNumber || i}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {row.txnName}
                </span>
                {getStatusBadge(row)}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <div>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Ref: {row.confirmationNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatReportDate(row.when, row.creationDate)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatAmount(row.amount)} {row.currencyCode}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export & Action Buttons */}
      {data.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <GlobalButton
            variant="outline"
            leftIcon={<FileText size={13} />}
            onClick={() => downloadCSV(data, filename)}
            className="text-xs h-9 px-4 font-semibold"
          >
            {t("save_as_csv", "Save as CSV")}
          </GlobalButton>
          <GlobalButton
            variant="outline"
            leftIcon={<Download size={13} />}
            onClick={() =>
              openPrintWindow({
                data,
                reportTitle,
                fromDate,
                toDate,
                mode: "pdf",
              })
            }
            className="text-xs h-9 px-4 font-semibold"
          >
            {t("download_pdf", "Download PDF")}
          </GlobalButton>
          <GlobalButton
            variant="primary"
            leftIcon={<Printer size={13} />}
            onClick={() =>
              openPrintWindow({
                data,
                reportTitle,
                fromDate,
                toDate,
                mode: "print",
              })
            }
            className="text-xs h-9 px-4 font-semibold bg-blue-600 hover:bg-blue-700"
          >
            {t("print", "Print")}
          </GlobalButton>
        </div>
      )}
    </div>
  );
}
