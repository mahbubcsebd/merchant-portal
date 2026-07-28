import React, { useState } from "react";
import { Check, ChevronsUpDown, Phone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import GlobalInput from "@/components/globals/GlobalInput";
import { cn } from "@/lib/utils";

const countryDialCodes = [
  { code: "+1", flag: "🇺🇸", country: "USA" },
  { code: "+44", flag: "🇬🇧", country: "UK" },
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+63", flag: "🇵🇭", country: "Philippines" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+82", flag: "🇰🇷", country: "South Korea" },
  { code: "+86", flag: "🇨🇳", country: "China" },
];

export default function CashierFormFields({ data, isView, errors = {} }) {
  const [mobileDial, setMobileDial] = useState(data?.mobileDial || "+1");
  const [openMobileCountryBox, setOpenMobileCountryBox] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left w-full">
        <GlobalInput
          name="loginId"
          label="User Login ID"
          required
          defaultValue={data?.loginId || ""}
          disabled={isView}
          error={errors.loginId}
          placeholder="e.g. cashier_john"
        />
        <GlobalInput
          name="name"
          label="Cashier Name"
          required
          defaultValue={data?.name || ""}
          disabled={isView}
          error={errors.name}
          placeholder="e.g. John Doe"
        />
        {/* Mobile Phone (Cashier) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
            Mobile Phone
          </label>
          <div className="flex items-stretch w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20 transition-all duration-150 overflow-hidden">
            <Popover open={openMobileCountryBox} onOpenChange={setOpenMobileCountryBox}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isView}
                  aria-expanded={openMobileCountryBox}
                  className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{countryDialCodes.find((c) => c.code === mobileDial)?.flag}</span>
                    <span>{mobileDial}</span>
                  </span>
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countryDialCodes.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.country + " " + country.code}
                          onSelect={() => {
                            setMobileDial(country.code);
                            setOpenMobileCountryBox(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", mobileDial === country.code ? "opacity-100" : "opacity-0")} />
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.country} ({country.code})</span>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="relative flex-1 flex items-center">
              <Phone size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Enter phone number"
                defaultValue={data?.phone || ""}
                disabled={isView}
                className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
              />
            </div>
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>
      
      {/* Hidden state value for form submission */}
      <input type="hidden" name="mobileDial" value={mobileDial} />
    </>
  );
}
