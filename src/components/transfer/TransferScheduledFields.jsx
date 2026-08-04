import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import GlobalSelect from "@/components/globals/GlobalSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function TransferScheduledFields({ formData, handleSelectChange, errors }) {
  if (formData.when !== "Scheduled") return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl mt-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col">
        <label className="block text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5">
          Start Date<span className="ml-1 text-[#e65625]">*</span>
        </label>
        <div className="relative w-full flex">
          <CalendarIcon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
          />
          <Popover>
            <PopoverTrigger
              type="button"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full pl-10 h-10 text-sm font-medium justify-start text-left bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-[#2563eb] rounded-lg transition-all duration-150 shadow-none",
                !formData.startDate
                  ? "text-slate-400 font-normal"
                  : "text-slate-900 dark:text-white",
                errors.startDate &&
                  "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
              )}
            >
              {formData.startDate ? (
                format(formData.startDate, "dd/MM/yyyy")
              ) : (
                <span>dd/mm/yyyy</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => {
                  handleSelectChange("startDate", date);
                }}
                disabled={(date) =>
                  date < new Date().setHours(0, 0, 0, 0)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {errors.startDate && (
          <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {errors.startDate}
          </p>
        )}
      </div>

      <GlobalSelect
        label="How Often"
        name="howOften"
        required
        value={formData.howOften}
        onChange={(val) => handleSelectChange("howOften", val)}
        labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        options={[
          { value: "1", label: "Once" },
          { value: "2", label: "Weekly" },
          { value: "3", label: "Bi-weekly" },
          { value: "4", label: "Monthly" },
          { value: "5", label: "Quarterly" },
          { value: "6", label: "Half-yearly" },
          { value: "7", label: "Annual" },
        ]}
        error={errors.howOften}
      />

      {parseInt(formData.howOften) > 1 && (
        <>
          <GlobalSelect
            label="Until"
            name="until"
            required
            value={formData.until}
            onChange={(val) => handleSelectChange("until", val)}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "N", label: "Further Notice" },
              { value: "Y", label: "Specified Date" },
            ]}
            error={errors.until}
          />

          {formData.until === "Y" && (
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5">
                End Date<span className="ml-1 text-[#e65625]">*</span>
              </label>
              <div className="relative w-full flex">
                <CalendarIcon
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <Popover>
                  <PopoverTrigger
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full pl-10 h-10 text-sm font-medium justify-start text-left bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-[#2563eb] rounded-lg transition-all duration-150 shadow-none",
                      !formData.endDate
                        ? "text-slate-400 font-normal"
                        : "text-slate-900 dark:text-white",
                      errors.endDate &&
                        "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                    )}
                  >
                    {formData.endDate ? (
                      format(formData.endDate, "dd/MM/yyyy")
                    ) : (
                      <span>dd/mm/yyyy</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => {
                        handleSelectChange("endDate", date);
                      }}
                      disabled={(date) =>
                        date < new Date().setHours(0, 0, 0, 0) ||
                        (formData.startDate &&
                          date <= formData.startDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.endDate && (
                <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.endDate}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
