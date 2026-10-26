import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getTransactionLimits } from "@/lib/api/endpoints";
import GlobalSelect from "@/components/globals/GlobalSelect";

export default function PaymentLimitsView() {
  const { t } = useLanguage();
  const { data: limitsData, isLoading } = useQuery({
    queryKey: ["transactionLimits"],
    queryFn: () => getTransactionLimits(),
  });

  const limitsList = limitsData?.txnLimitUsers || [];

  // Extract unique currency names
  const currencies = Array.from(
    new Set(limitsList.map((item) => item.CURRNAME)),
  ).filter(Boolean);
  const currencyOptions = [
    { value: "all", label: t("all_currencies", "All Currencies") },
    ...currencies.map((curr) => ({
      value: curr,
      label: `${curr} ${t("limits", "Limits")}`,
    })),
  ];

  const [selectedCurrency, setSelectedCurrency] = useState("all");

  if (isLoading && limitsList.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  // Filter limits based on selected currency
  const filteredLimits =
    selectedCurrency === "all"
      ? limitsList
      : limitsList.filter((item) => item.CURRNAME === selectedCurrency);

  // Map limits into columns
  const mapCard = (item, limitType) => {
    let max = 0;
    let used = 0;
    let remaining = 0;

    if (limitType === "daily") {
      max = parseFloat(item.USERTXNDAILYLIMIT || 0);
      used = parseFloat(item.USERTXNDAILYUSED || 0);
      remaining = parseFloat(item.USERTXNDAILYREMAIN || 0);
    } else if (limitType === "monthly") {
      max = parseFloat(item.USERTXNMONTHLYLIMIT || 0);
      used = parseFloat(item.USERTXNMONTHLYUSED || 0);
      remaining = parseFloat(item.USERTXNMONTHLYREMAIN || 0);
    } else if (limitType === "annual") {
      max = parseFloat(item.USERTXNANNUALLIMIT || 0);
      used = parseFloat(item.USERTXNANNUALUSED || 0);
      remaining = parseFloat(item.USERTXNANNUALREMAIN || 0);
    }

    return {
      title: item.TXNNAME || item.TXNID,
      remaining,
      used,
      max,
      currency: item.CURRNAME || "XCG",
    };
  };

  const columns = [
    {
      title: t("dailyLimit", t("daily_limits", "Daily Limits")),
      cards: filteredLimits.map((item) => mapCard(item, "daily")),
    },
    {
      title: t("MonthlyLimit", t("monthly_limits", "Monthly Limit")),
      cards: filteredLimits.map((item) => mapCard(item, "monthly")),
    },
    {
      title: t("annualLimit", t("annual_limits", "Annual Limit")),
      cards: filteredLimits.map((item) => mapCard(item, "annual")),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {currencyOptions.length > 1 && (
        <div className="flex justify-end">
          <div className="w-full sm:w-48 shrink-0">
            <GlobalSelect
              value={selectedCurrency}
              onChange={(val) => setSelectedCurrency(val)}
              options={currencyOptions}
              placeholder={t("selectCurrency", "Select Currency")}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">
              {col.title}
            </h3>
            {col.cards.length === 0 ? (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 p-4 text-center">
                {t("no_limits_configured", "No limits configured")}
              </p>
            ) : (
              col.cards.map((card, cardIdx) => {
                const progressPercentage =
                  card.max > 0 ? (card.used / card.max) * 100 : 0;
                return (
                  <div
                    key={cardIdx}
                    className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm"
                  >
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2">
                      {t("limit_max", "Maximum Balance allowed on")}{" "}
                      {card.title}
                    </p>

                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">
                      {card.currency}{" "}
                      {card.remaining.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {t("remaining", "Remaining")}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-white/50">
                      {card.currency}{" "}
                      {card.used.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {t("used", "used")} (max: {card.currency}{" "}
                      {card.max.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      )
                    </p>
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
