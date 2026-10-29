import { useState, useMemo, useEffect, useRef } from "react";
import { Eye, Loader2 } from "lucide-react";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalPagination from "@/components/globals/GlobalPagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  transactionHistory,
  getSubsidiaries,
  getCashierList,
  listOfTerminal,
} from "@/lib/api/endpoints";
import { useDashboardContext } from "@/pages/dashboard/context";
import {
  formatDate,
  formatAmount,
  formatStatus,
  getStatusBadgeClass,
  getTransactionStatusCode,
} from "@/lib/utils/formatters";
import { useLanguage } from "@/components/globals/LanguageProvider";

const STATUS_TABS = [
  { id: "all", label: "All", translationKey: "all" },
  { id: "P", label: "Processed", translationKey: "processed" },
  { id: "R", label: "Failed", translationKey: "global_failed" },
];

const ALL_TRANSACTION_TYPES = [
  { id: "all", label: "All types", translationKey: "all_types" },
  {
    id: "CASHOUT",
    label: "Pay by Cash Out",
    translationKey: "pay_by_cash_out",
  },
  {
    id: "PAYTOBANK",
    label: "Transfer to Bank",
    translationKey: "transfer_to_bank",
  },
  { id: "PAYBILL", label: "Pay Bills", translationKey: "pay_bills" },
  { id: "SCANTOPAY", label: "Scan to Pay", translationKey: "scan_to_pay" },
  { id: "PAYQRCODE", label: "Pay by QR Code", translationKey: "pay_by_qr_code" },
  { id: "PAYTOEMAIL", label: "Pay by Email", translationKey: "pay_by_email" },
  { id: "PAYTOPHONE", label: "Pay to Mobile", translationKey: "pay_to_mobile" },
  { id: "TOPUP", label: "Mobile Recharge", translationKey: "mobile_recharge" },
  {
    id: "SCANCOLLET",
    label: "Scan to Collect",
    translationKey: "scan_to_collect",
  },
  { id: "REQBYQR", label: "Request by QR", translationKey: "req_by_qr" },
  { id: "PROFBYQR", label: "Profile QR", translationKey: "prof_by_qr" },
];

export default function LiveTransactionsPage() {
  const { t } = useLanguage();
  const { profile, accounts, currency } = useDashboardContext();
  const { openDetailDialog } = useDialog();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const [status, setStatus] = useState("all");
  const [txnType, setTxnType] = useState("all");
  const [branch, setBranch] = useState("selected");
  const [cashier, setCashier] = useState("selected");
  const [terminal, setTerminal] = useState("selected");

  // Fetch dropdown options
  const { data: subData } = useQuery({
    queryKey: ["getSubsidiaries"],
    queryFn: () => getSubsidiaries(),
    staleTime: 0,
  });

  const { data: cashierData } = useQuery({
    queryKey: ["getCashierList"],
    queryFn: () => getCashierList(),
    staleTime: 0,
  });

  const { data: terminalData } = useQuery({
    queryKey: ["listOfTerminal"],
    queryFn: () => listOfTerminal(),
    staleTime: 0,
  });

  const subOptions = useMemo(
    () => [
      { value: "selected", label: t("all_subsidiaries", "All Subsidiaries") },
      ...(subData?.data || []).map((s) => ({
        value: s.CORPCUSTSUBID,
        label: s.SUBNAME,
      })),
    ],
    [subData, t],
  );

  const cashierOptions = useMemo(
    () => [
      { value: "selected", label: t("all_cashiers", "All Cashiers") },
      ...(cashierData?.records || []).map((c) => ({
        value: c.merCashierID,
        label: `${c.cashierFName} ${c.cashierLName}`,
      })),
    ],
    [cashierData, t],
  );

  const terminalOptions = useMemo(
    () => [
      { value: "selected", label: t("all_terminals", "All Terminals") },
      ...(terminalData?.listOfTerminal || []).map((tItem) => ({
        value: tItem.terminalId,
        label: tItem.terminalName,
      })),
    ],
    [terminalData, t],
  );

  const currentAccountId = currency || accounts?.[0]?.ACCOUNTNUMBER || "";
  const tableRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({
    pageNum: 1,
    pageSize: 10,
    accountId: currentAccountId,
  });

  useEffect(() => {
    if (currentAccountId) {
      setAppliedFilters((prev) => {
        if (prev.accountId !== currentAccountId) {
          return { ...prev, accountId: currentAccountId, pageNum: 1 };
        }
        return prev;
      });
    }
  }, [currentAccountId]);

  const {
    data: txData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["transactionHistory", appliedFilters],
    queryFn: () => transactionHistory(appliedFilters),
    staleTime: 0,
    enabled: !!appliedFilters.accountId,
  });

  const rawTransactions = txData?.transactionHistories || [];

  const typeTabs = useMemo(() => {
    const list = [...ALL_TRANSACTION_TYPES];
    const existingIds = new Set(list.map((item) => item.id.toUpperCase()));

    // 1. From welcomeData metadata if present
    const metaTypes =
      welcomeData?.metaData?.TXNTYPE ||
      welcomeData?.metaData?.TRANSACTIONTYPE ||
      welcomeData?.metaData?.TXNTYPELIST;
    if (Array.isArray(metaTypes)) {
      metaTypes.forEach((mt) => {
        const id = String(mt.id || mt.code || "").toUpperCase();
        if (id && !existingIds.has(id)) {
          existingIds.add(id);
          list.push({
            id: mt.id || mt.code,
            label: mt.title || mt.name || mt.label || id,
          });
        }
      });
    }

    // 2. Dynamically include any unique types from rawTransactions
    if (Array.isArray(rawTransactions)) {
      rawTransactions.forEach((tx) => {
        const name = tx.txnName || "";
        const code = (tx.txnType || tx.txnCode || name).toUpperCase().trim();
        if (code && !existingIds.has(code) && code !== "ALL") {
          existingIds.add(code);
          list.push({
            id: tx.txnType || tx.txnCode || name,
            label: name || code,
          });
        }
      });
    }

    return list;
  }, [welcomeData, rawTransactions]);

  const totalRecords = useMemo(() => {
    const raw =
      txData?.totalRecords ??
      txData?.totalCount ??
      txData?.totalTransactions ??
      txData?.recordsTotal ??
      txData?.totalRows ??
      txData?.total ??
      txData?.count;
    if (raw !== undefined && raw !== null && raw !== "") {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) return num;
    }
    return null;
  }, [txData]);

  const transactions = useMemo(() => {
    let list = rawTransactions;

    if (
      appliedFilters.txnStatus &&
      appliedFilters.txnStatus !== "all" &&
      appliedFilters.txnStatus !== "selected"
    ) {
      const targetStatus = appliedFilters.txnStatus.toUpperCase();
      list = list.filter((tx) => {
        const code = getTransactionStatusCode(tx);
        if (targetStatus === "R" || targetStatus === "F") {
          return code === "R";
        }
        return code === targetStatus;
      });
    }

    if (
      appliedFilters.txnType &&
      appliedFilters.txnType !== "all" &&
      appliedFilters.txnType !== "selected"
    ) {
      const targetType = appliedFilters.txnType.toUpperCase().trim();
      list = list.filter((tx) => {
        const typeName = (tx.txnName || "").toUpperCase().trim();
        const typeCode = (
          tx.txnType ||
          tx.txnCode ||
          tx.transactionType ||
          ""
        ).toUpperCase().trim();

        if (targetType === "CASHOUT" || targetType === "PAYTOCASHOUT") {
          return (
            typeCode.includes("CASHOUT") ||
            typeName.includes("CASH OUT") ||
            typeName.includes("CASHOUT")
          );
        }
        if (targetType === "PAYTOBANK") {
          return (
            typeCode.includes("BANK") ||
            typeName.includes("BANK") ||
            typeName.includes("TRANSFER TO BANK")
          );
        }
        if (targetType === "PAYBILL") {
          return (
            typeCode.includes("BILL") ||
            typeName.includes("BILL") ||
            typeName.includes("PAY BILL")
          );
        }
        if (targetType === "SCANTOPAY") {
          return (
            typeCode.includes("SCANTOPAY") ||
            typeName.includes("SCAN TO PAY")
          );
        }
        if (targetType === "PAYQRCODE") {
          return (
            typeCode.includes("PAYQRCODE") ||
            typeName.includes("PAY BY QR")
          );
        }
        if (targetType === "PAYTOEMAIL") {
          return (
            typeCode.includes("PAYTOEMAIL") ||
            typeName.includes("EMAIL")
          );
        }
        if (targetType === "PAYTOPHONE") {
          return (
            typeCode.includes("PAYTOPHONE") ||
            typeName.includes("MOBILE") ||
            typeName.includes("PHONE")
          );
        }
        if (targetType === "TOPUP") {
          return (
            typeCode.includes("TOPUP") ||
            typeName.includes("RECHARGE")
          );
        }
        if (targetType === "SCANCOLLET" || targetType === "SCANTOCOLLECT") {
          return (
            typeCode.includes("SCANCOLLET") ||
            typeCode.includes("SCANTOCOLLECT") ||
            typeName.includes("SCAN TO COLLECT")
          );
        }
        return (
          typeCode === targetType ||
          typeName === targetType ||
          typeName.includes(targetType) ||
          targetType.includes(typeCode)
        );
      });
    }

    return list;
  }, [rawTransactions, appliedFilters.txnStatus, appliedFilters.txnType]);

  const handlePageChange = (newPage) => {
    setAppliedFilters((prev) => ({
      ...prev,
      pageNum: newPage,
    }));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageSizeChange = (newPageSize) => {
    setAppliedFilters((prev) => ({
      ...prev,
      pageNum: 1,
      pageSize: newPageSize,
    }));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setAppliedFilters((prev) => {
      const payload = {
        ...prev,
        pageNum: 1,
      };
      if (newStatus !== "all") {
        payload.txnStatus = newStatus;
      } else {
        delete payload.txnStatus;
      }
      return payload;
    });
  };

  const handleTypeChange = (newType) => {
    setTxnType(newType);
    setAppliedFilters((prev) => {
      const payload = {
        ...prev,
        pageNum: 1,
      };
      if (newType !== "all") {
        payload.txnType = newType;
      } else {
        delete payload.txnType;
      }
      return payload;
    });
  };

  const handleApplyFilter = () => {
    const payload = {
      pageNum: 1,
      pageSize: appliedFilters.pageSize || 10,
      accountId: currentAccountId,
    };
    if (status !== "all" && status !== "selected") payload.txnStatus = status;
    if (txnType !== "all" && txnType !== "selected") payload.txnType = txnType;
    if (branch !== "selected") payload.custSubID = branch;
    if (cashier !== "selected") payload.cashierID = cashier;
    if (terminal !== "selected") payload.termID = terminal;
    setAppliedFilters(payload);
  };

  const handleResetFilters = () => {
    setStatus("all");
    setTxnType("all");
    setBranch("selected");
    setCashier("selected");
    setTerminal("selected");
    setAppliedFilters({
      pageNum: 1,
      pageSize: appliedFilters.pageSize || 10,
      accountId: currentAccountId,
    });
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["getSubsidiaries"] });
    queryClient.invalidateQueries({ queryKey: ["getCashierList"] });
    queryClient.invalidateQueries({ queryKey: ["listOfTerminal"] });
  };

  const handleViewTxDetails = (tx) => {
    openDetailDialog({
      title: t("rmTransactionDetails", "Transaction Details"),
      accentHeader: (
        <>
          <span className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-1">
            {t("global_amount", "Amount")}
          </span>
          <span className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {formatAmount(tx.amount)}{" "}
            <span className="text-2xl text-slate-400 dark:text-white/50 font-medium">
              {tx.currencyCode}
            </span>
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadgeClass(tx)}`}
          >
            {formatStatus(tx, t)}
          </span>
        </>
      ),
      details: [
        { label: t("rmDateTimer", "Date"), value: formatDate(tx.creationDate) },
        { label: t("bp_ref1", "Reference No"), value: tx.confirmationNumber },
        { label: t("transaction_type", "Transaction Type"), value: tx.txnName },
        { label: t("mba_currency", "Currency Code"), value: tx.currencyCode },
        { label: t("teStatus", "Status"), value: formatStatus(tx, t) },
      ],
    });
  };

  return (
    <div className="w-full pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b55ad] dark:text-blue-400 mb-1">
            {t("activity", "Activity")}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t("liveTransactions", "Live Transactions")}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        {/* Dropdowns Grid (Branch, Cashier, Terminal ID & Filter button) */}
        <div className="flex flex-col xl:flex-row gap-4 mb-5 items-stretch xl:items-end">
          <GlobalSelect
            label={t("myQr_subsidiary", "Branch")}
            value={branch}
            onChange={setBranch}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={subOptions}
          />
          <GlobalSelect
            label={t("cashier", "Cashier")}
            value={cashier}
            onChange={setCashier}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={cashierOptions}
          />
          <GlobalSelect
            label={t("myqr_terminalID", "Terminal ID")}
            value={terminal}
            onChange={setTerminal}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={terminalOptions}
          />
          <div className="flex items-center gap-2 shrink-0">
            <GlobalButton
              onClick={handleApplyFilter}
              variant="primary"
              className="flex-1 xl:flex-none h-10 px-8 text-xs font-bold uppercase tracking-wider"
            >
              {t("global_filter", "Filter")}
            </GlobalButton>
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-4 text-xs font-semibold text-slate-500 hover:text-[#2563eb] dark:text-white/60 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {t("resetFilter", "Reset Filter")}
            </button>
          </div>
        </div>

        {/* Segmented Tab Filters (Status & Transaction Type) — Positioned on the right side of the table */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2.5 mb-6 pt-3 border-t border-slate-100 dark:border-white/5 max-w-full">
          {/* Status Tabs (Compact) */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-0.5 shadow-xs shrink-0">
            {STATUS_TABS.map((tab, idx) => {
              const isActive = status === tab.id;
              const isNextActive = STATUS_TABS[idx + 1]?.id === status;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id)}
                  className={cn(
                    "h-7.5 px-3 flex items-center justify-center text-xs font-semibold transition-all rounded-md cursor-pointer whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-[#2563eb] text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5",
                    !isActive &&
                      !isNextActive &&
                      idx < STATUS_TABS.length - 1 &&
                      "border-r border-slate-200/70 dark:border-white/10",
                  )}
                >
                  {t(tab.translationKey, tab.label)}
                </button>
              );
            })}
          </div>

          {/* Transaction Type Tabs (Compact, Dynamic & max-w-[400px]) */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-0.5 shadow-xs max-w-[400px] overflow-x-auto scrollbar-none shrink-0">
            {typeTabs.map((tab, idx) => {
              const isActive = txnType === tab.id;
              const isNextActive = typeTabs[idx + 1]?.id === txnType;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTypeChange(tab.id)}
                  className={cn(
                    "h-7.5 px-3 flex items-center justify-center text-xs font-semibold transition-all rounded-md cursor-pointer whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-[#2563eb] text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5",
                    !isActive &&
                      !isNextActive &&
                      idx < typeTabs.length - 1 &&
                      "border-r border-slate-200/70 dark:border-white/10",
                  )}
                >
                  {tab.translationKey ? t(tab.translationKey, tab.label) : tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <div
          ref={tableRef}
          className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-4"
        >
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("rmDateTimer", "Date")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("bp_ref1", "Reference No")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("global_amount", "Amount")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("transaction_type", "Transaction Type")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("userID", "User ID")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("teStatus", "Status")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-center">
                  {t("buttonsView", "View")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    {isFetching
                      ? t("loading_transactions", "Loading transactions...")
                      : t("no_transactions_available", "No transactions available")}
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr
                    key={idx}
                    className={`${idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-blue-50/50 dark:bg-white/[0.02]"} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}
                  >
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {formatDate(tx.creationDate)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {tx.confirmationNumber}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {formatAmount(tx.amount)} {tx.currencyCode}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {tx.txnName}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {tx.cashierID || "----"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(tx)}`}
                      >
                        {formatStatus(tx, t)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleViewTxDetails(tx)}
                        className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 rounded-xl">
              {isFetching
                ? t("loading_transactions", "Loading transactions...")
                : t("no_transactions_available", "No transactions available")}
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div
                key={idx}
                onClick={() => handleViewTxDetails(tx)}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 active:bg-slate-50 dark:active:bg-white/10 transition-colors cursor-pointer flex flex-col gap-3"
              >
                {/* Row 1: Type & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 uppercase tracking-wider">
                    {tx.txnName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getStatusBadgeClass(tx, "pill")}`}
                  >
                    {formatStatus(tx, t)}
                  </span>
                </div>

                {/* Row 2: Ref & Amount */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {t("bp_ref1", "Reference No")}: {tx.confirmationNumber}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                      {formatDate(tx.creationDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatAmount(tx.amount)}{" "}
                      <span className="text-xs text-slate-400 dark:text-white/40 font-medium">
                        {tx.currencyCode}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <GlobalPagination
          currentPage={appliedFilters.pageNum}
          pageSize={appliedFilters.pageSize}
          totalRecords={totalRecords}
          currentCount={transactions.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isFetching}
          className="border-t border-slate-100 dark:border-white/5 pt-3 mb-6"
        />

        <div className="flex justify-center mb-4">
          <GlobalButton
            onClick={handleRefresh}
            variant="primary"
            className="w-full sm:w-auto px-8 h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Refresh
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
