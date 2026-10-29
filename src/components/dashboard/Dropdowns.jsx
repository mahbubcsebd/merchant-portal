import GlobalSelect from "@/components/globals/GlobalSelect";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function PeriodDropdown({ value, onChange }) {
  const { t } = useLanguage();

  const TIME_PERIODS = [
    { label: t("last_30_days", "Last 30 days"), value: "last30days" },
    { label: t("threeMonths", "3 Months"), value: "last3months" },
    { label: t("thisMonth", "This Month"), value: "thismonth" },
    { label: t("thisYear", "This Year"), value: "thisyear" },
    { label: t("allTime", "All Time"), value: "alltime" },
  ];

  return (
    <GlobalSelect
      value={value}
      onChange={onChange}
      containerClassName="w-[140px]"
      selectClassName="h-9 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      options={TIME_PERIODS}
    />
  );
}

export function CurrencyDropdown({ value, onChange }) {
  const { accounts } = useDashboardContext();
  const { t } = useLanguage();

  const options = accounts?.map((acc) => {
    const rawBal = parseFloat(acc.AVBALANCE || 0);
    const formattedBal = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rawBal);
    const code = acc.CURSHRTNAME || acc.CURCODE || "XCG";
    return {
      label: `${code} (${formattedBal})`,
      value: acc.ACCOUNTNUMBER || acc.ACCOUNTNO,
    };
  }) || [];

  return (
    <GlobalSelect
      value={value}
      onChange={onChange}
      containerClassName="w-[170px]"
      selectClassName="h-9 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      options={options.length > 0 ? options : [{ label: t("no_accounts", "No accounts"), value: "" }]}
    />
  );
}
