import React from "react";
import { useScheduledTxnHistory } from "@/hooks/useScheduledTransfers";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getCurrencyLabel } from "@/lib/utils/TransferUtils";

function formatHistoryDate(dateStr) {
  if (!dateStr) return "-";
  const cleanStr = String(dateStr).trim();
  if (cleanStr.length === 8 && /^\d{8}$/.test(cleanStr)) {
    const y = cleanStr.substr(0, 4);
    const m = cleanStr.substr(4, 2);
    const d = cleanStr.substr(6, 2);
    return `${m}/${d}/${y}`;
  }
  return cleanStr;
}

function formatHistoryTime(timeStr) {
  if (!timeStr) return "";
  const cleanTime = String(timeStr).trim();
  if (cleanTime.length === 4 && /^\d{4}$/.test(cleanTime)) {
    return `${cleanTime.substr(0, 2)}:${cleanTime.substr(2, 2)}`;
  }
  if (cleanTime.length === 6 && /^\d{6}$/.test(cleanTime)) {
    return `${cleanTime.substr(0, 2)}:${cleanTime.substr(2, 2)}:${cleanTime.substr(4, 2)}`;
  }
  return cleanTime;
}

function formatHistoryAmount(val) {
  if (val === undefined || val === null || val === "") return "0.00";
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function ScheduledTransferHistoryContent({
  transfer,
  welcomeData,
}) {
  const { t } = useLanguage();
  const scheduledTxnId = transfer?.SCHEDULEDTXNID || transfer?.id;
  const { data, isLoading, isError, error } = useScheduledTxnHistory(scheduledTxnId);

  const history = data?.history || [];
  const responseMessage = data?.message;

  const getStatusLabel = (statusVal) => {
    const s = String(statusVal || "").trim().toUpperCase();
    if (s === "P" || s === "POSTED" || s === "SUCCESS") return "POSTED";
    if (s === "R" || s === "REJECTED" || s === "F" || s === "FAILED") return "REJECTED";
    return s || "PENDING";
  };

  const getStatusBadge = (statusVal) => {
    const label = getStatusLabel(statusVal);
    if (label === "POSTED") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          {label}
        </span>
      );
    }
    if (label === "REJECTED") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
          {label}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center text-slate-500 dark:text-white/50 text-sm">
          {t("loading_history", "Loading scheduled transfer history...")}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm text-center">
          {error?.message || t("error_loading_history", "Failed to load scheduled transfer history.")}
        </div>
      )}

      {/* Empty State showing the API response message */}
      {!isLoading && !isError && history.length === 0 && (
        <div className="py-12 px-4 text-center text-slate-600 dark:text-white/70 text-sm">
          {responseMessage ||
            t(
              "no_history_records",
              "There are no available history record for this transaction.",
            )}
        </div>
      )}

      {!isLoading && !isError && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item, idx) => {
            const formattedDate = formatHistoryDate(item.TXNDATE);
            const formattedTime = formatHistoryTime(item.TXNTIME);
            const currency =
              getCurrencyLabel(welcomeData, item.BENFACCUR || item.TXNCURRENCY) ||
              transfer?.currency ||
              "";
            const dateDisplay = formattedTime
              ? `${formattedDate} ${formattedTime}`
              : formattedDate;

            return (
              <div
                key={item.CONFNUM || item.TXNDATE || idx}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500 dark:text-white/60">
                    {t("shp_pay_to", "Pay to")}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.BENFNAME || transfer?.BENFNAME || transfer?.payTo || "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500 dark:text-white/60">
                    {t("teAmount", "Amount")}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currency} {formatHistoryAmount(item.TXNAMOUNT)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500 dark:text-white/60">
                    {t("tranxHist_date", "Date")}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {dateDisplay}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500 dark:text-white/60">
                    {t("teStatus", "Status")}
                  </span>
                  <div>
                    {getStatusBadge(item.TXNSTS || item.status || item.TXNSTATUS)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
