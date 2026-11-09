import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
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
import { OperationControlBar } from "@/components/merchant-operations/OperationControlBar";
import { OperationSummaryCards } from "@/components/merchant-operations/OperationSummaryCards";
import { ActiveCashiersTable } from "@/components/merchant-operations/ActiveCashiersTable";

export default function MerchantOperationsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openGlobalPopup } = useDialog();
  const { currency: activeAccountId, accounts } = useDashboardContext();

  const currentAccount = useMemo(() => {
    return (
      accounts?.find(
        (a) => (a.ACCOUNTNUMBER || a.ACCOUNTNO) === activeAccountId,
      ) || accounts?.[0]
    );
  }, [accounts, activeAccountId]);

  const currencyCode =
    currentAccount?.CURSHRTNAME || currentAccount?.CURCODE || "";

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
    enabled: !!selectedBranch && !!formattedApiDate && !!expandedCashierId,
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
      onConfirm: () => openStoreMutation.mutate(),
    });
  };

  const handleCloseStore = () => {
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
      onConfirm: () => closeStoreMutation.mutate(),
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
      onConfirm: () => forceCloseMutation.mutate(),
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
      onConfirm: () => closeCashBinMutation.mutate(cashier.CASHIERID),
    });
  };

  const toggleCashierHistory = (cashierId) => {
    setExpandedCashierId((prev) => (prev === cashierId ? null : cashierId));
  };

  // Status computation
  const isStillOpenPrevious = Boolean(storeData?.stillOpenStore);
  const isOpened = Boolean(storeData?.openedStore);
  const isClosed = Boolean(storeData?.closedStore);

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
      <OperationControlBar
        selectedBranch={selectedBranch}
        onBranchChange={(val) => {
          setSelectedBranch(val);
          setExpandedCashierId(null);
        }}
        branchOptions={branchOptions}
        isLoadingBranches={isLoadingBranches}
        operationDate={operationDate}
        onDateChange={(date) => {
          setOperationDate(date);
          setExpandedCashierId(null);
        }}
        storeStatusMeta={storeStatusMeta}
        displayDate={displayDate}
        isStillOpenPrevious={isStillOpenPrevious}
        isOpened={isOpened}
        isClosed={isClosed}
        onOpenStore={handleOpenStore}
        onCloseStore={handleCloseStore}
        onForceCloseStore={handleForceCloseStore}
        isOpening={openStoreMutation.isPending}
        isClosing={closeStoreMutation.isPending}
        isForceClosing={forceCloseMutation.isPending}
      />

      {/* ── Financial Reconciliations & Totals ─────────────────── */}
      <OperationSummaryCards storeData={storeData} currency={currencyCode} />

      {/* ── Active Cashiers & Till Bins Section ──────────────────── */}
      <ActiveCashiersTable
        cashiers={cashiers}
        isLoading={isLoadingStore}
        selectedBranchName={selectedBranchName}
        displayDate={displayDate}
        currency={currencyCode}
        expandedCashierId={expandedCashierId}
        onToggleHistory={toggleCashierHistory}
        onCloseCashBin={handleCloseCashBin}
        isClosingBin={closeCashBinMutation.isPending}
        cashierTransactions={transactions}
        isLoadingTxns={isLoadingCashierTxns}
      />
    </div>
  );
}
