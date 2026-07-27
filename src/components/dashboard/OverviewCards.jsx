
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from "lucide-react"

const cards = [
  {
    label: "Incoming",
    value: "XCG 6.33",
    count: "2 transactions",
    trend: "up",
    change: "+12.5%",
    icon: ArrowDownLeft,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/5",
    borderClass: "border-emerald-200/50 dark:border-emerald-500/20",
  },
  {
    label: "Outgoing",
    value: "XCG 0.00",
    count: "0 transactions",
    trend: "down",
    change: "0%",
    icon: ArrowUpRight,
    iconColor: "text-red-500 dark:text-red-400",
    bgClass: "bg-red-50 dark:bg-red-500/5",
    borderClass: "border-red-200/50 dark:border-red-500/20",
  },
  {
    label: "Total Balance",
    value: "XCG 2,497.63",
    count: "All time",
    trend: "up",
    change: "Active",
    icon: TrendingUp,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-500/5",
    borderClass: "border-blue-200/50 dark:border-blue-500/20",
  },
  {
    label: "This Month",
    value: "XCG 6.33",
    count: "May 2026",
    trend: "up",
    change: "+100%",
    icon: TrendingUp,
    iconColor: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 dark:bg-purple-500/5",
    borderClass: "border-purple-200/50 dark:border-purple-500/20",
  },
]

export function OverviewCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative rounded-xl p-4 md:p-5 border ${card.bgClass} ${card.borderClass} shadow-sm dark:shadow-none transition-colors`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-white/50">
              {card.label}
            </span>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconColor}`}>
              <card.icon size={16} className="sm:size-[18px]" />
            </div>
          </div>

          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight truncate">
            {card.value}
          </p>

          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-white/30 truncate">{card.count}</span>
            <span className={`text-[10px] sm:text-xs font-bold ${
              card.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-white/30"
            }`}>
              {card.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
