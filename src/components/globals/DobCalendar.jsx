import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MIN_YEAR = 1900;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Date-of-birth calendar with custom shadcn month + year selects,
 * defaulting to today's date and disabling future dates.
 */
export function DobCalendar({ selected, onSelect }) {
  const today = useMemo(() => new Date(), []);
  const maxYear = today.getFullYear();
  const currentTodayMonth = today.getMonth();

  const [viewMonth, setViewMonth] = useState(() => {
    if (selected instanceof Date && !isNaN(selected.getTime())) {
      return selected;
    }
    return today;
  });

  useEffect(() => {
    if (selected instanceof Date && !isNaN(selected.getTime())) {
      setViewMonth(selected);
    }
  }, [selected]);

  const years = useMemo(
    () =>
      Array.from(
        { length: maxYear - MIN_YEAR + 1 },
        (_, i) => maxYear - i,
      ),
    [maxYear],
  );

  const changeView = (year, month) => {
    let targetYear = year;
    let targetMonth = month;
    if (targetYear > maxYear) {
      targetYear = maxYear;
    }
    if (targetYear === maxYear && targetMonth > currentTodayMonth) {
      targetMonth = currentTodayMonth;
    }
    setViewMonth(new Date(targetYear, targetMonth, 1));
  };

  const currentYear = viewMonth.getFullYear();
  const currentMonth = viewMonth.getMonth();

  return (
    <div>
      <div className="flex gap-2 px-3 pt-3">
        {/* Month Selector */}
        <div className="flex-1 min-w-0">
          <Select
            value={String(currentMonth)}
            onValueChange={(val) => {
              if (val != null) {
                changeView(currentYear, Number(val));
              }
            }}
          >
            <SelectTrigger
              aria-label="Month"
              className="w-full h-8 px-2.5 text-xs font-semibold bg-white dark:bg-[#0d1117] border-slate-300 dark:border-white/20 hover:border-[#2563eb] text-slate-900 dark:text-white rounded-md cursor-pointer justify-between shadow-none"
            >
              <SelectValue placeholder="Month">
                {MONTH_NAMES[currentMonth]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-56 z-[70] bg-white dark:bg-[#0d1117] border-slate-200 dark:border-white/10 text-xs">
              {MONTH_NAMES.map((name, i) => {
                const isMonthDisabled =
                  currentYear === maxYear && i > currentTodayMonth;
                return (
                  <SelectItem
                    key={name}
                    value={String(i)}
                    disabled={isMonthDisabled}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selector */}
        <div className="flex-1 min-w-0">
          <Select
            value={String(currentYear)}
            onValueChange={(val) => {
              if (val != null) {
                const newYear = Number(val);
                let newMonth = currentMonth;
                if (newYear === maxYear && newMonth > currentTodayMonth) {
                  newMonth = currentTodayMonth;
                }
                changeView(newYear, newMonth);
              }
            }}
          >
            <SelectTrigger
              aria-label="Year"
              className="w-full h-8 px-2.5 text-xs font-semibold bg-white dark:bg-[#0d1117] border-slate-300 dark:border-white/20 hover:border-[#2563eb] text-slate-900 dark:text-white rounded-md cursor-pointer justify-between shadow-none"
            >
              <SelectValue placeholder="Year">
                {currentYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-56 z-[70] bg-white dark:bg-[#0d1117] border-slate-200 dark:border-white/10 text-xs">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={String(year)}
                  className="text-xs font-medium cursor-pointer"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={selected ?? today}
        onSelect={(date) => {
          if (!date) {
            onSelect?.(date);
            return;
          }
          if (date > today || date < new Date(MIN_YEAR, 0, 1)) {
            return;
          }
          onSelect?.(date);
        }}
        month={viewMonth}
        onMonthChange={(month) => {
          if (month > today) {
            setViewMonth(today);
          } else {
            setViewMonth(month);
          }
        }}
        hideNavigation
        classNames={{ month_caption: "hidden" }}
        disabled={(date) => date > today || date < new Date(MIN_YEAR, 0, 1)}
        startMonth={new Date(MIN_YEAR, 0)}
        endMonth={today}
      />
    </div>
  );
}
