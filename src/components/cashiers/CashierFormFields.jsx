import React, { useState } from "react";
import { Check, ChevronsUpDown, Phone } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useBranches } from "@/hooks/useBranches";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  enforceNumeric,
  enforceAlphanumericSpace,
  enforceEmail,
  enforceNumericSpace,
} from "@/lib/utils/inputFormatters";

export default function CashierFormFields({
  data,
  isView,
  errors = {},
  clearError = () => {},
}) {
  const [mobileDial, setMobileDial] = useState(data?.phCountryCode || "");
  const [openMobileCountryBox, setOpenMobileCountryBox] = useState(false);
  const [merSubID, setMerSubID] = useState(data?.merSubID || "");
  const [cashierIDType, setCashierIDType] = useState(data?.cashierIDType || "");
  const { t } = useLanguage();

  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const identifyTypes = welcomeData?.metaData?.IDENTIFYTYPE || [];
  const dialOptions = (welcomeData?.metaData?.COUNTRYCODE || []).map((c) => ({
    code: `+${c.id}`,
    name: c.title,
  }));

  const { branches } = useBranches();
  const activeSubsidiaries = branches.filter((sub) => sub.SUBSTATUS === "A");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left w-full">
        <GlobalInput
          name="merCashierID"
          label={t("cashier_user_id", "Cashier User ID")}
          required
          defaultValue={data?.merCashierID || ""}
          disabled={isView}
          isReadOnly={!!data && !isView}
          error={errors.merCashierID}
          onChange={() => clearError("merCashierID")}
          maxLength={20}
          onInput={enforceAlphanumericSpace}
        />

        <GlobalInput
          name="cashierFName"
          label={t("ucFirstName", "First Name")}
          required
          defaultValue={data?.cashierFName || ""}
          disabled={isView}
          error={errors.cashierFName}
          onChange={() => clearError("cashierFName")}
          maxLength={50}
          onInput={enforceAlphanumericSpace}
        />

        <GlobalInput
          name="cashierLName"
          label={t("ucLastName", "Last Name")}
          required
          defaultValue={data?.cashierLName || ""}
          disabled={isView}
          error={errors.cashierLName}
          onChange={() => clearError("cashierLName")}
          maxLength={50}
          onInput={enforceAlphanumericSpace}
        />

        <GlobalInput
          name="cashierEmail"
          label={t("bp_email", "Email Address")}
          required
          defaultValue={data?.cashierEmail || ""}
          disabled={isView}
          error={errors.cashierEmail}
          onChange={() => clearError("cashierEmail")}
          maxLength={80}
          onInput={enforceEmail}
        />

        {/* Mobile Phone (Cashier) */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-0.5">
            {t("global_mobile_no", "Mobile No.")}{" "}
            <span className="text-[#e65625]">*</span>
          </label>
          <div
            className={cn(
              "flex items-stretch w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20 transition-all duration-150 overflow-hidden",
              errors.cashierMobile || errors.countryCode
                ? "border-red-500"
                : "",
            )}
          >
            <Popover
              open={openMobileCountryBox}
              onOpenChange={setOpenMobileCountryBox}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isView}
                  aria-expanded={openMobileCountryBox}
                  className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5">
                    <span className={!mobileDial ? "text-slate-400" : ""}>
                      {mobileDial || t("select", "Select")}
                    </span>
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
                      {dialOptions.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name + " " + country.code}
                          onSelect={() => {
                            setMobileDial(country.code);
                            setOpenMobileCountryBox(false);
                            clearError("countryCode");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              mobileDial === country.code
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex items-center gap-2">
                            <span>
                              {country.name} ({country.code})
                            </span>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="relative flex-1 flex items-center">
              <Phone
                size={14}
                className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                id="cashierMobile"
                name="cashierMobile"
                type="tel"
                maxLength={15}
                placeholder={t("global_mobile_no", "Enter mobile number")}
                defaultValue={
                  data?.cashierMobile
                    ? data.cashierMobile.replace(data.phCountryCode, "")
                    : ""
                }
                disabled={isView}
                onChange={() => clearError("cashierMobile")}
                onInput={enforceNumeric}
                className={cn(
                  "w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-650",
                  errors.cashierMobile
                    ? "text-red-500"
                    : "text-slate-900 dark:text-white",
                )}
              />
            </div>
          </div>
          {errors.countryCode && !errors.cashierMobile && (
            <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.countryCode}
            </p>
          )}
          {errors.cashierMobile && (
            <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.cashierMobile}
            </p>
          )}
        </div>

        <GlobalSelect
          name="merSubID"
          label={t("myQr_subsidiary", "Branch")}
          required
          value={merSubID}
          disabled={isView}
          error={errors.merSubID}
          onChange={(val) => {
            setMerSubID(val);
            clearError("merSubID");
          }}
          options={activeSubsidiaries.map((sub) => ({
            value: sub.CORPCUSTSUBID,
            label: sub.SUBNAME,
          }))}
        />

        <GlobalSelect
          name="cashierIDType"
          label={t("cashier_id_type", "Cashier ID Type")}
          required
          value={cashierIDType}
          disabled={isView}
          error={errors.cashierIDType}
          onChange={(val) => {
            setCashierIDType(val);
            clearError("cashierIDType");
          }}
          options={identifyTypes.map((type) => ({
            value: type.id,
            label: type.title,
          }))}
        />

        <GlobalInput
          name="cashierIDNum"
          label={t("cashier_id_number", "Cashier ID Number")}
          required
          defaultValue={data?.cashierIDNum || ""}
          disabled={isView}
          error={errors.cashierIDNum}
          onChange={() => clearError("cashierIDNum")}
          maxLength={30}
          onInput={enforceNumericSpace}
        />
      </div>

      {/* Hidden state value for form submission */}
      <input type="hidden" name="countryCode" value={mobileDial} />
    </>
  );
}
