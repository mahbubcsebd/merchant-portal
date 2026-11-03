import React from "react";
import { Lock, Unlock, Power, Loader2 } from "lucide-react";
import GlobalSelect from "@/components/globals/GlobalSelect";
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

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        {/* Dropdown Filters (Branch & Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-2xl">
          <GlobalSelect
            label={t("branch_name", "Branch Name")}
            value={selectedBranch}
            onChange={onBranchChange}
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
              onChange={onDateChange}
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
              onClick={onForceCloseStore}
              disabled={isForceClosing}
              className="h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {isForceClosing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Power size={15} />
              )}
              <span>{t("force_close_store", "Force Close Previous")}</span>
            </GlobalButton>
          ) : isOpened && !isClosed ? (
            <GlobalButton
              variant="danger"
              onClick={onCloseStore}
              disabled={isClosing}
              className="h-10 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {isClosing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Lock size={15} />
              )}
              <span>{t("close_store", "Close Store")}</span>
            </GlobalButton>
          ) : (
            <GlobalButton
              variant="primary"
              onClick={onOpenStore}
              disabled={isOpening || !selectedBranch}
              className="h-10 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {isOpening ? (
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
  );
}

