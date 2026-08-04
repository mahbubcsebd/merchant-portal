import { format } from "date-fns";
import { Download, FileText, Printer } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { downloadCSV, openPrintWindow, formatAmount, formatReportDate } from "@/lib/utils/reportUtils";

export default function ResultTable({ data, reportTitle, filename, fromDate, toDate, onReset }) {
  const { t } = useLanguage();
  if (!data) return null;
  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          {data.length} results
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wider"
        >
          {t("resetFilter", "Reset Filter")}
        </button>
      </div>
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-white/8 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e40af] text-white">
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
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-8 text-center text-slate-500 dark:text-white/50"
                >
                  No transactions
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-slate-100 dark:border-white/5",
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/70",
                  )}
                >
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {formatReportDate(row.when, row.creationDate)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.confirmationNumber}
                  </td>
                  <td className="px-4 py-3 text-xs">{row.to || "----"}</td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    {row.benficiaryName || "----"}
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-bold text-xs whitespace-nowrap">
                    {formatAmount(row.amount)} {row.currencyCode}
                  </td>
                  <td className="px-4 py-3 text-xs">{row.txnName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                      Processed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 rounded-xl">
            No transactions available
          </div>
        ) : (
          data.map((row, i) => (
            <div
              key={i}
              className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 uppercase tracking-wider">
                  {row.txnName}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase">
                  Processed
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Ref: {row.confirmationNumber}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                    {formatReportDate(row.when, row.creationDate)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                    {formatAmount(row.amount)} {row.currencyCode}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <GlobalButton
            variant="secondary"
            leftIcon={<FileText size={14} />}
            onClick={() =>
              downloadCSV(data, filename)
            }
            className="text-xs uppercase"
          >
            Save as CSV
          </GlobalButton>
          <GlobalButton
            variant="secondary"
            leftIcon={<Download size={14} />}
            onClick={() =>
              openPrintWindow({
                data,
                reportTitle,
                fromDate,
                toDate,
                mode: "pdf",
              })
            }
            className="text-xs uppercase"
          >
            Download PDF
          </GlobalButton>
          <GlobalButton
            variant="primary"
            leftIcon={<Printer size={14} />}
            onClick={() =>
              openPrintWindow({
                data,
                reportTitle,
                fromDate,
                toDate,
                mode: "print",
              })
            }
            className="text-xs uppercase"
          >
            Print
          </GlobalButton>
        </div>
      )}
    </div>
  );
}
