import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CurrenciesCard() {
  const { accounts, currency, setCurrency } = useDashboardContext();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const activeAccountId = currency || accounts?.[0]?.ACCOUNTNUMBER;

  const displayAccounts = React.useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return [];
    }

    return accounts.map((acc, index) => {
      const code = acc.CURSHRTNAME || acc.CURCODE || "XCG";
      const isPrimary = index === 0 || acc.ACCOUNTTYPE === "PRIMARY";
      const accNum = acc.ACCOUNTNUMBER || acc.ACCOUNTNO;
      const isSelected = accNum === activeAccountId;
      const rawBal = parseFloat(acc.AVBALANCE || 0);
      const formattedBal = `${code} ${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(rawBal)}`;

      return {
        id: accNum || String(index),
        accountNumber: accNum,
        code,
        isPrimary,
        isSelected,
        balanceFormatted: formattedBal,
        hasBalance: rawBal > 0,
      };
    });
  }, [accounts, activeAccountId]);

  const previewAccounts = displayAccounts.slice(0, 2);

  return (
    <>
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-start">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("currencies", "Currencies")}
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ({displayAccounts.length} {displayAccounts.length === 1 ? t("currency", "currency") : t("currencies", "currencies")})
            </span>
          </div>
          {displayAccounts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("view_all", "View all")}
            </button>
          )}
        </div>

        {/* Currency list (Shows 2 on dashboard) */}
        <div className="space-y-2.5 pt-1">
          {previewAccounts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              {t("no_currency_accounts", "No currency accounts available")}
            </div>
          ) : (
            previewAccounts.map((curr) => (
              <div
                key={curr.id}
                onClick={() => curr.accountNumber && setCurrency(curr.accountNumber)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  curr.isSelected
                    ? "bg-blue-50/40 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/30"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      curr.isPrimary
                        ? "bg-[#1b55ad] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {curr.code}
                  </div>
                  <div className="flex items-center min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {curr.code}
                    </span>
                    {curr.isPrimary && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shrink-0">
                        {t("primary_currency", "Primary currency")}
                      </span>
                    )}
                    {curr.isSelected && (
                      <span className="ml-1.5 flex items-center text-blue-600 dark:text-blue-400" title={t("active", "Active")}>
                        <Check size={13} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 block leading-tight">
                    {t("available_balance", "Available balance")}
                  </span>
                  <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {curr.balanceFormatted}
                    </span>
                    {!curr.hasBalance && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        {t("no_balance", "No balance")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View All Currencies Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-md w-full bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-slate-900 dark:text-white text-base font-bold">
                {t("available_currencies", "Available Currencies")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("select_currency_desc", "Select an account to filter your dashboard activity")}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5">
            {displayAccounts.map((curr) => (
              <div
                key={curr.id}
                onClick={() => {
                  if (curr.accountNumber) {
                    setCurrency(curr.accountNumber);
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  curr.isSelected
                    ? "bg-blue-50/60 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/40 shadow-xs"
                    : "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      curr.isPrimary
                        ? "bg-[#1b55ad] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {curr.code}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {curr.code}
                      </span>
                      {curr.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shrink-0">
                          {t("primary_currency", "Primary currency")}
                        </span>
                      )}
                      {curr.isSelected && (
                        <span className="text-blue-600 dark:text-blue-400 flex items-center" title={t("active", "Active")}>
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                    {curr.accountNumber && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {curr.accountNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 block leading-tight">
                    {t("available_balance", "Available balance")}
                  </span>
                  <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {curr.balanceFormatted}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-6 py-3.5 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              {t("close", "Close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
