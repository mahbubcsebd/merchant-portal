"use client"

import {
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

const MOCK_CHART_DATA = [
  { month: "Jan", Incoming: 0,    Outgoing: 0 },
  { month: "Feb", Incoming: 4.55, Outgoing: 0 },
  { month: "Mar", Incoming: 0,    Outgoing: 0 },
  { month: "Apr", Incoming: 1.00, Outgoing: 0 },
  { month: "May", Incoming: 6.33, Outgoing: 0 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 shadow-xl text-xs">
        <p className="text-slate-500 dark:text-white/50 font-medium mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: XCG {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function StatisticsChart() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted ? theme === "dark" : true
  const axisColor = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8"
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Transaction History</h3>
        <span className="text-xs font-medium text-slate-500 dark:text-white/30 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 px-3 py-1 rounded-md">
          Last 5 Months
        </span>
      </div>

      {/* Fixed height — required for ResponsiveContainer to work */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={isDark ? 0.4 : 0.18} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outgoingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e65625" stopOpacity={isDark ? 0.35 : 0.15} />
                <stop offset="95%" stopColor="#e65625" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "11px", color: axisColor, paddingTop: "10px" }} />
            <Area type="monotone" dataKey="Incoming" stroke="#2563eb" strokeWidth={2.5} fill="url(#incomingGrad)" dot={false} activeDot={{ r: 4, fill: "#2563eb" }} />
            <Area type="monotone" dataKey="Outgoing" stroke="#e65625" strokeWidth={2.5} fill="url(#outgoingGrad)" dot={false} activeDot={{ r: 4, fill: "#e65625" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
