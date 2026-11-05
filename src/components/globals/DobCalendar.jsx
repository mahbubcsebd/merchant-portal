import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

const MIN_YEAR = 1930;
const SELECT_CLASS =
  "h-8 flex-1 rounded-md border border-slate-300 dark:border-white/20 bg-white dark:bg-[#0d1117] px-2 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer hover:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]";

function getMonthNames() {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("en", { month: "long" }),
  );
}

/**
 * Date-of-birth calendar with native month + year <select>s,
 * so users can jump straight to a birth year.
 */
export function DobCalendar({ selected, onSelect }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(
    selected ?? new Date(1990, 0, 1),
  );

  const years = Array.from(
    { length: today.getFullYear() - MIN_YEAR + 1 },
    (_, i) => today.getFullYear() - i,
  );

  const changeView = (year, month) => setViewMonth(new Date(year, month, 1));

  return (
    <div>
      <div className="flex gap-2 px-3 pt-3">
        <select
          aria-label="Month"
          className={SELECT_CLASS}
          value={viewMonth.getMonth()}
          onChange={(e) =>
            changeView(viewMonth.getFullYear(), Number(e.target.value))
          }
        >
          {getMonthNames().map((name, i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          className={SELECT_CLASS}
          value={viewMonth.getFullYear()}
          onChange={(e) =>
            changeView(Number(e.target.value), viewMonth.getMonth())
          }
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={viewMonth}
        onMonthChange={setViewMonth}
        hideNavigation
        classNames={{ month_caption: "hidden" }}
        disabled={(date) => date > today || date < new Date(MIN_YEAR, 0, 1)}
        startMonth={new Date(MIN_YEAR, 0)}
        endMonth={today}
      />
    </div>
  );
}
