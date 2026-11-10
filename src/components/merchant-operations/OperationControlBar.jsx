import React from "react";
import { Loader2, MapPin, Lock, Unlock, Power } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalDatePicker from "@/components/globals/GlobalDatePicker";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function OperationControlBar({
  selectedBranch,
  onBranchChange,
  branchOptions,
  isLoadingBranches,
  operationDate,
  onDateChange,
  storeStatusMeta,
  displayDate,
  isStillOpenPrevious,
  isOpened,
  isClosed,
  onOpenStore,
  onCloseStore,
  onForceCloseStore,
  isOpening,
  isClosing,
  isForceClosing,
}) {
  const { t } = useLanguage();

  // Filter out the placeholder "Select Branch" option
  const branches = branchOptions.filter((b) => b.value !== "");

  // Status badge design matching portal_uat states (Green = Opened, Red = Closed, Grey = Not Opened Yet)
  let statusBadge = null;

  if (isStillOpenPrevious) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        {t("store_not_opened_yet", "Store Not Opened Yet")}
      </span>
    );
  } else if (isOpened && !isClosed) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {t("store_opened", "Store Opened")}
      </span>
    );
  } else if (isClosed) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        {t("store_closed_for_today", "Store Closed For Today")}
      </span>
    );
  } else {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        {t("store_not_opened_yet", "Store Not Opened Yet")}
      </span>
    );
  }

  // Button styles: Green (Opened), Red (Closed), Grey (Not Opened Yet); Active is primary blue
  const getBranchButtonStyles = (branch, isActive) => {
    // When active, the selected button is always primary blue
    if (isActive) {
      let activeDot = "bg-white";
      if (branch.statusKey === "opened") {
        activeDot = "bg-emerald-300 ring-2 ring-emerald-300/40 animate-pulse";
      } else if (branch.statusKey === "closed") {
        activeDot = "bg-rose-300 ring-2 ring-rose-300/40";
      } else {
        activeDot = "bg-slate-300 ring-2 ring-slate-300/40";
      }

      return {
        button:
          "bg-[#2563eb] text-white border-[#2563eb] shadow-sm ring-2 ring-blue-500/25",
        pin: "text-white/80",
        dot: activeDot,
        tooltip:
          branch.statusKey === "opened"
            ? t("store_opened", "Store Opened")
            : branch.statusKey === "closed"
            ? t("store_closed", "Store Closed")
            : t("store_not_opened_yet", "Store Not Opened Yet"),
      };
    }

    // Inactive button backgrounds: Green, Red, Grey
    // 1. Green: Store Opened
    if (branch.statusKey === "opened") {
      return {
        button:
          "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs dark:bg-emerald-600 dark:border-emerald-700 dark:hover:bg-emerald-500",
        pin: "text-white/90",
        dot: "bg-white animate-pulse",
        tooltip: t("store_opened", "Store Opened"),
      };
    }

    // 2. Red: Store Closed
    if (branch.statusKey === "closed") {
      return {
        button:
          "bg-rose-600 text-white border-rose-700 hover:bg-rose-700 shadow-xs dark:bg-rose-600 dark:border-rose-700 dark:hover:bg-rose-500",
        pin: "text-white/90",
        dot: "bg-white",
        tooltip: t("store_closed", "Store Closed"),
      };
    }

    // 3. Grey: Store Not Opened Yet
    return {
      button:
        "bg-slate-500 text-white border-slate-600 hover:bg-slate-600 shadow-xs dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500",
      pin: "text-white/90",
      dot: "bg-slate-200",
      tooltip: t("store_not_opened_yet", "Store Not Opened Yet"),
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* ── Branch Tabs + Date Picker ────────────────────────── */}
      <div className="p-5 space-y-4">
        {/* Label and Date Picker Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("branch_name", "Branch Name")}
          </label>

          {/* Date Picker — aligned right on desktop */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {t("date", "Date")}:
            </label>
            <div className="w-44">
              <GlobalDatePicker
                value={operationDate}
                onChange={onDateChange}
                placeholder={t("select_date", "Select Date")}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Status Legend (on top of branches, no Legend label, no () text) */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("store_opened", "Store Opened")}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("store_closed", "Store Closed")}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t("store_not_opened_yet", "Store Not Opened Yet")}
            </span>
          </div>
        </div>

        {/* Branch Tabs */}
        {isLoadingBranches ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <Loader2 size={14} className="animate-spin text-[#2563eb]" />
            <span>{t("loading_branches", "Loading branches...")}</span>
          </div>
        ) : branches.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">
            {t("no_branches", "No branches available.")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {branches.map((branch) => {
              const isActive = branch.value === selectedBranch;
              const styles = getBranchButtonStyles(branch, isActive);

              return (
                <button
                  key={branch.value}
                  type="button"
                  onClick={() => onBranchChange(branch.value)}
                  title={styles.tooltip || undefined}
                  className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${styles.button}`}
                >
                  <MapPin size={13} className={styles.pin} />
                  <span>{branch.label}</span>
                  {styles.dot && (
                    <span
                      className={`inline-block w-2 h-2 rounded-full shrink-0 ${styles.dot}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Status + Action Row ──────────────────────────────── */}
      {selectedBranch && (
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t("store_status", "Store Status")}:
              </span>
              {statusBadge}
            </div>
            {isStillOpenPrevious && storeStatusMeta?.label && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {storeStatusMeta.label}
              </p>
            )}
          </div>

          <div className="shrink-0">
            {isStillOpenPrevious ? (
              <GlobalButton
                variant="danger"
                size="sm"
                onClick={onForceCloseStore}
                disabled={isForceClosing}
                isLoading={isForceClosing}
                loadingText={t("closing", "Closing...")}
                leftIcon={<Power size={14} />}
              >
                {t("force_close", "Force Close")}
              </GlobalButton>
            ) : isOpened && !isClosed ? (
              <GlobalButton
                variant="danger"
                size="sm"
                onClick={onCloseStore}
                disabled={isClosing}
                isLoading={isClosing}
                loadingText={t("closing", "Closing...")}
                leftIcon={<Lock size={14} />}
              >
                {t("close_store", "Close Store")}
              </GlobalButton>
            ) : (
              <GlobalButton
                variant="primary"
                size="sm"
                onClick={onOpenStore}
                disabled={isOpening || !selectedBranch}
                isLoading={isOpening}
                loadingText={t("opening", "Opening...")}
                leftIcon={<Unlock size={14} />}
              >
                {t("open_store", "Open Store")}
              </GlobalButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
