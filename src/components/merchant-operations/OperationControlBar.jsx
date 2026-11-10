import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Store,
  Check,
  Lock,
  Unlock,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

  // Carousel scroll handling
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, branches]);

  // Global mouse up to clean up dragging state if released outside
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      setIsMouseDown(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  // Drag to scroll handlers
  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsMouseDown(true);
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsMouseDown(false);
  };

  // Scroll active branch into view when changed
  useEffect(() => {
    if (!selectedBranch || !carouselRef.current) return;
    const activeEl = carouselRef.current.querySelector(
      `[data-branch-id="${selectedBranch}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedBranch]);

  // Render dotted status badge inside each card
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

        {/* Status Legend & Carousel Navigation Row (Aligned in right corner) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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

          {/* Carousel Navigation (Aligned with legend in right corner) */}
          {branches.length > 4 && (
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <button
                type="button"
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                title={t("previous_branches", "Previous Branches")}
                aria-label="Previous branches"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                title={t("next_branches", "Next Branches")}
                aria-label="Next branches"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── Branch Cards Carousel (Scrollable & Drag-to-move) ── */}
        {isLoadingBranches ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
            <Loader2 size={16} className="animate-spin text-[#2563eb]" />
            <span>{t("loading_branches", "Loading branches...")}</span>
          </div>
        ) : branches.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {t("no_branches", "No branches available.")}
          </p>
        ) : (
          <div
            ref={carouselRef}
            onScroll={checkScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-stretch gap-3.5 overflow-x-auto pb-1 pt-0.5 select-none cursor-grab active:cursor-grabbing ${
              isMouseDown ? "scroll-auto" : "scroll-smooth"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {branches.map((branch, idx) => {
              const isActive = branch.value === selectedBranch;

              return (
                <button
                  key={`branch-card-${branch.value}-${idx}`}
                  data-branch-id={branch.value}
                  type="button"
                  onClick={(e) => {
                    if (hasDraggedRef.current) {
                      e.preventDefault();
                      return;
                    }
                    onBranchChange(branch.value);
                  }}
                  className={`group relative text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3.5 shrink-0 ${
                    branches.length > 4
                      ? "w-[calc(25%-0.65rem)] min-w-[240px] max-w-[320px]"
                      : "flex-1 min-w-[240px] max-w-[320px]"
                  } ${
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
