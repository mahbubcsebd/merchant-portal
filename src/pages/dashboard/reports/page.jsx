import { useState } from "react";
import {
  Download,
  Loader2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { useQuery } from "@tanstack/react-query";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useDialog } from "@/components/globals/DialogProvider";
import {
  transactionHistory,
  generateReportMerchantSettlement,
  generateReportMerchantRefund,
  generateReportBalanceStatement,
} from "@/lib/api/endpoints";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import ResultTable from "@/components/reports/ResultTable";
import { downloadBlob } from "@/lib/utils/reportUtils";
import GlobalDatePicker from "@/components/globals/GlobalDatePicker";
import { cn } from "@/lib/utils";

const REPORT_TABS = [
  { id: "transaction", label: "Transaction Report", translationKey: "transaction_report" },
  { id: "settlement", label: "Settlement Report", translationKey: "report_settlement" },
  { id: "refund", label: "Refund Report", translationKey: "report_refunds" },
];

export default function ReportsPage() {
  const { t } = useLanguage();
  const { accounts, profile } = useDashboardContext();
  const { openGlobalPopup } = useDialog();
  const { validate, errors, clearError, clearAllErrors } = useFormValidation();

  const [activeTab, setActiveTab] = useState("transaction");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [txType, setTxType] = useState("selected");
  const [status, setStatus] = useState("selected");

  const [reportTitle, setReportTitle] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);

  const accountId = accounts?.[0]?.ACCOUNTNUMBER;
  const merchantId = profile?.custId;

  const { data: txData, isFetching } = useQuery({
    queryKey: ["transactionHistory", appliedFilters],
    queryFn: () => transactionHistory(appliedFilters),
    enabled: !!appliedFilters && activeTab === "transaction",
    staleTime: 0,
  });

  const results = txData?.transactionHistories;

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setTxType("selected");
    setStatus("selected");
    setAppliedFilters(null);
    setReportTitle("");
    clearAllErrors();
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();

    const fieldsToValidate = [
      {
        name: "fromDate",
        value: fromDate,
        label: t("from_date", "From Date"),
        required: true,
        type: "date",
      },
      {
        name: "toDate",
        value: toDate,
        label: t("to_date", "To Date"),
        required: true,
        type: "date",
      },
    ];

    const validationResult = validate(fieldsToValidate);
    if (!validationResult.isValid) {
      return;
    }

    const fromDateStr = format(fromDate, "MM/dd/yyyy");
    const toDateStr = format(toDate, "MM/dd/yyyy");

    if (activeTab === "transaction") {
      setReportTitle(t("transaction_report", "Transaction Report"));
      setAppliedFilters({
        pageNum: 1,
        pageSize: 100,
        accountId,
        fromDate: fromDateStr,
        toDate: toDateStr,
        ...(txType !== "selected" && { txnType: txType }),
        ...(status !== "selected" && { txnStatus: status }),
      });
    } else {
      setIsDownloading(true);
      setDownloadingType(activeTab);
      try {
        const payload = {
          fromDate: fromDateStr,
          toDate: toDateStr,
          merchantId,
        };
        const blob =
          activeTab === "settlement"
            ? await generateReportMerchantSettlement(payload)
            : await generateReportMerchantRefund(payload);

        if (blob.type && blob.type.indexOf("application/json") !== -1) {
          const text = await blob.text();
          try {
            const data = JSON.parse(text);
            if (data && data.message) {
              openGlobalPopup({
                type: "error",
                title: t("error", "Error"),
                description: data.message,
              });
              return;
            }
          } catch (e) {}
        }

        const formattedDate = format(new Date(), "MMM dd yyyy").toUpperCase();
        const prefix =
          activeTab === "settlement"
            ? `${t("report_settlement", "Settlement")} Report as of `
            : `${t("report_refunds", "Refund")} Report as of `;

        downloadBlob(blob, `${prefix}${formattedDate}.csv`);
      } catch (err) {
        openGlobalPopup({
          type: "error",
          title: t("error", "Error"),
          description: t("failed_generate_report", "Failed to generate report."),
        });
      } finally {
        setIsDownloading(false);
        setDownloadingType(null);
      }
    }
  };

  const handleDownloadBalanceStatement = async () => {
    if (!merchantId) return;
    setIsDownloading(true);
    setDownloadingType("balance");
    try {
      const blob = await generateReportBalanceStatement({
        merchantId,
      });

      if (blob.type && blob.type.indexOf("application/json") !== -1) {
        const text = await blob.text();
        try {
          const data = JSON.parse(text);
          if (data && data.message) {
            openGlobalPopup({
              type: "error",
              title: t("error", "Error"),
              description: data.message,
            });
            return;
          }
        } catch (e) {}
      }

      const formattedDate = format(new Date(), "MMM dd yyyy").toUpperCase();
      const prefix = `${t("report_balance", "Balance Statement")} as of `;
      downloadBlob(blob, `${prefix}${formattedDate}.csv`);
    } catch (e) {
      openGlobalPopup({
        type: "error",
        title: t("error", "Error"),
        description: t("failed_generate_report", "Failed to generate statement."),
      });
    } finally {
      setIsDownloading(false);
      setDownloadingType(null);
    }
  };

  return (
    <div className="w-full space-y-4 pb-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("generateSalesReport", "Reports")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("reports_subtitle", "Export settlement logs, refund records, and transaction activity")}
          </p>
        </div>
      </div>

      {/* ── Main Filter Bar Card ────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        {/* Top Row: Clean Segmented Report Type Tabs & Quick Balance Statement Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/60">
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-0.5 shadow-2xs shrink-0">
            {REPORT_TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const isNextActive = REPORT_TABS[idx + 1]?.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    handleReset();
                  }}
                  className={cn(
                    "h-8 px-3.5 flex items-center justify-center text-xs font-semibold transition-all rounded-md cursor-pointer whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-[#2563eb] text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800",
                    !isActive &&
                      !isNextActive &&
                      idx < REPORT_TABS.length - 1 &&
                      "border-r border-slate-200/70 dark:border-slate-700/60",
                  )}
                >
                  {t(tab.translationKey, tab.label)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {(fromDate || toDate || txType !== "selected" || status !== "selected" || appliedFilters) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>{t("reset", "Reset")}</span>
              </button>
            )}

            {/* Quick Balance Statement Download Action inside top-right of the card */}
            <button
              type="button"
              onClick={handleDownloadBalanceStatement}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDownloading && downloadingType === "balance" ? (
                <Loader2 className="animate-spin w-3.5 h-3.5 text-[#2563eb]" />
              ) : (
                <Download size={13} className="text-slate-500 dark:text-slate-400" />
              )}
              <span>{t("report_balance", "Balance Statement")}</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid (Minimal, Clean 4-Column Layout) */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* From Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("from_date", "From Date")} <span className="text-rose-500">*</span>
              </label>
              <GlobalDatePicker
                value={fromDate}
                onChange={(d) => {
                  setFromDate(d);
                  clearError("fromDate");
                }}
              />
              {errors.fromDate && (
                <span className="text-[11px] text-rose-500 font-medium">
                  {errors.fromDate}
                </span>
              )}
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("to_date", "To Date")} <span className="text-rose-500">*</span>
              </label>
              <GlobalDatePicker
                value={toDate}
                onChange={(d) => {
                  setToDate(d);
                  clearError("toDate");
                }}
              />
              {errors.toDate && (
                <span className="text-[11px] text-rose-500 font-medium">
                  {errors.toDate}
                </span>
              )}
            </div>

            {/* Transaction Type (Only for transaction report) */}
            {activeTab === "transaction" ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("transaction_type", "Transaction Type")}
                </label>
                <GlobalSelect
                  value={txType}
                  onChange={setTxType}
                  options={[
                    { value: "selected", label: "All types" },
                    { value: "CASHOUT", label: "Pay by Cash Out" },
                    { value: "PAYTOBANK", label: "Transfer to Bank" },
                    { value: "PAYBILL", label: "Pay Bills" },
                    { value: "SCANTOPAY", label: "Scan to Pay" },
                    { value: "PAYQRCODE", label: "Pay by QR Code" },
                    { value: "PAYTOEMAIL", label: "Pay by Email" },
                    { value: "PAYTOPHONE", label: "Pay to Mobile" },
                    { value: "TOPUP", label: "Mobile Recharge" },
                    { value: "SCANCOLLET", label: "Scan to Collect" },
                    { value: "REQBYQR", label: "Request by QR" },
                    { value: "PROFBYQR", label: "Profile QR" },
                  ]}
                />
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}

            {/* Status (Only for transaction report) */}
            {activeTab === "transaction" ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("transaction_status", "Status")}
                </label>
                <GlobalSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "selected", label: "All Statuses" },
                    { value: "P", label: "Processed" },
                    { value: "R", label: "Failed" },
                  ]}
                />
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <GlobalButton
              type="submit"
              variant="primary"
              className="h-9 px-6 text-xs font-semibold"
              disabled={isFetching || isDownloading}
            >
              {(isFetching || (isDownloading && downloadingType === activeTab)) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              {activeTab === "transaction"
                ? t("generate_report", "Generate Report")
                : `${t("download", "Download")} ${t("ms_report", "Report")}`}
            </GlobalButton>
          </div>
        </form>
      </div>

      {/* ── Results Container ───────────────────────────────── */}
      {activeTab === "transaction" && isFetching && !results && (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {t("fetching_transactions", "Fetching transactions...")}
          </p>
        </div>
      )}

      {activeTab === "transaction" && results && (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <ResultTable
            data={results}
            reportTitle={reportTitle}
            filename={`${reportTitle} as of ${format(new Date(), "MMM dd yyyy").toUpperCase()}.csv`}
            fromDate={fromDate}
            toDate={toDate}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
