import React, { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/globals/LanguageProvider";
import GlobalSelect from "@/components/globals/GlobalSelect";

export default function GlobalPagination({
  currentPage = 1,
  pageSize = 10,
  totalRecords = null,
  currentCount = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  className = "",
}) {
  const { t } = useLanguage();

  const isTotalKnown = totalRecords !== null && totalRecords !== undefined;
  const totalPages = isTotalKnown
    ? Math.max(1, Math.ceil(totalRecords / pageSize))
    : null;

  const hasPrev = currentPage > 1;
  const hasNext = isTotalKnown
    ? currentPage < totalPages
    : currentCount >= pageSize;

  const fromItem =
    isTotalKnown && totalRecords === 0
      ? 0
      : (currentPage - 1) * pageSize + (currentCount > 0 ? 1 : 0);
  const toItem = isTotalKnown
    ? Math.min((currentPage - 1) * pageSize + currentCount, totalRecords)
    : (currentPage - 1) * pageSize + currentCount;

  // Build page numbers array with ellipsis when total pages is known
  const getPageNumbers = () => {
    if (!totalPages || totalPages <= 1) return [1];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pageNumbers = isTotalKnown ? getPageNumbers() : [];

  const pageSizeSelectOptions = useMemo(
    () =>
      pageSizeOptions.map((opt) => ({
        value: opt,
        label: String(opt),
        className: "px-3 py-1.5 text-xs text-center",
      })),
    [pageSizeOptions],
  );

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none",
        className,
      )}
    >
      {/* Left side: Rows per page + Summary */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-white/60">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">
              {t("rows_per_page", "Rows per page")}:
            </span>
            <GlobalSelect
              value={pageSize}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeSelectOptions}
              disabled={isLoading}
              dropdownPosition="top"
              containerClassName="w-[74px] shrink-0"
              selectClassName="h-8 px-2 text-xs font-semibold justify-between"
              dropdownClassName="min-w-[74px] py-1 shadow-lg"
            />
          </div>
        )}

        <div>
          {isTotalKnown ? (
            <span>
              {t("showing", "Showing")}{" "}
              <strong className="text-slate-800 dark:text-white">
                {fromItem}
              </strong>
              –
              <strong className="text-slate-800 dark:text-white">
                {toItem}
              </strong>{" "}
              {t("of", "of")}{" "}
              <strong className="text-slate-800 dark:text-white">
                {totalRecords}
              </strong>
            </span>
          ) : (
            <span>
              {t("showing", "Showing")}{" "}
              <strong className="text-slate-800 dark:text-white">
                {fromItem}
              </strong>
              –
              <strong className="text-slate-800 dark:text-white">
                {toItem}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page */}
        {isTotalKnown && totalPages > 2 && (
          <button
            type="button"
            title={t("first_page", "First page")}
            onClick={() => onPageChange(1)}
            disabled={!hasPrev || isLoading}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Previous Page */}
        <button
          type="button"
          title={t("previous_page", "Previous page")}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev || isLoading}
          className="h-8 px-2.5 flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t("previous", "Previous")}
          </span>
        </button>

        {/* Page Numbers (when total is known) */}
        {isTotalKnown && totalPages > 1 && (
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="h-8 w-6 flex items-center justify-center text-xs text-slate-400 dark:text-white/40"
                  >
                    …
                  </span>
                );
              }
              const isActive = p === currentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p)}
                  disabled={isLoading}
                  className={cn(
                    "h-8 min-w-[32px] px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-[#2563eb] text-white shadow-sm font-bold pointer-events-none"
                      : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10",
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Page indicator */}
        <div className="sm:hidden px-2 text-xs font-semibold text-slate-700 dark:text-white">
          {currentPage} {totalPages ? `/ ${totalPages}` : ""}
        </div>

        {/* Next Page */}
        <button
          type="button"
          title={t("next_page", "Next page")}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext || isLoading}
          className="h-8 px-2.5 flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <span className="hidden sm:inline">{t("next", "Next")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        {isTotalKnown && totalPages > 2 && (
          <button
            type="button"
            title={t("last_page", "Last page")}
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNext || isLoading}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

