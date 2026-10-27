import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo } from "react";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";

export function StatisticsChart() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { dashboardInfo, period, accounts, currency } = useDashboardContext();
  const { t } = useLanguage();

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : true;
  const axisColor = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";

  const currentAccount =
    accounts?.find((a) => a.ACCOUNTNO === currency) || accounts?.[0];
  const selectedCurrency = currentAccount?.CURSHRTNAME || "XCG";

  const chartData = useMemo(() => {
    if (
      !dashboardInfo ||
      !dashboardInfo.chart ||
      dashboardInfo.chart.length === 0
    ) {
      return [];
    }

    return dashboardInfo.chart.map((item) => ({
      month: item.itemLabel || "",
      incomingCount: parseInt(item.totalCountIncoming || 0, 10),
      outgoingCount: parseInt(item.totalCountOutgoing || 0, 10),
      incomingAmount: parseFloat(item.totalAmountIncoming || 0),
      outgoingAmount: parseFloat(item.totalAmountOutgoing || 0),
      incomingFormatted: new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(item.totalAmountIncoming || 0)),
      outgoingFormatted: new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(item.totalAmountOutgoing || 0)),
    }));
  }, [dashboardInfo]);

  const periodLabel =
    {
      last3months: t("threeMonths", "Last 3 Months"),
      thismonth: t("thisMonth", "This Month"),
      thisyear: t("thisYear", "This Year"),
      alltime: t("allTime", "All Time"),
    }[period] || t("threeMonths", "Last 3 Months");

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
          <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-1">
            {item.month}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#44c273] font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#44c273] shrink-0" />
              Incoming:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {selectedCurrency} {item.incomingFormatted} ({item.incomingCount})
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#DC3545] font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#DC3545] shrink-0" />
              Outgoing:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {selectedCurrency} {item.outgoingFormatted} ({item.outgoingCount})
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomTick = ({ x, y, payload }) => {
    const item = chartData[payload.index];
    if (!item) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={14}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 text-[10px] sm:text-[11px] font-medium"
        >
          Incoming: {selectedCurrency} {item.incomingFormatted}
        </text>
        <text
          x={0}
          y={28}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 text-[10px] sm:text-[11px] font-medium"
        >
          Outgoing: {selectedCurrency} {item.outgoingFormatted}
        </text>
        <text
          x={0}
          y={44}
          textAnchor="middle"
          className="fill-slate-700 dark:fill-slate-200 text-xs font-bold"
        >
          {item.month}
        </text>
      </g>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t("mStatistics", "Statistics")}
        </h3>
        <span className="text-xs font-medium text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 px-3 py-1 rounded-md">
          {periodLabel}
        </span>
      </div>

      <div className="text-center mb-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          {t("transaction_history", "Transaction History")}
        </p>
      </div>

      <div style={{ height: 380 }} className="w-full">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            {t("no_chart_data", "No chart data available.")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -15, bottom: 45 }}
              barGap={4}
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
                tick={renderCustomTick}
                interval={0}
              />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="center"
                iconType="rect"
                iconSize={14}
                wrapperStyle={{
                  paddingBottom: "16px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              />
              <Bar
                dataKey="incomingCount"
                name={t("incoming", "Incoming")}
                fill="#44c273"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="outgoingCount"
                name={t("outgoing", "Outgoing")}
                fill="#DC3545"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
