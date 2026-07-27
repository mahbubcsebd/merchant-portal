import GlobalSelect from "@/components/globals/GlobalSelect"
import { useDashboardContext } from "@/pages/dashboard/layout"

const TIME_PERIODS = [
  { label: "3 Months", value: "last3months" },
  { label: "This Month", value: "thismonth" },
  { label: "This Year", value: "thisyear" },
  { label: "All Time", value: "alltime" },
]


export function PeriodDropdown({ value, onChange }) {
  return (
    <GlobalSelect
      value={value}
      onChange={onChange}
      containerClassName="w-[140px]"
      options={TIME_PERIODS}
    />
  )
}

export function CurrencyDropdown({ value, onChange }) {
  const { accounts } = useDashboardContext();

  const options = accounts?.map(acc => {
    const rawBal = parseFloat(acc.AVBALANCE || 0);
    const formattedBal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rawBal);
    return {
      label: `${formattedBal} ${acc.CURSHRTNAME}`,
      value: acc.ACCOUNTNUMBER
    };
  }) || [];

  return (
    <GlobalSelect
      value={value}
      onChange={onChange}
      containerClassName="w-[150px]"
      options={options.length > 0 ? options : [{ label: "No accounts", value: "" }]}
    />
  )
}
