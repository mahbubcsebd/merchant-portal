import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getTransactionStatusCode } from "@/lib/utils/formatters";

export function RecentTransactionsCard() {
  const { transactions } = useDashboardContext();
  const { t } = useLanguage();

  const formattedList = React.useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    return transactions.slice(0, 5).map((tx, idx) => {
      const title = tx.txnName || "Transaction";

      // Format date from creationDate ("20261028") & creationTime ("000953") or txnDate
      let formattedDate = tx.txnDate || "";
      if (!formattedDate && tx.creationDate) {
        const cDate = String(tx.creationDate);
        const cTime = tx.creationTime ? String(tx.creationTime).padStart(6, "0") : "";
        if (cDate.length === 8) {
          const y = cDate.substring(0, 4);
          const m = cDate.substring(4, 6);
          const d = cDate.substring(6, 8);
          if (cTime.length === 6) {
            const hh = cTime.substring(0, 2);
            const mm = cTime.substring(2, 4);
            const ss = cTime.substring(4, 6);
            formattedDate = `${m}/${d}/${y} ${hh}:${mm}:${ss}`;
          } else {
            formattedDate = `${m}/${d}/${y}`;
          }
        }
      }

      const isIncoming = tx.txnDebitCreditCode === "C";
      const amt = parseFloat(tx.amount || 0);
      const curr = tx.currencyCode || "XCG";
      const code = getTransactionStatusCode(tx);
      const rawStatus = String(tx.txnStatus ?? tx.status ?? "").trim().toUpperCase();

      let statusLabel = "Completed";
      if (rawStatus === "REV" || rawStatus === "REVERSED" || rawStatus === "REVERSAL" || code === "REV") {
        statusLabel = "Reversed";
      } else if (code === "P") {
        statusLabel = "Completed";
      } else if (code === "C") {
        statusLabel = "Pending";
      } else if (code === "R" || rawStatus === "F") {
        statusLabel = "Failed";
      }

      const sign = isIncoming ? "+" : "-";
      const formattedAmount = `${sign}${curr} ${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amt)}`;

      return {
        id: tx.confirmationNumber || idx,
        title,
        date: formattedDate,
        status: statusLabel,
        amountFormatted: formattedAmount,
        isIncoming,
        isBill: (tx.txnCode || "").toUpperCase().includes("BILL") || title.toLowerCase().includes("bill"),
      };
    });
  }, [transactions]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            {t("completed", "Completed")}
          </span>
        );
      case "Pending":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            {t("pending", "Pending")}
          </span>
        );
      case "Failed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
            {t("failed", "Failed")}
          </span>
        );
      case "Reversed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            {t("reversed", "Reversed")}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("recent_transactions", "Recent transactions")}
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ({formattedList.length})
          </span>
        </div>
        <Link
          to="/dashboard/live-transactions"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t("view_all", "View all")}
        </Link>
      </div>

      {/* Table */}
      <div className="w-full min-w-[380px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-[11px] font-medium text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div className="col-span-5">{t("transaction", "Transaction")}</div>
          <div className="col-span-3">{t("date_and_time", "Date & Time")}</div>
          <div className="col-span-2">{t("status", "Status")}</div>
          <div className="col-span-2 text-right">{t("amount", "Amount")}</div>
        </div>

        {/* Table Body */}
        {formattedList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            {t("no_transactions_found", "No recent transactions found")}
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
            {formattedList.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {/* Transaction column: Icon + Name */}
                <div className="col-span-5 flex items-center gap-2.5 pr-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.isBill
                        ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
                        : tx.isIncoming
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"
                    }`}
                  >
                    {tx.isBill ? (
                      <Receipt size={13} />
                    ) : tx.isIncoming ? (
                      <ArrowDownLeft size={13} />
                    ) : (
                      <ArrowUpRight size={13} />
                    )}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {tx.title}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="col-span-3 text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate">
                  {tx.date}
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  {getStatusBadge(tx.status)}
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                  <span
                    className={`font-bold text-xs whitespace-nowrap ${
                      tx.isIncoming
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {tx.amountFormatted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
