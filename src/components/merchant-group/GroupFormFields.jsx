import React, { useState, useMemo } from "react";
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
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getDynamicCountryOptions } from "@/lib/constants/countries";
import {
  enforceNumeric,
  enforceAlphanumericSpace,
  enforceEmail,
} from "@/lib/utils/inputFormatters";

export default function GroupFormFields({
  data = {},
  isView = false,
  errors = {},
  clearError = () => {},
}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const dialOptions = useMemo(
    () => getDynamicCountryOptions(welcomeData),
    [welcomeData],
  );

  const countryOptions = useMemo(() => {
    const fromMeta = (welcomeData?.metaData?.COUNTRYCODE || []).map((c) => ({
      value: String(c.id),
      label: c.title,
    }));
    if (fromMeta.length > 0) return fromMeta;
    return dialOptions.map((c) => ({
      value: c.code,
      label: c.name,
    }));
  }, [welcomeData, dialOptions]);

  const idTypeOptions = useMemo(() => {
    const fromMeta = (welcomeData?.metaData?.BUSINESSIDTYPE || []).map((b) => ({
      value: String(b.id),
      label: b.title,
    }));
    if (fromMeta.length > 0) return fromMeta;
    return [
      { value: "COR", label: "Corporation" },
      { value: "SOL", label: "Sole Proprietorship" },
      { value: "PAR", label: "Partnership" },
      { value: "LLC", label: "LLC" },
    ];
  }, [welcomeData]);

  const statusOptions = useMemo(
    () => [
      { value: "Active", label: t("active", "Active") },
      { value: "Inactive", label: t("inactive", "Inactive") },
    ],
    [t],
  );

  const languageOptions = useMemo(
    () => [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "nl", label: "Dutch" },
    ],
    [],
  );

  // Dial code states
  const [mobileDial, setMobileDial] = useState(
    data?.mobileDial || dialOptions[0]?.dialCode || "+1",
  );
  const [businessDial, setBusinessDial] = useState(
    data?.businessDial || dialOptions[0]?.dialCode || "+1",
  );
  const [openMobileCountryBox, setOpenMobileCountryBox] = useState(false);
  const [openBusinessCountryBox, setOpenBusinessCountryBox] = useState(false);

  const selectedMobileDialObj = dialOptions.find(
    (c) =>
      c.code === mobileDial.replace("+", "") || c.dialCode === mobileDial,
  );
  const selectedBusinessDialObj = dialOptions.find(
    (c) =>
      c.code === businessDial.replace("+", "") || c.dialCode === businessDial,
  );

  // Controlled selects
  const [status, setStatus] = useState(data?.status || "Active");
  const [languageId, setLanguageId] = useState(data?.languageId || "en");
  const [country, setCountry] = useState(
    data?.country || (countryOptions[0]?.value ? String(countryOptions[0].value) : "93"),
  );
  const [businessType, setBusinessType] = useState(
    data?.businessType || (idTypeOptions[0]?.value ? String(idTypeOptions[0].value) : "COR"),
  );

  return (
    <>
      {/* Hidden inputs to pass state values to the Form handler in DialogProvider */}
      <input type="hidden" name="mobileDial" value={mobileDial} />
      <input type="hidden" name="businessDial" value={businessDial} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="languageId" value={languageId} />
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="businessType" value={businessType} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left w-full">
        {/* Group Name */}
        <GlobalInput
          name="groupName"
          label={t("mg_groupName", "Group Name")}
          required
          maxLength={100}
          minLength={3}
          defaultValue={data?.groupName || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.groupName}
          onChange={() => clearError("groupName")}
          placeholder="e.g. Acme Retail Group"
        />

        {/* Group Email */}
        <GlobalInput
          name="email"
          label={t("ms_agentEmail", "Group Email")}
          type="email"
          required
          maxLength={80}
          defaultValue={data?.email || ""}
          onInput={enforceEmail}
          disabled={isView}
          error={errors.email}
          onChange={() => clearError("email")}
          placeholder="e.g. group@example.com"
        />

        {/* Wallet PIN */}
        <GlobalInput
          name="walletPin"
          label={t("mg_walletPin", "Wallet PIN (6 digits)")}
          type="password"
          required
          maxLength={6}
          defaultValue={data?.walletPin || ""}
          onInput={enforceNumeric}
          disabled={isView}
          error={errors.walletPin}
          onChange={() => clearError("walletPin")}
          placeholder="••••••"
        />

        {/* Confirm Wallet PIN */}
        <GlobalInput
          name="confirmPin"
          label={t("mg_walletConfirmPin", "Confirm Wallet PIN")}
          type="password"
          required
          maxLength={6}
          defaultValue={data?.confirmPin || ""}
          onInput={enforceNumeric}
          disabled={isView}
          error={errors.confirmPin}
          onChange={() => clearError("confirmPin")}
          placeholder="••••••"
        />

        {/* Status */}
        <GlobalSelect
          name="status"
          label={t("global_status", "Status")}
          value={status}
          onChange={(val) => {
            setStatus(val);
            clearError("status");
          }}
          disabled={isView}
          options={statusOptions}
          required
          error={errors.status}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        {/* Language */}
        <GlobalSelect
          name="languageId"
          label={t("beforeLoginLanguage", "Language")}
          value={languageId}
          onChange={(val) => {
            setLanguageId(val);
            clearError("languageId");
          }}
          disabled={isView}
          options={languageOptions}
          required
          error={errors.languageId}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        {/* Mobile Phone with Country Popover */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
            {t("mg_mobile_number", "Mobile Number")}
          </label>
          <div
            className={cn(
              "flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 focus-within:ring-1 transition-all duration-150 overflow-hidden",
              errors.mobilePhone
                ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"
                : "border-slate-200 dark:border-white/10 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20",
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
                  className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 min-w-[70px]"
                >
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    {selectedMobileDialObj ? (
                      <>
                        <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                          {selectedMobileDialObj.isoCode}
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {selectedMobileDialObj.dialCode}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">
                        {t("select", "Select")}
                      </span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {dialOptions.map((countryItem) => (
                        <CommandItem
                          key={countryItem.name + countryItem.code}
                          value={
                            countryItem.name +
                            " " +
                            countryItem.code +
                            " " +
                            countryItem.isoCode
                          }
                          onSelect={() => {
                            setMobileDial(countryItem.dialCode);
                            setOpenMobileCountryBox(false);
                            clearError("mobilePhone");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              mobileDial === countryItem.dialCode ||
                                mobileDial === countryItem.code
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex items-center gap-2 truncate">
                            <span className="font-bold text-xs uppercase w-6 shrink-0">
                              {countryItem.isoCode}
                            </span>
                            <span className="font-semibold shrink-0">
                              {countryItem.dialCode}
                            </span>
                            <span className="truncate text-slate-500 dark:text-slate-400">
                              {countryItem.name}
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
                id="mobilePhone"
                name="mobilePhone"
                type="tel"
                placeholder="Enter mobile phone"
                maxLength={15}
                defaultValue={data?.mobilePhone || ""}
                onInput={enforceNumeric}
                onChange={() => clearError("mobilePhone")}
                disabled={isView}
                className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          {errors.mobilePhone && (
            <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.mobilePhone}
            </p>
          )}
        </div>

        {/* Business Phone with Country Popover */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
            {t("businessPhone", "Business Phone")}
          </label>
          <div
            className={cn(
              "flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 focus-within:ring-1 transition-all duration-150 overflow-hidden",
              errors.businessPhone
                ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"
                : "border-slate-200 dark:border-white/10 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20",
            )}
          >
            <Popover
              open={openBusinessCountryBox}
              onOpenChange={setOpenBusinessCountryBox}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isView}
                  aria-expanded={openBusinessCountryBox}
                  className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 min-w-[70px]"
                >
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    {selectedBusinessDialObj ? (
                      <>
                        <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                          {selectedBusinessDialObj.isoCode}
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {selectedBusinessDialObj.dialCode}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">
                        {t("select", "Select")}
                      </span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {dialOptions.map((countryItem) => (
                        <CommandItem
                          key={countryItem.name + countryItem.code}
                          value={
                            countryItem.name +
                            " " +
                            countryItem.code +
                            " " +
                            countryItem.isoCode
                          }
                          onSelect={() => {
                            setBusinessDial(countryItem.dialCode);
                            setOpenBusinessCountryBox(false);
                            clearError("businessPhone");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              businessDial === countryItem.dialCode ||
                                businessDial === countryItem.code
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex items-center gap-2 truncate">
                            <span className="font-bold text-xs uppercase w-6 shrink-0">
                              {countryItem.isoCode}
                            </span>
                            <span className="font-semibold shrink-0">
                              {countryItem.dialCode}
                            </span>
                            <span className="truncate text-slate-500 dark:text-slate-400">
                              {countryItem.name}
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
                id="businessPhone"
                name="businessPhone"
                type="tel"
                placeholder="Enter business phone"
                maxLength={20}
                defaultValue={data?.businessPhone || ""}
                onInput={enforceNumeric}
                onChange={() => clearError("businessPhone")}
                disabled={isView}
                className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          {errors.businessPhone && (
            <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.businessPhone}
            </p>
          )}
        </div>

        {/* Website */}
        <GlobalInput
          name="website"
          label={t("crWebsite", "Website")}
          maxLength={100}
          defaultValue={data?.website || ""}
          disabled={isView}
          error={errors.website}
          onChange={() => clearError("website")}
          placeholder="e.g. https://group.example.com"
        />

        {/* Business Type */}
        <GlobalSelect
          name="businessType"
          label={t("businessType", "Business Type")}
          value={businessType}
          onChange={(val) => {
            setBusinessType(val);
            clearError("businessType");
          }}
          disabled={isView}
          options={idTypeOptions}
          required
          error={errors.businessType}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        {/* Business Category */}
        <GlobalInput
          name="businessCategory"
          label={t("businessCategory", "Business Category")}
          maxLength={100}
          defaultValue={data?.businessCategory || ""}
          disabled={isView}
          error={errors.businessCategory}
          onChange={() => clearError("businessCategory")}
          onInput={enforceAlphanumericSpace}
          placeholder="e.g. Retail, Healthcare"
        />

        {/* Country */}
        <GlobalSelect
          name="country"
          label={t("country", "Country")}
          value={country}
          onChange={(val) => {
            setCountry(val);
            clearError("country");
          }}
          disabled={isView}
          options={countryOptions}
          required
          error={errors.country}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        {/* State */}
        <GlobalInput
          name="state"
          label={t("state", "State")}
          maxLength={50}
          defaultValue={data?.state || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.state}
          onChange={() => clearError("state")}
          placeholder="e.g. Metro Manila"
        />

        {/* City */}
        <GlobalInput
          name="city"
          label={t("city", "City")}
          maxLength={50}
          defaultValue={data?.city || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.city}
          onChange={() => clearError("city")}
          placeholder="e.g. Manila"
        />

        {/* Street Number */}
        <GlobalInput
          name="addrStreetNo"
          label={t("street_number", "Street Number")}
          maxLength={20}
          defaultValue={data?.addrStreetNo || ""}
          disabled={isView}
          error={errors.addrStreetNo}
          onChange={() => clearError("addrStreetNo")}
          placeholder="e.g. 123"
        />

        {/* Street Name */}
        <GlobalInput
          name="addrStreetName"
          label={t("street_name", "Street Name")}
          maxLength={100}
          defaultValue={data?.addrStreetName || ""}
          disabled={isView}
          error={errors.addrStreetName}
          onChange={() => clearError("addrStreetName")}
          placeholder="e.g. Main Street"
        />

        {/* Unit Name */}
        <GlobalInput
          name="unitName"
          label={t("mg_unitName", "Unit Name")}
          maxLength={50}
          defaultValue={data?.unitName || ""}
          disabled={isView}
          error={errors.unitName}
          onChange={() => clearError("unitName")}
          placeholder="e.g. Suite 400"
        />

        {/* Zip Code */}
        <GlobalInput
          name="zipCode"
          label={t("zip_code", "Zip Code")}
          maxLength={20}
          defaultValue={data?.zipCode || ""}
          disabled={isView}
          error={errors.zipCode}
          onChange={() => clearError("zipCode")}
          placeholder="e.g. 10001"
        />
      </div>
    </>
  );
}

