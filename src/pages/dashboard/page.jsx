import React from "react";
import { Download } from "lucide-react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { TransactionStatusCard } from "@/components/dashboard/TransactionStatusCard";
import { CurrenciesCard } from "@/components/dashboard/CurrenciesCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import { TransactionActivityChart } from "@/components/dashboard/TransactionActivityChart";
import { PeriodDropdown, CurrencyDropdown } from "@/components/dashboard/Dropdowns";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function DashboardPage() {
  const { period, setPeriod, currency, setCurrency, transactions } = useDashboardContext();
  const { t } = useLanguage();

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transaction data to export.");
      return;
    }

    const headers = [
      "Confirmation Number",
      "Transaction Name",
      "Date",
      "Amount",
      "Currency",
      "Debit/Credit",
      "Status",
      "Description",
    ];

    const rows = transactions.map((tx) => [
      tx.confirmationNumber || "",
      `"${tx.txnName || ""}"`,
      tx.txnDate || tx.creationDate || "",
      tx.amount || "0",
      tx.currencyCode || "XCG",
      tx.txnDebitCreditCode || "",
      tx.txnStatus || tx.status || "",
      `"${(tx.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-5 pb-6">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("business_overview", "Business overview")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("merchant_activity_subtitle", "Your merchant activity at a glance")}
          </p>
        </div>

        {/* Action Controls: Currency Dropdown + Period Dropdown + Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Selection Dropdown */}
          <CurrencyDropdown value={currency} onChange={setCurrency} />

          {/* Period Dropdown */}
          <PeriodDropdown value={period} onChange={setPeriod} />

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shrink-0"
          >
            <Download size={13} className="text-slate-400 dark:text-slate-500" />
            <span>{t("export", "Export")}</span>
          </button>
        </div>
      </div>

      {/* ── Row 1: 4 KPI Cards ──────────────────────────────── */}
      <OverviewCards />

      {/* ── Row 2: Transaction Status & Currencies ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        <TransactionStatusCard />
        <CurrenciesCard />
      </div>

      {/* ── Row 3: Recent Activity & Recent Transactions ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        <RecentActivityCard />
        <RecentTransactionsCard />
      </div>

      {/* ── Row 4: Transaction Activity Chart ───────────────── */}
      <div className="w-full">
        <TransactionActivityChart />
      </div>
    </div>
  );
}
