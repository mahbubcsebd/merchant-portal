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

  // Simple status text matching portal_uat
  let statusText = "";
  if (isStillOpenPrevious) {
    statusText = t("store_not_opened_yet", "Store Not Opened Yet");
  } else if (isOpened && !isClosed) {
    statusText = t("store_opened", "Store Opened");
  } else {
    statusText = t("store_closed_for_today", "Store Closed For Today");
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* ── Branch Tabs + Date Picker ────────────────────────── */}
      <div className="p-5 space-y-4">
        {/* Label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("branch_name", "Branch Name")}
          </label>

          {/* Date Picker — aligned right on desktop */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {t("date", "Date")}
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

        {/* Branch Tabs */}
        {isLoadingBranches ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <Loader2 size={14} className="animate-spin" />
            <span>{t("loading_branches", "Loading branches...")}</span>
          </div>
        ) : branches.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">
            {t("no_branches", "No branches available.")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {branches.map((branch) => {
              const isActive = branch.value === selectedBranch;
              return (
                <button
                  key={branch.value}
                  type="button"
                  onClick={() => onBranchChange(branch.value)}
                  className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#2563eb] text-white border-[#2563eb] shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <MapPin size={13} className={isActive ? "text-white/80" : "text-slate-400"} />
                  <span>{branch.label}</span>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("store_status", "Store Status")}:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {statusText}
              </span>
            </p>
            {isStillOpenPrevious && storeStatusMeta?.label && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
