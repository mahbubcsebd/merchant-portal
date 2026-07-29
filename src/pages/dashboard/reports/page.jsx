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

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const formatAmount = (amt) => {
  if (!amt) return "0.00";
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    parseFloat(amt),
  );
};

const formatReportDate = (whenStr, creationDate) => {
  if (whenStr && whenStr.length === 8) {
    try {
      const parsed = parse(whenStr, "yyyyMMdd", new Date());
      return format(parsed, "MMM dd, yyyy");
    } catch (e) {}
  }
  if (creationDate) {
    const date = new Date(Number(creationDate));
    return format(date, "MMM dd, yyyy");
  }
  return "";
};

// ── Logo SVG string (inline for print window) ──────────────────────────────────
const LOGO_SVG = `<svg width="120" height="47" viewBox="0 0 152 60" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M79.8418 5.89946C87.3551 5.89946 93.3339 11.9312 93.3339 21.5873C93.3339 31.2434 87.3551 37.3809 79.8418 37.3809C72.3286 37.3809 72.0905 35.2381 70.3974 32.6719V51.5608H61.0059V6.3492H70.3974V10.6878C72.0905 7.98941 75.3445 5.92591 79.8418 5.92591V5.89946ZM77.0641 14.1005C73.5455 14.1005 70.3709 16.7989 70.3709 21.6667C70.3709 26.5344 73.5455 29.2328 77.0641 29.2328C80.5826 29.2328 83.8101 26.4815 83.8101 21.6137C83.8101 16.746 80.6355 14.1005 77.0641 14.1005Z" fill="url(#g0)"/><path d="M114.524 6.34911H112.301V10.6877C110.661 7.98932 107.407 5.92583 102.857 5.92583C98.3067 5.92583 95.0792 7.75122 92.6189 10.9787C94.4178 13.8888 95.4496 17.5396 95.4496 21.6137C95.4496 25.6877 94.4178 29.3914 92.6189 32.3015C95.0792 35.5555 98.73 37.4073 102.804 37.4073C106.878 37.4073 110.608 35.3174 112.301 32.6454V36.984H121.693V23.3861L114.524 6.34911ZM105.608 29.2327C102.09 29.2327 98.9152 26.4814 98.9152 21.6137C98.9152 16.7459 102.09 14.1004 105.608 14.1004C109.127 14.1004 112.301 16.7988 112.301 21.6666C112.301 26.5343 109.18 29.2327 105.608 29.2327Z" fill="url(#g1)"/><path d="M141.402 6.34927H151.561L132.354 51.508H122.248L129.286 35.926L116.825 6.34927H127.301L134.391 25.5027L141.428 6.34927H141.402Z" fill="url(#g2)"/><path d="M6.03175 17.5667V43.4926C6.03175 43.9952 5.95238 44.3127 5.79365 44.4979C5.63492 44.6831 5.42328 44.7889 5.18519 44.8418C4.97355 44.8418 4.60318 44.8947 4.07407 44.8947C1.48148 40.5296 0 35.1063 0 30.0005C0 24.8947 1.32275 20.0799 3.65079 15.9C4.33862 16.4291 5.13228 16.9847 6.03175 17.5667Z" fill="url(#g3)"/><path d="M58.545 26.9049C58.545 26.6933 58.4921 26.4816 58.4656 26.2435C58.4392 26.0319 58.4127 25.7938 58.3863 25.5822C56.2699 11.4552 44.0741 0.635071 29.3651 0.635071C17.1737 0.635071 9.92066 5.97899 4.68257 14.0478C4.62966 14.1271 4.57675 14.18 4.55029 14.2594H13.3334V43.4922C13.3334 43.7568 13.3334 43.9684 13.3334 44.1271C13.3334 44.2859 13.4127 44.4181 13.545 44.524C13.6508 44.6298 13.7566 44.7091 13.836 44.7621C13.9154 44.815 14.1006 44.8414 14.3387 44.8679C14.5767 44.8679 14.7884 44.8679 14.9471 44.8679H16.7725V46.0054H4.76193C7.38098 50.0266 10.9524 53.3599 15.1588 55.688C15.291 55.7673 15.4233 55.8203 15.5556 55.8996C15.8466 56.0584 16.1111 56.1906 16.4021 56.3494C16.508 56.4023 16.6402 56.4816 16.7725 56.5345C16.9842 56.6404 17.1693 56.7197 17.381 56.7991C17.5662 56.8785 17.7514 56.9578 17.9365 57.0372C18.1482 57.1166 18.3863 57.2224 18.5979 57.3017C18.8096 57.3811 19.0476 57.4605 19.2593 57.5663C19.2593 57.5663 19.2593 57.5663 19.2857 57.5663C19.4974 57.6457 19.709 57.725 19.9207 57.8044C22.8836 58.8097 26.0318 59.3388 29.3387 59.3388C39.6297 59.3388 48.7037 54.0478 53.9418 46.0054H42.0106V44.8679H44.418C44.6297 44.8679 44.7884 44.8679 44.8942 44.7621C44.9736 44.6827 45.0794 44.6298 45.1852 44.524C45.291 44.4446 45.3704 44.3123 45.3969 44.1271C45.3969 43.9419 45.3969 43.7568 45.3969 43.5187L45.3175 25.4763C45.3175 23.0689 44.418 20.8203 42.6455 18.6774C41.2699 17.0372 39.5238 15.8467 37.381 15.0795C39.5503 14.2859 42.0106 13.889 44.7619 13.889C47.5133 13.889 48.9683 14.8943 50.4498 16.8785C51.9312 18.8626 52.672 21.4816 52.672 24.6562V43.4393C52.672 43.7039 52.672 43.9155 52.7249 44.0742C52.7778 44.233 52.8572 44.3652 52.963 44.4711C53.0688 44.5769 53.1746 44.6562 53.254 44.7091C53.3334 44.7621 53.5185 44.7885 53.7566 44.815C53.9947 44.815 54.2064 44.8414 54.3651 44.8414H54.6032C57.1958 40.4763 58.6773 35.3705 58.6773 29.9208C58.6773 28.889 58.6244 27.8837 58.5185 26.8785L58.545 26.9049ZM36.508 46.0319H22.3016V44.8943H24.709C24.9207 44.8943 25.0794 44.8943 25.1852 44.7885C25.2646 44.7091 25.3704 44.6562 25.4762 44.5504C25.582 44.4711 25.6614 44.3388 25.7143 44.1536C25.7672 43.9684 25.7937 43.7832 25.7937 43.5451L25.6614 25.5028C25.6614 22.4869 24.7619 19.8943 22.9365 17.725C22.0371 16.6668 20.8995 15.7409 19.4709 14.9208C21.3228 14.2594 23.3334 13.9155 25.4498 13.9155C27.5662 13.9155 29.7884 15.0266 31.1111 17.2753C32.4339 19.524 33.0953 21.9843 33.0953 24.7091V43.4922C33.0953 43.7568 33.0953 43.9684 33.0953 44.1271C33.0953 44.2859 33.1746 44.4181 33.3069 44.524C33.4127 44.6298 33.5185 44.7091 33.5979 44.7621C33.6773 44.815 33.8625 44.8414 34.1006 44.8679C34.3387 44.8679 34.5503 44.8679 34.709 44.8679H36.4815V46.0054L36.508 46.0319Z" fill="url(#g4)"/></g><defs><linearGradient id="g0" x1="66" y1="28" x2="140" y2="29" gradientUnits="userSpaceOnUse"><stop offset="0.3" stop-color="#00B9EE"/><stop offset="0.7" stop-color="#17598F"/></linearGradient><linearGradient id="g1" x1="66" y1="21" x2="140" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0.3" stop-color="#00B9EE"/><stop offset="0.7" stop-color="#17598F"/></linearGradient><linearGradient id="g2" x1="66" y1="28" x2="140" y2="29" gradientUnits="userSpaceOnUse"><stop offset="0.3" stop-color="#00B9EE"/><stop offset="0.7" stop-color="#17598F"/></linearGradient><radialGradient id="g3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(3 30) scale(10.5)"><stop offset="0.2" stop-color="#E78824"/><stop offset="0.9" stop-color="#E65625"/></radialGradient><radialGradient id="g4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(31.6 30) scale(28.25)"><stop offset="0.2" stop-color="#E78824"/><stop offset="0.9" stop-color="#E65625"/></radialGradient><clipPath id="clip0"><rect width="152" height="60" fill="white"/></clipPath></defs></svg>`;

// ── Print / PDF Handler ────────────────────────────────────────────────────────
function openPrintWindow({
  data,
  reportTitle,
  fromDate,
  toDate,
  mode = "print",
}) {
  const fromLabel = fromDate ? format(fromDate, "MMM dd, yyyy") : "—";
  const toLabel = toDate ? format(toDate, "MMM dd, yyyy") : "—";
  const generatedAt = format(new Date(), "MMM dd, yyyy  hh:mm a");

  const rows = data
    .map(
      (r, i) => `
    <tr class="${i % 2 === 0 ? "even" : "odd"}">
      <td>${formatReportDate(r.when, r.creationDate)}</td>
      <td class="mono">${r.confirmationNumber}</td>
      <td>${r.to || ""}</td>
      <td class="name">${r.benficiaryName || ""}</td>
      <td class="credit">${formatAmount(r.amount)} ${r.currencyCode}</td>
      <td>${r.txnName}</td>
      <td><span class="badge processed">Processed</span></td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
    .page { padding: 32px 40px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; }
    .report-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 8px; }
    .meta-bar { display: flex; gap: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    .meta-value { font-size: 12px; font-weight: 600; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #1e40af; color: #fff; }
    thead th { padding: 9px 10px; text-align: left; font-size: 9.5px; font-weight: 700; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
    td.mono  { font-family: monospace; font-size: 10px; }
    td.name  { font-weight: 600; color: #0f172a; }
    td.credit { font-weight: 700; color: #059669; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9.5px; font-weight: 700; background: #dcfce7; color: #166534; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>${LOGO_SVG}<div class="report-title">${reportTitle}</div></div>
    <div style="text-align:right"><div>Generated</div><div style="font-weight:600">${generatedAt}</div></div>
  </div>
  <div class="meta-bar">
    <div class="meta-item"><span class="meta-label">From Date</span><span class="meta-value">${fromLabel}</span></div>
    <div class="meta-item"><span class="meta-label">To Date</span><span class="meta-value">${toLabel}</span></div>
  </div>
  <table>
    <thead>
      <tr><th>Date</th><th>Confirmation No.</th><th>To Account</th><th>Beneficiary Name</th><th>Amount</th><th>Transaction Type</th><th>Status</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=1100,height=750,scrollbars=yes");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── CSV Download ───────────────────────────────────────────────────────────────
function downloadCSV(data, filename) {
  const header =
    "Date,Confirmation Number,To Account,Beneficiary Name,Amount,Transaction Type,Status\n";
  const rows = data
    .map(
      (r) =>
        `"${formatReportDate(r.when, r.creationDate)}","${r.confirmationNumber}","${r.to || ""}","${r.benficiaryName || ""}","${formatAmount(r.amount)} ${r.currencyCode}","${r.txnName}","Processed"`,
    )
    .join("\n");
  const uri = encodeURI("data:text/csv;charset=utf-8," + header + rows);
  const a = document.createElement("a");
  a.setAttribute("href", uri);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Date Picker ───────────────────────────────────────────────────────────────
function DatePicker({ value, onChange, placeholder = "Select Date" }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:border-[#2563eb]",
          value
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 dark:text-white/30",
        )}
      >
        <span>{value ? format(value, "PPP") : placeholder}</span>
        <CalendarIcon size={16} className="text-slate-400 dark:text-white/30" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2035, 11)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ── Result Table ───────────────────────────────────────────────────────────────
function ResultTable({ data, reportTitle, fromDate, toDate, onReset }) {
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
          Reset Filter
        </button>
      </div>
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-white/8 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e40af] text-white">
              {[
                "Date",
                "Confirmation No.",
                "To Account",
                "Beneficiary Name",
                "Amount",
                "Transaction Type",
                "Status",
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
              downloadCSV(
                data,
                `${reportTitle.toLowerCase().replace(/\s/g, "_")}.csv`,
              )
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

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { accounts, profile } = useDashboardContext();
  const { openGlobalPopup } = useDialog();
  const [activeTab, setActiveTab] = useState("transaction");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [txType, setTxType] = useState("selected");
  const [status, setStatus] = useState("selected");

  const [reportTitle, setReportTitle] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState({});

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
    setErrors({});
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fromDate) newErrors.fromDate = "From Date is required";
    if (!toDate) newErrors.toDate = "To Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

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

        downloadBlob(blob, `${activeTab}_report.csv`);
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
          Reports
        </h1>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white leading-snug">
          Generate Reports By Transaction And Status
        </h2>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-white/50 italic mt-0.5">
          Generate Sales Report By Transaction Types And Status
        </p>
      </div>
      <div className="w-full rounded-xl border border-slate-200 bg-white dark:bg-white/[0.03] p-4 sm:p-6 shadow-sm">
        <div className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { key: "transaction", label: "Transaction" },
            { key: "settlement", label: "Settlement" },
            { key: "refund", label: "Refund" },
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
              {tab.label} Report
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

                downloadBlob(blob, "balance_statement.csv");
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
            Balance Statement
          </button>
        </div>
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
                From Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={fromDate}
                onChange={(d) => {
                  setFromDate(d);
                  setErrors((prev) => ({ ...prev, fromDate: null }));
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
                To Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={toDate}
                onChange={(d) => {
                  setToDate(d);
                  setErrors((prev) => ({ ...prev, toDate: null }));
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
                Filter By
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <GlobalSelect
                  label="Transaction Type"
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
                  label="Transaction Status"
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
              Generate Report
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
            fromDate={fromDate}
            toDate={toDate}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
