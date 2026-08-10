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
import GlobalUpload from "@/components/globals/GlobalUpload";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/lib/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  enforceNumeric,
  enforceAlphanumericSpace,
  enforceNumericSpace,
  enforceEmail,
} from "@/lib/utils/inputFormatters";

export default function BranchFormFields({
  data,
  isView,
  errors = {},
  clearError = () => {},
}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const countryOptions = (welcomeData?.metaData?.COUNTRYCODE || []).map(
    (c) => ({ value: c.id, label: c.title }),
  );
  const categoryOptions = (welcomeData?.metaData?.SUBCATEGORY || []).map(
    (c) => ({ value: c.id, label: c.title }),
  );
  const idTypeOptions = (welcomeData?.metaData?.BUSINESSIDTYPE || []).map(
    (c) => ({ value: c.id, label: c.title }),
  );

  // Dial code options mapped from COUNTRYCODE
  const dialOptions = (welcomeData?.metaData?.COUNTRYCODE || []).map((c) => ({
    code: `+${c.id}`,
    name: c.title,
  }));

  // Mobile and Business Dial state
  const [mobileDial, setMobileDial] = useState(data?.mobileDial || "");
  const [businessDial, setBusinessDial] = useState(data?.businessDial || "");
  const [openMobileCountryBox, setOpenMobileCountryBox] = useState(false);
  const [openBusinessCountryBox, setOpenBusinessCountryBox] = useState(false);

  // Form selections state
  const [country, setCountry] = useState(
    data?.subCountry != null ? String(data.subCountry).trim() : "",
  );
  const [category, setCategory] = useState(
    data?.subCategory != null ? String(data.subCategory).trim() : "",
  );
  const [idType, setIdType] = useState(
    data?.businessIdType != null ? String(data.businessIdType).trim() : "",
  );
  const [status, setStatus] = useState(
    data?.subStatus != null ? String(data.subStatus).trim() : "A",
  );
  const [profilePic, setProfilePic] = useState(data?.proImgId || null);
  const [docPic, setDocPic] = useState(data?.businessIdImg || null);

  return (
    <>
      {/* Hidden inputs to pass state values to the Form handler in DialogProvider */}
      <input type="hidden" name="mobileDial" value={mobileDial} />
      <input type="hidden" name="businessDial" value={businessDial} />
      <input type="hidden" name="proImgId" value={profilePic || ""} />
      <input type="hidden" name="businessIdImg" value={docPic || ""} />
      <input type="hidden" name="subStatus" value={status} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left w-full">
        {data?.subId && <input type="hidden" name="subId" value={data.subId} />}
        <GlobalInput
          name="subName"
          label={t("subsidiaryName", "Branch Name")}
          required
          maxLength={40}
          minLength={3}
          defaultValue={data?.subName || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.subName}
          placeholder="e.g. Silicon Valley Branch"
        />
        <GlobalInput
          name="emailAddr"
          label={t("subs_email_address", "Email Address")}
          type="email"
          required
          maxLength={80}
          defaultValue={data?.emailAddr || ""}
          onInput={enforceEmail}
          disabled={isView}
          error={errors.emailAddr}
          placeholder="e.g. branch@example.com"
        />

        {/* Mobile Phone (Branch) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
            {t("subs_mobile_num", "Mobile Phone")}{" "}
            <span className="ml-1 text-[#e65625]">*</span>
          </label>
          <div
            className={cn(
              "flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 focus-within:ring-1 transition-all duration-150 overflow-hidden",
              errors.mobileDial || errors.mobilePhone
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
                  <span className="flex items-center gap-1.5">
                    <span>{mobileDial || t("select", "Select")}</span>
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
                      {dialOptions.map((countryItem) => (
                        <CommandItem
                          key={countryItem.name + countryItem.code}
                          value={countryItem.name + " " + countryItem.code}
                          onSelect={() => {
                            setMobileDial(countryItem.code);
                            setOpenMobileCountryBox(false);
                            clearError("mobileDial");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              mobileDial === countryItem.code
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex items-center gap-2">
                            <span>
                              {countryItem.code} ({countryItem.name})
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
                required
                placeholder="Enter mobile phone"
                maxLength={15}
                minLength={7}
                defaultValue={data?.mobilePhone?.replace(mobileDial, "") || ""}
                onInput={enforceNumeric}
                onChange={() => clearError("mobilePhone")}
                disabled={isView}
                className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
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

        {/* Business Phone (Branch) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-white/70">
            {t("sub_businessPhone", "Business Phone")}{" "}
            <span className="ml-1 text-[#e65625]">*</span>
          </label>
          <div
            className={cn(
              "flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 focus-within:ring-1 transition-all duration-150 overflow-hidden",
              errors.businessDial || errors.businessPhone
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
                  <span className="flex items-center gap-1.5">
                    <span>{businessDial || t("select", "Select")}</span>
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
                      {dialOptions.map((countryItem) => (
                        <CommandItem
                          key={countryItem.name + countryItem.code}
                          value={countryItem.name + " " + countryItem.code}
                          onSelect={() => {
                            setBusinessDial(countryItem.code);
                            setOpenBusinessCountryBox(false);
                            clearError("businessDial");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              businessDial === countryItem.code
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex items-center gap-2">
                            <span>
                              {countryItem.code} ({countryItem.name})
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
                required
                placeholder="Enter business phone"
                maxLength={20}
                minLength={3}
                defaultValue={
                  data?.businessPhone?.replace(businessDial, "") || ""
                }
                onInput={enforceNumeric}
                onChange={() => clearError("businessPhone")}
                disabled={isView}
                className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
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

        <GlobalSelect
          label={t("sub_country", "Country")}
          name="subCountry"
          value={country}
          onChange={(val) => {
            setCountry(val);
            clearError("subCountry");
          }}
          disabled={isView}
          options={countryOptions}
          required
          error={errors.subCountry}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        <GlobalInput
          name="subState"
          label={t("sub_state", "State")}
          maxLength={50}
          defaultValue={data?.subState || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.subState}
          placeholder="e.g. Metro Manila"
        />
        <GlobalInput
          name="subCity"
          label={t("sub_city", "City")}
          required
          maxLength={30}
          minLength={2}
          defaultValue={data?.subCity || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.subCity}
          placeholder="e.g. Manila"
        />
        <GlobalInput
          name="streetName"
          label={t("sub_street", "Street Name")}
          required
          maxLength={30}
          minLength={2}
          defaultValue={data?.streetName || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.streetName}
          placeholder="e.g. Taft Avenue"
        />
        <GlobalInput
          name="streetNum"
          label={t("sub_streetNo", "Street No")}
          required
          maxLength={10}
          minLength={1}
          defaultValue={data?.streetNum || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.streetNum}
          placeholder="e.g. 123"
        />
        <GlobalInput
          name="unitName"
          label={t("sub_unitname", "Unit Name")}
          required
          maxLength={10}
          minLength={1}
          defaultValue={data?.unitName || ""}
          onInput={enforceAlphanumericSpace}
          disabled={isView}
          error={errors.unitName}
          placeholder="e.g. Suite 400"
        />
        <GlobalInput
          name="subZip"
          label={t("sub_zip", "Zip Code")}
          required
          maxLength={20}
          minLength={3}
          defaultValue={data?.subZip || ""}
          onInput={enforceNumeric}
          disabled={isView}
          error={errors.subZip}
          placeholder="e.g. 1234"
        />

        <GlobalSelect
          label={t("sub_category", "Branch Category")}
          name="subCategory"
          value={category}
          onChange={(val) => {
            setCategory(val);
            clearError("subCategory");
          }}
          disabled={isView}
          options={categoryOptions}
          required
          error={errors.subCategory}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        <GlobalSelect
          label={t("subs_bussiness_idtype", "Business ID Type")}
          name="businessIdType"
          value={idType}
          onChange={(val) => {
            setIdType(val);
            clearError("businessIdType");
          }}
          disabled={isView}
          options={idTypeOptions}
          required
          error={errors.businessIdType}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        <GlobalInput
          name="businessIdNum"
          label={t("subs_bussines_idnumber", "Business ID Number")}
          required
          maxLength={30}
          defaultValue={data?.businessIdNum || ""}
          onInput={enforceNumericSpace}
          disabled={isView}
          error={errors.businessIdNum}
          placeholder="e.g. Corp-ID-12345"
        />

        <GlobalInput
          name="website"
          label={t("sub_webSite", "Website")}
          maxLength={80}
          defaultValue={data?.website || ""}
          disabled={isView}
          error={errors.website}
          placeholder="e.g. https://moadbus.com"
        />

        <GlobalSelect
          label={t("global_status", "Status")}
          name="subStatus"
          value={status}
          onChange={(val) => {
            setStatus(val);
            clearError("subStatus");
          }}
          disabled={isView}
          required
          options={[
            { value: "A", label: "Active" },
            { value: "I", label: "Inactive" },
          ]}
          error={errors.subStatus}
          labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
        />

        {/* Profile Image & Doc Image */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <GlobalUpload
            label={t("sub_proImgId", "Upload Profile Picture")}
            value={profilePic}
            onChange={async (fileBase64) => {
              if (!fileBase64) {
                setProfilePic(null);
                return;
              }
              try {
                const res = await uploadDocument({
                  imgData: fileBase64,
                  imgType: "proImgId",
                });
                if (res?.data?.[0]?.IMGIDNUM) {
                  setProfilePic(res.data[0].IMGIDNUM);
                } else {
                  console.error("Upload failed", res);
                }
              } catch (e) {
                console.error("Upload error", e);
              }
            }}
            disabled={isView}
          />
          <GlobalUpload
            label={t("sub_businessIdImg", "Upload Business ID Picture")}
            value={docPic}
            onChange={async (fileBase64) => {
              if (!fileBase64) {
                setDocPic(null);
                return;
              }
              try {
                const res = await uploadDocument({
                  imgData: fileBase64,
                  imgType: "businessIdImg",
                });
                if (res?.data?.[0]?.IMGIDNUM) {
                  setDocPic(res.data[0].IMGIDNUM);
                } else {
                  console.error("Upload failed", res);
                }
              } catch (e) {
                console.error("Upload error", e);
              }
            }}
            disabled={isView}
          />
        </div>
      </div>
    </>
  );
}
