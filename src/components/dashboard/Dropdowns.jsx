
import GlobalSelect from "@/components/globals/GlobalSelect"

const TIME_PERIODS = [
  { label: "3 Months", value: "3m" },
  { label: "This Month", value: "1m" },
  { label: "This Year", value: "1y" },
  { label: "All Time", value: "all" },
]

const CURRENCIES = [
  { label: "2,497.63 XCG", value: "xcg" },
  { label: "0.00 JMD", value: "jmd" },
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
  return (
    <GlobalSelect
      value={value}
      onChange={onChange}
      containerClassName="w-[150px]"
      options={CURRENCIES}
    />
  )
}
