import React, { useState, useEffect, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useTheme } from "next-themes";
import { BarChart2 } from "lucide-react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function TransactionActivityChart() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("3M");
  const { dashboardInfo, transactions } = useDashboardContext();
  const { t } = useLanguage();

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : false;
  const axisColor = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";

  const data = useMemo(() => {
    if (
      dashboardInfo?.chart &&
      Array.isArray(dashboardInfo.chart) &&
      dashboardInfo.chart.length > 0
    ) {
      return dashboardInfo.chart.map((item) => ({
        month: item.itemLabel || "",
        incomingCount: parseInt(item.totalCountIncoming || 0, 10),
        outgoingCount: parseInt(item.totalCountOutgoing || 0, 10),
      }));
    }

    // Group real transactions if dashboard chart is empty
    if (transactions && transactions.length > 0) {
      const monthMap = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      transactions.forEach((tx) => {
        let mLabel = "Current";
        if (tx.creationDate && String(tx.creationDate).length === 8) {
          const y = String(tx.creationDate).substring(0, 4);
          const mIdx = parseInt(String(tx.creationDate).substring(4, 6), 10) - 1;
          mLabel = `${monthNames[mIdx] || "M"} ${y}`;
        }
        if (!monthMap[mLabel]) {
          monthMap[mLabel] = { month: mLabel, incomingCount: 0, outgoingCount: 0 };
        }
        if (tx.txnDebitCreditCode === "C") {
          monthMap[mLabel].incomingCount++;
        } else {
          monthMap[mLabel].outgoingCount++;
        }
      });
      return Object.values(monthMap);
    }

    return [];
  }, [dashboardInfo, transactions]);

  // Dynamic maximum calculation for Y-Axis
  const maxY = useMemo(() => {
    if (data.length === 0) return 10;
    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.incomingCount || 0, d.outgoingCount || 0)),
    );
    return Math.max(10, Math.ceil((maxVal * 1.25) / 10) * 10);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomingVal = payload.find((p) => p.dataKey === "incomingCount")?.value ?? 0;
      const outgoingVal = payload.find((p) => p.dataKey === "outgoingCount")?.value ?? 0;

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5 shadow-lg text-xs min-w-[120px]">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-[11px] mb-1.5">
            {label}
          </p>
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#44c273]" />
              {t("incoming", "Incoming")}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {incomingVal}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px] mt-1">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" />
              {t("outgoing", "Outgoing")}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {outgoingVal}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const timeTabs = ["7D", "30D", "3M", "6M"];

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart2 size={16} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t("transaction_activity", "Transaction activity")}
          </h3>
        </div>

        {/* Right: Time Range Selector + Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Segmented Control */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {timeTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#44c273]" />
              <span>{t("incoming", "Incoming")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" />
              <span>{t("outgoing", "Outgoing")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ height: 280 }} className="w-full">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            {t("no_chart_data", "No transaction activity data available")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              barGap={8}
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
                interval={0}
                dy={8}
              />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, maxY]}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />

              {/* Incoming Bar (Green) */}
              <Bar
                dataKey="incomingCount"
                fill="#44c273"
                radius={[4, 4, 0, 0]}
                barSize={24}
              >
                <LabelList
                  dataKey="incomingCount"
                  position="top"
                  fill="#64748b"
                  fontSize={10}
                  fontWeight={500}
                  offset={4}
                />
              </Bar>

              {/* Outgoing Bar (Coral) */}
              <Bar
                dataKey="outgoingCount"
                fill="#f87171"
                radius={[4, 4, 0, 0]}
                barSize={24}
              >
                <LabelList
                  dataKey="outgoingCount"
                  position="top"
                  fill="#64748b"
                  fontSize={10}
                  fontWeight={500}
                  offset={4}
                />
              </Bar>

              {/* Overlay Spline Curve Lines */}
              <Line
                type="monotone"
                dataKey="incomingCount"
                stroke="#86efac"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="outgoingCount"
                stroke="#fca5a5"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
