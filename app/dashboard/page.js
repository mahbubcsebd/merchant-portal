"use client"

import { useState } from "react"
import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { LatestActivities } from "@/components/dashboard/LatestActivities"
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable"
import { StatisticsChart } from "@/components/dashboard/StatisticsChart"
import { PeriodDropdown, CurrencyDropdown } from "@/components/dashboard/Dropdowns"

export default function DashboardPage() {
  const [period, setPeriod] = useState("3m")
  const [currency, setCurrency] = useState("xcg")

  return (
    <div className="w-full">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">
            Overview
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Business Summary
          </h2>
        </div>
        <div className="flex justify-end">
          <PeriodDropdown value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* ── Overview Stat Cards (full-width row) ─────────── */}
      <OverviewCards />

      {/* ── Two-column content grid ──────────────────────── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left column: Latest Activities */}
        <div className="min-w-0">
          <LatestActivities />
        </div>

        {/* Right column: Transactions + Chart */}
        <div className="min-w-0 flex flex-col gap-6">
          <RecentTransactionsTable
            currencyDropdown={<CurrencyDropdown value={currency} onChange={setCurrency} />}
          />
          <StatisticsChart />
        </div>

      </div>
    </div>
  )
}
