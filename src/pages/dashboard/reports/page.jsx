import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Download,
  FileText,
  Printer,
  Loader2,
} from "lucide-react";
import { format, parse } from "date-fns";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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

// ── Main Page ──────────────────────────────────────────────────────────────────
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
    e.preventDefault();

    const fieldsToValidate = [
      { name: 'fromDate', value: fromDate, label: t("from_date", "From Date"), required: true, type: 'date' },
      { name: 'toDate', value: toDate, label: t("to_date", "To Date"), required: true, type: 'date' }
    ];

    const validationResult = validate(fieldsToValidate);
    if (!validationResult.isValid) {
      return;
    }

    const fromDateStr = format(fromDate, "MM/dd/yyyy");
    const toDateStr = format(toDate, "MM/dd/yyyy");

    if (activeTab === "transaction") {
      setReportTitle("Transaction Report");
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
                title: "Error",
                description: data.message,
              });
              return;
            }
          } catch (e) {}
        }

        const formattedDate = format(new Date(), "MMM dd yyyy").toUpperCase();
        const prefix = activeTab === "settlement" 
          ? `${t("report_settlement", "Settlement")} Report as of ` 
          : `${t("report_refunds", "Refund")} Report as of `;

        downloadBlob(blob, `${prefix}${formattedDate}.csv`);
      } catch (err) {
        openGlobalPopup({
          type: "error",
          title: "Error",
          description: "Failed to generate report.",
        });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {t("ms_report", "Reports")}
        </h1>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white leading-snug">
          {t("generateReportsByTransAndStatus", "Generate Reports By Transaction And Status")}
        </h2>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-white/50 italic mt-0.5">
          {t("generateSalesReport", "Generate Sales Report By Transaction Types And Status")}
        </p>
      </div>
      <div className="w-full rounded-xl border border-slate-200 bg-white dark:bg-white/[0.03] p-4 sm:p-6 shadow-sm">
        <div className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { key: "transaction", label: t("transaction", "Transaction") },
            { key: "settlement", label: t("report_settlement", "Settlement") },
            { key: "refund", label: t("report_refunds", "Refund") },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                handleReset();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-[#2563eb] text-white shadow-md" : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-white/70"}`}
            >
              {tab.label} {t("ms_report", "Report")}
            </button>
          ))}
          <button
            type="button"
            onClick={async () => {
              if (!merchantId) return;
              setIsDownloading(true);
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
                        title: "Error",
                        description: data.message,
                      });
                      return;
                    }
                  } catch (e) {
                    // Not JSON, continue to download
                  }
                }

                const formattedDate = format(new Date(), "MMM dd yyyy").toUpperCase();
                const prefix = `${t("report_balance", "Balance Statement")} as of `;
                downloadBlob(blob, `${prefix}${formattedDate}.csv`);
              } catch (e) {
                openGlobalPopup({
                  type: "error",
                  title: "Error",
                  description: "Failed to generate statement.",
                });
              } finally {
                setIsDownloading(false);
              }
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-white/70 flex items-center gap-2"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Download size={14} />
            )}{" "}
            {t("report_balance", "Balance Statement")}
          </button>
        </div>
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
                {t("from_date", "From Date")} <span className="text-red-500">*</span>
              </label>
              <GlobalDatePicker
                value={fromDate}
                onChange={(d) => {
                  setFromDate(d);
                  clearError("fromDate");
                }}
              />
              {errors.fromDate && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.fromDate}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
                {t("to_date", "To Date")} <span className="text-red-500">*</span>
              </label>
              <GlobalDatePicker
                value={toDate}
                onChange={(d) => {
                  setToDate(d);
                  clearError("toDate");
                }}
              />
              {errors.toDate && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.toDate}
                </span>
              )}
            </div>
          </div>
          {activeTab === "transaction" && (
            <div className="border-t border-dashed border-slate-200 dark:border-white/10 pt-4 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-4">
                {t("global_filter_by", "Filter By")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <GlobalSelect
                  label={t("transaction_type", "Transaction Type")}
                  value={txType}
                  onChange={setTxType}
                  labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                  options={[
                    { value: "selected", label: "All Types" },
                    { value: "SCANTOPAY", label: "Scan to Pay" },
                    { value: "PAYQRCODE", label: "Pay by QR Code" },
                    { value: "PAYTOBANK", label: "Transfer To Bank" },
                    { value: "PAYTOEMAIL", label: "Pay By Email" },
                    { value: "PAYTOPHONE", label: "Pay to Mobile" },
                    { value: "TOPUP", label: "Mobile Recharge" },
                    { value: "SCANCOLLET", label: "Scan To Collect" },
                    { value: "REQBYQR", label: "Request by QR" },
                    { value: "PROFBYQR", label: "Profile QR" },
                    { value: "PAYBILL", label: "Pay Bills" },
                  ]}
                />
                <GlobalSelect
                  label={t("transaction_status", "Transaction Status")}
                  value={status}
                  onChange={setStatus}
                  labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                  options={[
                    { value: "selected", label: "All Statuses" },
                    { value: "P", label: "Processed" },
                    { value: "R", label: "Rejected" },
                  ]}
                />
              </div>
            </div>
          )}
          <div className="pt-2 max-w-2xl text-right">
            <GlobalButton
              type="submit"
              variant="primary"
              className="w-full sm:w-auto h-11 px-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              disabled={isFetching || isDownloading}
            >
              {(isFetching || isDownloading) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {t("global_generate", "Generate Report")}
            </GlobalButton>
          </div>
        </form>
        {activeTab === "transaction" && isFetching && !results && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            <p className="text-sm font-medium text-slate-500 dark:text-white/50">
              Fetching transactions...
            </p>
          </div>
        )}
        {activeTab === "transaction" && results && (
          <ResultTable
            data={results}
            reportTitle={reportTitle}
            filename={`${reportTitle} as of ${format(new Date(), "MMM dd yyyy").toUpperCase()}.csv`}
            fromDate={fromDate}
            toDate={toDate}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
