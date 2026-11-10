import React from "react";
import { Loader2, Store, Check, Lock, Unlock, Power } from "lucide-react";
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

  // Active branch object
  const activeBranchObj = branches.find((b) => b.value === selectedBranch);

  // Button styles when branches > 4 (Green = Opened, Red = Closed, Grey = Not Opened Yet; Active is primary blue)
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
          "bg-[#2563eb] text-white border-[#2563eb] shadow-xs ring-2 ring-[#2563eb]/20",
        icon: "text-white/90",
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
          "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-2xs dark:bg-emerald-600 dark:border-emerald-700 dark:hover:bg-emerald-500",
        icon: "text-white/90",
        dot: "bg-white animate-pulse",
        tooltip: t("store_opened", "Store Opened"),
      };
    }

    // 2. Red: Store Closed
    if (branch.statusKey === "closed") {
      return {
        button:
          "bg-rose-600 text-white border-rose-700 hover:bg-rose-700 shadow-2xs dark:bg-rose-600 dark:border-rose-700 dark:hover:bg-rose-500",
        icon: "text-white/90",
        dot: "bg-white",
        tooltip: t("store_closed", "Store Closed"),
      };
    }

    // 3. Grey: Store Not Opened Yet
    return {
      button:
        "bg-slate-500 text-white border-slate-600 hover:bg-slate-600 shadow-2xs dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500",
      icon: "text-white/90",
      dot: "bg-slate-200",
      tooltip: t("store_not_opened_yet", "Store Not Opened Yet"),
    };
  };

  // Render dotted status badge inside each card (when branches <= 4)
  const renderCardStatusBadge = (branch) => {
    if (branch.statusKey === "opened") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/20 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t("store_opened", "Store Opened")}
        </span>
      );
    }

    if (branch.statusKey === "closed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/70 dark:border-rose-500/20 shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {t("store_closed", "Store Closed")}
        </span>
      );
    }

    // Default: Not opened yet
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        {t("store_not_opened_yet", "Store Not Opened Yet")}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* ── Top Header Row: Title & Date Picker ──────────────── */}
      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("branches", "Branches")}
            </h3>
            {branches.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {branches.length}
              </span>
            )}
          </div>

          {/* Date Picker (future dates restricted) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {t("date", "Date")}:
            </label>
            <div className="w-44">
              <GlobalDatePicker
                value={operationDate}
                onChange={onDateChange}
                placeholder={t("select_date", "Select Date")}
                className="h-9 text-xs"
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* Status Legend Row */}
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

        {/* ── Branch Display (Cards for <= 4 branches, Button style for > 4 branches) ── */}
        {isLoadingBranches ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
            <Loader2 size={16} className="animate-spin text-[#2563eb]" />
            <span>{t("loading_branches", "Loading branches...")}</span>
          </div>
        ) : branches.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {t("no_branches", "No branches available.")}
          </p>
        ) : branches.length <= 4 ? (
          /* ── Card Style Design (1 to 4 branches) ── */
          <div className="flex flex-wrap items-stretch gap-3.5 pt-0.5">
            {branches.map((branch, idx) => {
              const isActive = branch.value === selectedBranch;

              return (
                <button
                  key={`branch-card-${branch.value}-${idx}`}
                  type="button"
                  onClick={() => onBranchChange(branch.value)}
                  className={`group relative text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3.5 shrink-0 flex-1 min-w-[240px] max-w-[320px] ${
                    isActive
                      ? "border-[#2563eb] bg-blue-50/50 dark:bg-blue-950/25 ring-2 ring-[#2563eb]/20 shadow-xs"
                      : "border-slate-200/90 dark:border-slate-700/80 bg-slate-50/90 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs"
                  }`}
                >
                  {/* Card Top: Icon + Dotted Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#2563eb] text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-[#2563eb]"
                      }`}
                    >
                      <Store size={15} />
                    </div>

                    {renderCardStatusBadge(branch)}
                  </div>

                  {/* Card Middle: Branch Name & City/ID */}
                  <div className="min-w-0 space-y-0.5">
                    <h3
                      className={`font-bold text-sm truncate transition-colors ${
                        isActive
                          ? "text-[#1b55ad] dark:text-blue-400"
                          : "text-slate-900 dark:text-white group-hover:text-[#2563eb]"
                      }`}
                      title={branch.label}
                    >
                      {branch.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {branch.raw?.SUBCITY ||
                        branch.raw?.STREETNAME ||
                        `Branch #${branch.value}`}
                    </p>
                  </div>

                  {/* Card Footer: Active State / Selection Hint */}
                  <div
                    className={`pt-2.5 border-t flex items-center justify-between text-[11px] font-semibold transition-colors ${
                      isActive
                        ? "border-blue-200/70 dark:border-blue-900/40 text-[#2563eb] dark:text-blue-400"
                        : "border-slate-200/70 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="flex items-center gap-1 font-bold">
                          <Check size={13} className="stroke-[2.5]" />
                          {t("active_branch", "Active Branch")}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[#2563eb] dark:text-blue-300">
                          ID: #{branch.value}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{t("click_to_select", "Click to select")}</span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          #{branch.value}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* ── Button Style Design with Less Information (> 4 branches, wraps to next line) ── */
          <div className="flex flex-wrap gap-2 pt-0.5">
            {branches.map((branch, idx) => {
              const isActive = branch.value === selectedBranch;
              const styles = getBranchButtonStyles(branch, isActive);

              return (
                <button
                  key={`branch-btn-${branch.value}-${idx}`}
                  type="button"
                  onClick={() => onBranchChange(branch.value)}
                  title={styles.tooltip || undefined}
                  className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${styles.button}`}
                >
                  <Store size={13} className={styles.icon} />
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

      {/* ── Action Control Bar for Selected Branch ────────────── */}
      {selectedBranch && (
        <div className="px-5 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t("managing_branch", "Managing Branch")}:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeBranchObj?.label || selectedBranch}
                </span>
              </div>
              {isStillOpenPrevious && storeStatusMeta?.label && (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                  {storeStatusMeta.label}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
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
