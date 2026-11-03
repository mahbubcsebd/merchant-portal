import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Power,
  ChevronDown,
  ChevronUp,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Users,
  ShieldAlert,
  Loader2,
  DollarSign,
} from "lucide-react";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalDatePicker from "@/components/globals/GlobalDatePicker";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useDashboardContext } from "@/pages/dashboard/context";
import {
  getSubsidiaries,
  getOperationStore,
  openStore,
  closeStore,
  closePreviousOperationStore,
  closeCashBin,
  getDetailOperationCashier,
} from "@/lib/api/endpoints";
import { formatAmount } from "@/lib/utils/formatters";

export default function MerchantOperationsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openGlobalPopup } = useDialog();
  const { currency } = useDashboardContext();

  const [selectedBranch, setSelectedBranch] = useState("");
  const [operationDate, setOperationDate] = useState(() => new Date());
  const [expandedCashierId, setExpandedCashierId] = useState(null);

  // Formatted date string for API: "MM/DD/YYYY"
  const formattedApiDate = useMemo(() => {
    if (!operationDate) return "";
    return format(operationDate, "MM/dd/yyyy");
  }, [operationDate]);

  // Human-readable date string for UI
  const displayDate = useMemo(() => {
    if (!operationDate) return "";
    return format(operationDate, "MMMM d, yyyy");
  }, [operationDate]);

  // 1. Fetch Branches (Subsidiaries)
  const { data: subsidiariesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["getSubsidiaries"],
    queryFn: () => getSubsidiaries(),
    staleTime: 0,
  });

  const branchOptions = useMemo(() => {
    const list = subsidiariesData?.data || [];
    const opts = list.map((sub) => ({
      value: String(sub.CORPCUSTSUBID || sub.id || ""),
      label: sub.SUBNAME || sub.name || `Branch #${sub.CORPCUSTSUBID}`,
    }));
    return [{ value: "", label: t("select_branch", "Select Branch") }, ...opts];
  }, [subsidiariesData, t]);

  // Auto-select first branch when list loads if none selected
  useMemo(() => {
    if (!selectedBranch && branchOptions.length > 1) {
      setSelectedBranch(branchOptions[1].value);
    }
  }, [branchOptions, selectedBranch]);

  // 2. Fetch Store Operation Status & Cashiers
  const {
    data: storeData,
    isLoading: isLoadingStore,
    isFetching: isFetchingStore,
    refetch: refetchStore,
  } = useQuery({
    queryKey: ["getOperationStore", selectedBranch, formattedApiDate],
    queryFn: () =>
      getOperationStore({
        subsidiaryID: selectedBranch,
        operationDate: formattedApiDate,
      }),
    enabled: !!selectedBranch && !!formattedApiDate,
    staleTime: 0,
  });

  // Selected Branch Name
  const selectedBranchName = useMemo(() => {
    const match = branchOptions.find((b) => b.value === selectedBranch);
    return match?.label || t("branch", "Branch");
  }, [branchOptions, selectedBranch, t]);

  // 3. Mutations for Store & Cashier Operations
  const openStoreMutation = useMutation({
    mutationFn: () =>
      openStore({
        subsidiaryID: selectedBranch,
        operationDate: formattedApiDate,
      }),
    onSuccess: (data) => {
      if (data?.statusCode === 0 && data?.status === "success") {
        openGlobalPopup({
          title: t("store_opened_title", "Store Opened"),
          description:
            data.message ||
            t("store_opened_success", "Branch store has been successfully opened."),
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["getOperationStore", selectedBranch, formattedApiDate],
        });
      } else {
        openGlobalPopup({
          title: t("notice", "Notice"),
          description:
            data?.message ||
            t("store_open_failed", "Unable to open store for today."),
          type: "error",
        });
      }
    },
    onError: (err) => {
      openGlobalPopup({
        title: t("error", "Error"),
        description:
          err?.message ||
          t("server_error_open_store", "Cannot connect to server. Please try again."),
        type: "error",
      });
    },
  });

  const closeStoreMutation = useMutation({
    mutationFn: () =>
      closeStore({
        subsidiaryID: selectedBranch,
        operationDate: formattedApiDate,
      }),
    onSuccess: (data) => {
      if (data?.statusCode === 0 && data?.status === "success") {
        openGlobalPopup({
          title: t("store_closed_title", "Store Closed"),
          description:
            data.message ||
            t("store_closed_success", "Branch store has been successfully closed for today."),
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["getOperationStore", selectedBranch, formattedApiDate],
        });
      } else {
        openGlobalPopup({
          title: t("notice", "Notice"),
          description:
            data?.message ||
            t("store_close_failed", "Unable to close store for today."),
          type: "error",
        });
      }
    },
    onError: (err) => {
      openGlobalPopup({
        title: t("error", "Error"),
        description:
          err?.message ||
          t("server_error_close_store", "Cannot connect to server. Please try again."),
        type: "error",
      });
    },
  });

  const forceCloseMutation = useMutation({
    mutationFn: () =>
      closePreviousOperationStore({
        subsidiaryID: selectedBranch,
      }),
    onSuccess: (data) => {
      if (data?.statusCode === 0 && data?.status === "success") {
        openGlobalPopup({
          title: t("previous_store_closed", "Previous Session Closed"),
          description:
            data.message ||
            t(
              "force_close_success",
              "Previous open store session was successfully force closed.",
            ),
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["getOperationStore", selectedBranch, formattedApiDate],
        });
      } else {
        openGlobalPopup({
          title: t("error", "Error"),
          description:
            data?.message ||
            t("force_close_failed", "Failed to force close previous session."),
          type: "error",
        });
      }
    },
    onError: (err) => {
      openGlobalPopup({
        title: t("error", "Error"),
        description:
          err?.message ||
          t("server_error_force_close", "Cannot connect to server. Please try again."),
        type: "error",
      });
    },
  });

  const closeCashBinMutation = useMutation({
    mutationFn: (cashierId) =>
      closeCashBin({
        subsidiaryID: selectedBranch,
        operationDate: formattedApiDate,
        cashierId,
      }),
    onSuccess: (data) => {
      if (data?.statusCode === 0 && data?.status === "success") {
        openGlobalPopup({
          title: t("cash_bin_closed_title", "Cash Bin Closed"),
          description:
            data.message ||
            t("cash_bin_closed_success", "Cash bin closed successfully."),
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["getOperationStore", selectedBranch, formattedApiDate],
        });
      } else {
        openGlobalPopup({
          title: t("notice", "Notice"),
          description:
            data?.message ||
            t("cash_bin_close_failed", "Failed to close cashier bin."),
          type: "error",
        });
      }
    },
    onError: (err) => {
      openGlobalPopup({
        title: t("error", "Error"),
        description:
          err?.message ||
          t("server_error_close_cash_bin", "Cannot connect to server. Please try again."),
        type: "error",
      });
    },
  });

  // 4. Expanded Cashier Transaction History Query
  const {
    data: cashierTxnData,
    isLoading: isLoadingCashierTxns,
  } = useQuery({
    queryKey: [
      "getDetailOperationCashier",
      selectedBranch,
      formattedApiDate,
      expandedCashierId,
    ],
    queryFn: () =>
      getDetailOperationCashier({
        subsidiaryID: selectedBranch,
        operationDate: formattedApiDate,
        cashierId: expandedCashierId,
      }),
    enabled:
      !!selectedBranch &&
      !!formattedApiDate &&
      !!expandedCashierId,
    staleTime: 0,
  });

  // Action confirmations
  const handleOpenStore = () => {
    openConfirmDialog({
      title: t("open_store_confirm_title", "Open Branch Store?"),
      description: t(
        "open_store_confirm_desc",
        "Are you sure you want to open this branch for daily merchant operations? All till and cash bins will be initialized.",
      ),
      confirmText: t("open_store", "Open Store"),
      iconType: "info",
      onConfirm: () => {
        openStoreMutation.mutate();
      },
    });
  };

  const handleCloseStore = () => {
    // Check if any cashiers still have open bins
    const openCashiers = (storeData?.cashiers || []).filter(
      (c) => c.CASHBINSTATUS === "Y",
    );
    const hasOpenBins = openCashiers.length > 0;

    openConfirmDialog({
      title: t("close_store_confirm_title", "Close Branch Store?"),
      description: hasOpenBins
        ? t(
            "close_store_with_bins_warning",
            `Warning: ${openCashiers.length} cashier(s) still have open cash bins. It is highly recommended to close all cash bins before closing the store for the day. Do you still wish to proceed?`,
          )
        : t(
            "close_store_confirm_desc",
            "Are you sure you want to close this branch store for today? Once closed, transactions for this date cannot be reopened.",
          ),
      confirmText: t("close_store", "Close Store"),
      iconType: hasOpenBins ? "warning" : "danger",
      onConfirm: () => {
        closeStoreMutation.mutate();
      },
    });
  };

  const handleForceCloseStore = () => {
    openConfirmDialog({
      title: t("force_close_confirm_title", "Force Close Previous Session?"),
      description:
        storeData?.message ||
        t(
          "force_close_confirm_desc",
          "A previous operating day is still open or was not properly closed. Force closing will finalize that session so you can open today's store.",
        ),
      confirmText: t("force_close", "Force Close"),
      iconType: "danger",
      onConfirm: () => {
        forceCloseMutation.mutate();
      },
    });
  };

  const handleCloseCashBin = (cashier) => {
    openConfirmDialog({
      title: t("close_cash_bin_title", "Close Cash Bin?"),
      description: t(
        "close_cash_bin_desc",
        `Are you sure you want to close the cash bin for cashier ${cashier.CASHIERID}? This will freeze cash-in/cash-out for this till today.`,
      ),
      confirmText: t("close_bin", "Close Cash Bin"),
      iconType: "warning",
      onConfirm: () => {
        closeCashBinMutation.mutate(cashier.CASHIERID);
      },
    });
  };

  const toggleCashierHistory = (cashierId) => {
    setExpandedCashierId((prev) => (prev === cashierId ? null : cashierId));
  };

  // Status computation
  const isStillOpenPrevious = Boolean(storeData?.stillOpenStore);
  const isOpened = Boolean(storeData?.openedStore);
  const isClosed = Boolean(storeData?.closedStore);

  // Status badges & text
  const storeStatusMeta = useMemo(() => {
    if (!selectedBranch) {
      return {
        label: t("select_branch_to_view", "Select a branch to view status"),
        badge: t("pending_selection", "Pending"),
        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        indicator: "bg-slate-400",
      };
    }
    if (isLoadingStore) {
      return {
        label: t("loading_status", "Checking store operational state..."),
        badge: t("checking", "Checking..."),
        color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        indicator: "bg-blue-500 animate-pulse",
      };
    }
    if (isStillOpenPrevious) {
      return {
        label:
          storeData?.message ||
          t("previous_session_still_open", "Previous operating session is still open. Force close required."),
        badge: t("action_required", "Action Required"),
        color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
        indicator: "bg-amber-500",
      };
    }
    if (isOpened && !isClosed) {
      return {
        label: t("store_active_desc", "Branch store is actively open and accepting transactions today."),
        badge: t("store_opened", "Store Opened"),
        color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
        indicator: "bg-emerald-500",
      };
    }
    return {
      label: t("store_closed_desc", "Store is currently closed for the selected date."),
      badge: t("store_closed_for_today", "Store Closed"),
      color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
      indicator: "bg-rose-500",
    };
  }, [selectedBranch, isLoadingStore, isStillOpenPrevious, isOpened, isClosed, storeData, t]);

  const cashiers = storeData?.cashiers || [];
  const transactions = cashierTxnData?.transactions || [];

  return (
    <div className="w-full pb-10 space-y-6">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b55ad] dark:text-blue-400 mb-1">
            {t("operations", "Operations")}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t("merchant_operations", "Merchant Operations")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              "merchant_operations_desc",
              "Manage branch daily store opening/closing, active cashier till bins, and live cash reconciliations.",
            )}
          </p>
        </div>

        {/* Refresh Button */}
        {selectedBranch && (
          <button
            type="button"
            onClick={() => refetchStore()}
            disabled={isFetchingStore}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={isFetchingStore ? "animate-spin text-blue-600" : ""}
            />
            <span>{t("refresh", "Refresh")}</span>
          </button>
        )}
      </div>

      {/* ── Filter & Store Control Bar ─────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          {/* Dropdown Filters (Branch & Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-2xl">
            <GlobalSelect
              label={t("branch_name", "Branch Name")}
              value={selectedBranch}
              onChange={(val) => {
                setSelectedBranch(val);
                setExpandedCashierId(null);
              }}
              options={branchOptions}
              disabled={isLoadingBranches}
              containerClassName="w-full"
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5">
                {t("operation_date", "Operation Date")}
              </label>
              <GlobalDatePicker
                value={operationDate}
                onChange={(date) => {
                  setOperationDate(date);
                  setExpandedCashierId(null);
                }}
                placeholder={t("select_date", "Select Date")}
                className="h-10"
              />
            </div>
          </div>

          {/* Action Buttons (Open Store, Close Store, Force Close) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            {isStillOpenPrevious ? (
              <GlobalButton
                variant="danger"
                onClick={handleForceCloseStore}
                disabled={forceCloseMutation.isPending}
                className="h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {forceCloseMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Power size={15} />
                )}
                <span>{t("force_close_store", "Force Close Previous")}</span>
              </GlobalButton>
            ) : isOpened && !isClosed ? (
              <GlobalButton
                variant="danger"
                onClick={handleCloseStore}
                disabled={closeStoreMutation.isPending}
                className="h-10 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {closeStoreMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                <span>{t("close_store", "Close Store")}</span>
              </GlobalButton>
            ) : (
              <GlobalButton
                variant="primary"
                onClick={handleOpenStore}
                disabled={openStoreMutation.isPending || !selectedBranch}
                className="h-10 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {openStoreMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Unlock size={15} />
                )}
                <span>{t("open_store", "Open Store")}</span>
              </GlobalButton>
            )}
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${storeStatusMeta.indicator}`}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t("store_status", "Store Status")}:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {storeStatusMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${storeStatusMeta.color}`}
            >
              {storeStatusMeta.badge}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
              • {displayDate}
            </span>
          </div>
        </div>
      </div>

      {/* ── Financial Reconciliations & Totals ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debit */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("total_debit", "Total Debit")}
            </p>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatAmount(currency, storeData?.totalDebit || 0)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t("total_debits_charged", "Total debits processed today")}
          </p>
        </div>

        {/* Total Credit */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("total_credit", "Total Credit")}
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatAmount(currency, storeData?.totalCredit || 0)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t("total_credits_received", "Total credits received today")}
          </p>
        </div>

        {/* Total Cash In */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("total_cash_in", "Total Cash In")}
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatAmount(currency, storeData?.totalCashIn || 0)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t("cash_inflow_to_bins", "Cash inflow deposited into tills")}
          </p>
        </div>

        {/* Total Cash Out */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("total_cash_out", "Total Cash Out")}
            </p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatAmount(currency, storeData?.totalCashOut || 0)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t("cash_disbursed_from_bins", "Cash disbursed or paid out")}
          </p>
        </div>
      </div>

      {/* ── Active Cashiers & Till Bins Section ──────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table / Section Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("active_cashiers_tills", "Active Cashiers & Cash Bins")}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {cashiers.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedBranchName} • {displayDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-200/60 dark:border-amber-500/20">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              {t(
                "close_all_cashiers_note",
                "Note: Please close all cashiers before end of day close.",
              )}
            </span>
          </div>
        </div>

        {/* Content: Loading, Empty, or Table */}
        {isLoadingStore ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
            <div className="w-8 h-8 border-3 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">
              {t("loading_cashier_data", "Loading cashier till status...")}
            </p>
          </div>
        ) : cashiers.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <Store size={26} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t("no_active_cashiers", "No active cashiers for this operating session")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              {t(
                "no_cashiers_opened_bin_desc",
                "No cashier has opened a cash bin or recorded transactions under this branch for the selected date.",
              )}
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                    <th className="py-3 px-5">{t("cashier_id", "Cashier ID")}</th>
                    <th className="py-3 px-5">{t("bin_status", "Bin Status")}</th>
                    <th className="py-3 px-5 text-right">{t("total_debit", "Total Debit")}</th>
                    <th className="py-3 px-5 text-right">{t("total_credit", "Total Credit")}</th>
                    <th className="py-3 px-5 text-right">{t("total_cash_in", "Cash In")}</th>
                    <th className="py-3 px-5 text-right">{t("total_cash_out", "Cash Out")}</th>
                    <th className="py-3 px-5 text-center">{t("actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {cashiers.map((c) => {
                    const isBinOpen = c.CASHBINSTATUS === "Y";
                    const isExpanded = expandedCashierId === c.CASHIERID;

                    return (
                      <tbody key={c.CASHIERID}>
                        <tr
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                            isExpanded ? "bg-blue-50/30 dark:bg-blue-500/[0.03]" : ""
                          }`}
                        >
                          {/* Cashier ID */}
                          <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>{c.CASHIERID}</span>
                            </div>
                          </td>

                          {/* Bin Status */}
                          <td className="py-4 px-5">
                            {isBinOpen ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {t("cash_bin_opened", "Cash Bin Opened")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {t("cash_bin_closed_today", "Cash Bin Closed")}
                              </span>
                            )}
                          </td>

                          {/* Financials */}
                          <td className="py-4 px-5 text-right font-semibold text-rose-600 dark:text-rose-400">
                            {formatAmount(currency, c.TOTALDEBIT || 0)}
                          </td>
                          <td className="py-4 px-5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatAmount(currency, c.TOTALCREIDT || 0)}
                          </td>
                          <td className="py-4 px-5 text-right font-semibold text-blue-600 dark:text-blue-400">
                            {formatAmount(currency, c.TOTALCASHIN || 0)}
                          </td>
                          <td className="py-4 px-5 text-right font-semibold text-amber-600 dark:text-amber-400">
                            {formatAmount(currency, c.TOTALCASHOUT || 0)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-center gap-2">
                              {isBinOpen && (
                                <button
                                  type="button"
                                  onClick={() => handleCloseCashBin(c)}
                                  disabled={closeCashBinMutation.isPending}
                                  className="h-8 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer border border-rose-200/60 dark:border-rose-500/20"
                                >
                                  {t("close_bin", "Close Cash Bin")}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => toggleCashierHistory(c.CASHIERID)}
                                className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                  isExpanded
                                    ? "bg-[#2563eb] text-white border-[#2563eb] shadow-xs"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80"
                                }`}
                              >
                                <Receipt size={13} />
                                <span>{t("transactions", "Transactions")}</span>
                                {isExpanded ? (
                                  <ChevronUp size={13} />
                                ) : (
                                  <ChevronDown size={13} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Transaction History Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/60 dark:bg-slate-900/40">
                            <td colSpan={7} className="p-4 sm:p-6">
                              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                                  <div className="flex items-center gap-2">
                                    <Receipt
                                      size={15}
                                      className="text-blue-600 dark:text-blue-400"
                                    />
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                      {t("cashier_transactions_today", "Cashier Daily Transactions")}
                                      <span className="text-slate-400 font-normal lowercase ml-1">
                                        ({c.CASHIERID})
                                      </span>
                                    </h4>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {transactions.length}{" "}
                                    {transactions.length === 1
                                      ? t("record", "record")
                                      : t("records", "records")}
                                  </span>
                                </div>

                                {isLoadingCashierTxns ? (
                                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-medium">
                                      {t("loading_txns", "Loading cashier transactions...")}
                                    </p>
                                  </div>
                                ) : transactions.length === 0 ? (
                                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                                    {t("no_txns_at_this_time", "There are no transactions recorded at this time.")}
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                          <th className="py-2.5 px-3">
                                            {t("transaction_name", "Transaction")}
                                          </th>
                                          <th className="py-2.5 px-3">
                                            {t("description", "Description")}
                                          </th>
                                          <th className="py-2.5 px-3 text-right">
                                            {t("amount", "Amount")}
                                          </th>
                                          <th className="py-2.5 px-3 text-right">
                                            {t("time", "Time")}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {transactions.map((tx, idx) => {
                                          const rawTime = String(tx.CREATIONTIME || "").padStart(6, "0");
                                          const formattedTime =
                                            rawTime.length === 6
                                              ? `${rawTime.substring(0, 2)}:${rawTime.substring(2, 4)}:${rawTime.substring(4, 6)}`
                                              : rawTime;
                                          const isCredit = tx.TXNDCCODE === "C";

                                          return (
                                            <tr
                                              key={idx}
                                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                            >
                                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                                {tx.txnName || t("transaction", "Transaction")}
                                              </td>
                                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                                                {tx.TXNDESC1 || "-"}
                                              </td>
                                              <td
                                                className={`py-2.5 px-3 text-right font-bold ${
                                                  isCredit
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"
                                                }`}
                                              >
                                                {isCredit ? "+" : "-"}
                                                {formatAmount(
                                                  tx.currencyCode || currency,
                                                  tx.TXNAMOUNT || 0,
                                                )}
                                              </td>
                                              <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                                                {formattedTime}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Feed View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 p-4 space-y-4">
              {cashiers.map((c) => {
                const isBinOpen = c.CASHBINSTATUS === "Y";
                const isExpanded = expandedCashierId === c.CASHIERID;

                return (
                  <div key={c.CASHIERID} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {c.CASHIERID}
                        </span>
                      </div>
                      {isBinOpen ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {t("open", "Open")}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {t("closed", "Closed")}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          {t("total_debit", "Debit")}
                        </span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {formatAmount(currency, c.TOTALDEBIT || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          {t("total_credit", "Credit")}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatAmount(currency, c.TOTALCREIDT || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          {t("total_cash_in", "Cash In")}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatAmount(currency, c.TOTALCASHIN || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          {t("total_cash_out", "Cash Out")}
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {formatAmount(currency, c.TOTALCASHOUT || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isBinOpen && (
                        <button
                          type="button"
                          onClick={() => handleCloseCashBin(c)}
                          className="flex-1 h-9 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-xs font-semibold"
                        >
                          {t("close_bin", "Close Bin")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleCashierHistory(c.CASHIERID)}
                        className="flex-1 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Receipt size={13} />
                        <span>{t("transactions", "Transactions")}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                          {t("transactions_today", "Transactions Today")}
                        </p>
                        {isLoadingCashierTxns ? (
                          <div className="py-4 text-center text-xs text-slate-400">
                            {t("loading", "Loading...")}
                          </div>
                        ) : transactions.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">
                            {t("no_txns", "No transactions found.")}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {transactions.map((tx, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-white">
                                    {tx.txnName || "Transaction"}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {tx.TXNDESC1 || "-"}
                                  </p>
                                </div>
                                <span
                                  className={`font-bold ${
                                    tx.TXNDCCODE === "C"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {tx.TXNDCCODE === "C" ? "+" : "-"}
                                  {formatAmount(
                                    tx.currencyCode || currency,
                                    tx.TXNAMOUNT || 0,
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

