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
  const { dashboardInfo, transactions, period, setPeriod } = useDashboardContext();
  const { t } = useLanguage();

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : false;
  const axisColor = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";

  const timeTabs = [
    { label: "30D", periodKey: "last30days" },
    { label: "3M", periodKey: "last3months" },
    { label: "6M", periodKey: "last6months" },
    { label: "1Y", periodKey: "thisyear" },
  ];

  const handleTabClick = (tab) => {
    if (setPeriod) {
      setPeriod(tab.periodKey);
    }
  };

  const data = useMemo(() => {
    const monthsFull = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const monthsShort = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const chartItems = Array.isArray(dashboardInfo?.chart) ? dashboardInfo.chart : [];

    // 1. If API returned yearly items (e.g., "2025", "2026"), show them as is
    const isYearly =
      chartItems.length > 0 &&
      chartItems.every((item) => /^\d{4}$/.test(String(item.itemLabel || "").trim()));

    if (isYearly) {
      return chartItems.map((item) => {
        const label = String(item.itemLabel || "").trim();
        const incoming = parseInt(item.totalCountIncoming || 0, 10);
        const outgoing = parseInt(item.totalCountOutgoing || 0, 10);
        return {
          month: label,
          incomingCount: incoming,
          outgoingCount: outgoing,
          hasNoActivity: incoming === 0 && outgoing === 0,
        };
      });
    }

    // 2. Map existing counts from API chart items (supports both "October" and "Oct")
    const apiMap = {};
    chartItems.forEach((item) => {
      const raw = String(item.itemLabel || "").trim().toLowerCase();
      apiMap[raw] = {
        incomingCount: parseInt(item.totalCountIncoming || 0, 10),
        outgoingCount: parseInt(item.totalCountOutgoing || 0, 10),
      };
    });

    // Also consider transactions fallback if apiMap is empty
    if (Object.keys(apiMap).length === 0 && transactions && transactions.length > 0) {
      transactions.forEach((tx) => {
        let mIdx = null;
        if (tx.creationDate && String(tx.creationDate).length === 8) {
          mIdx = parseInt(String(tx.creationDate).substring(4, 6), 10) - 1;
        } else if (tx.txnDate) {
          const parsed = new Date(tx.txnDate);
          if (!isNaN(parsed.getTime())) {
            mIdx = parsed.getMonth();
          }
        }
        if (mIdx != null && mIdx >= 0 && mIdx < 12) {
          const key = monthsFull[mIdx].toLowerCase();
          if (!apiMap[key]) {
            apiMap[key] = { incomingCount: 0, outgoingCount: 0 };
          }
          if (tx.txnDebitCreditCode === "C") {
            apiMap[key].incomingCount++;
          } else {
            apiMap[key].outgoingCount++;
          }
        }
      });
    }

    // Reference date (use responseDateTime if provided by API, otherwise current date)
    const refDate = dashboardInfo?.responseDateTime
      ? new Date(dashboardInfo.responseDateTime)
      : new Date();
    const currentYear = refDate.getFullYear();
    const currentMonthIdx = refDate.getMonth();

    // Determine target months according to the active filter
    let targetMonthIndices = [];

    if (period === "thismonth") {
      targetMonthIndices = [currentMonthIdx];
    } else if (period === "last3months") {
      // 3 past months ending with current month (e.g. Sep, Oct, Nov)
      for (let i = 2; i >= 0; i--) {
        const d = new Date(currentYear, currentMonthIdx - i, 1);
        targetMonthIndices.push(d.getMonth());
      }
    } else if (period === "last6months") {
      // 6 past months ending with current month
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonthIdx - i, 1);
        targetMonthIndices.push(d.getMonth());
      }
    } else if (period === "thisyear") {
      // January through current month
      for (let i = 0; i <= currentMonthIdx; i++) {
        targetMonthIndices.push(i);
      }
    } else {
      // If period is alltime without yearly buckets or last30days
      if (chartItems.length > 0) {
        return chartItems.map((item) => {
          const label = String(item.itemLabel || "").trim();
          const incoming = parseInt(item.totalCountIncoming || 0, 10);
          const outgoing = parseInt(item.totalCountOutgoing || 0, 10);
          return {
            month: label,
            incomingCount: incoming,
            outgoingCount: outgoing,
            hasNoActivity: incoming === 0 && outgoing === 0,
          };
        });
      }
      for (let i = 2; i >= 0; i--) {
        const d = new Date(currentYear, currentMonthIdx - i, 1);
        targetMonthIndices.push(d.getMonth());
      }
    }

    // Build the expected sequence of months with data or 0 for inactive months
    return targetMonthIndices.map((mIdx) => {
      const full = monthsFull[mIdx].toLowerCase();
      const short = monthsShort[mIdx].toLowerCase();
      const match = apiMap[full] || apiMap[short];

      const incoming = match ? match.incomingCount : 0;
      const outgoing = match ? match.outgoingCount : 0;
      const hasNoActivity = incoming === 0 && outgoing === 0;

      return {
        month: monthsFull[mIdx], // e.g. "January", "February", "September", etc.
        monthShort: monthsShort[mIdx],
        incomingCount: incoming,
        outgoingCount: outgoing,
        hasNoActivity,
      };
    });
  }, [dashboardInfo, transactions, period]);

  // Dynamic maximum calculation for Y-Axis
  const maxY = useMemo(() => {
    if (data.length === 0) return 10;
    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.incomingCount || 0, d.outgoingCount || 0)),
    );
    return Math.max(10, Math.ceil((maxVal * 1.25) / 10) * 10);
  }, [data]);

  // Custom Bar Shape: If value is 0, render a dash line indicator for that month
  const renderDashBar = (props, color) => {
    const { fill, x, y, width, height, value } = props;
    if (!value || value === 0) {
      const dashWidth = Math.max(14, width || 20);
      const dashX = x + (width - dashWidth) / 2;
      const dashY = y - 1; // baseline
      return (
        <line
          x1={dashX}
          y1={dashY}
          x2={dashX + dashWidth}
          y2={dashY}
          stroke={color || fill}
          strokeWidth={2.5}
          strokeDasharray="4 2"
          strokeLinecap="round"
          className="opacity-75"
        />
      );
    }

    // Normal rounded bar
    const r = 4;
    return (
      <path
        d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`}
        fill={color || fill}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomingVal = payload.find((p) => p.dataKey === "incomingCount")?.value ?? 0;
      const outgoingVal = payload.find((p) => p.dataKey === "outgoingCount")?.value ?? 0;
      const isZero = incomingVal === 0 && outgoingVal === 0;

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5 shadow-lg text-xs min-w-[120px]">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-[11px] mb-1.5">
            {label}
          </p>
          {isZero ? (
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 py-0.5">
              {t("no_activity_for_month", "No activity (-)")}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      );
    }
    return null;
  };

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
                key={tab.periodKey}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  period === tab.periodKey
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
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
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <span className="w-3 border-b-2 border-dashed border-slate-400 dark:border-slate-500 inline-block mb-0.5" />
              <span>{t("no_activity", "No activity (-)")}</span>
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
                barSize={24}
                shape={(props) => renderDashBar(props, "#44c273")}
              >
                <LabelList
                  dataKey="incomingCount"
                  position="top"
                  fill="#64748b"
                  fontSize={10}
                  fontWeight={500}
                  offset={4}
                  formatter={(val) => (val === 0 ? "-" : val)}
                />
              </Bar>

              {/* Outgoing Bar (Coral) */}
              <Bar
                dataKey="outgoingCount"
                fill="#f87171"
                barSize={24}
                shape={(props) => renderDashBar(props, "#f87171")}
              >
                <LabelList
                  dataKey="outgoingCount"
                  position="top"
                  fill="#64748b"
                  fontSize={10}
                  fontWeight={500}
                  offset={4}
                  formatter={(val) => (val === 0 ? "-" : val)}
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
