import React, { useState, useEffect } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { usePayBills } from "@/hooks/usePayBills";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { enforceAlphanumeric, enforceAlphanumericSpace } from "@/lib/utils/inputFormatters";

export default function BillerTemplateFormFields({
  data,
  isView,
  errors = {},
  clearError = () => {},
}) {
  const { allBillersQuery } = usePayBills();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const { t } = useLanguage();

  const [billerId, setBillerId] = useState(data?.billerId || "");
  const [billerName, setBillerName] = useState(data?.billerName || "");
  const [currency, setCurrency] = useState(data?.currency || "");

  useEffect(() => {
    if (!data && !currency) {
      setCurrency("0");
    }
  }, [data, currency]);

  const billerOptions = (allBillersQuery.data || []).map((b) => ({
    value: String(b.BILLERID),
    label: b.BLRDESC,
    currency: b.BLRWALCUR,
  }));

  useEffect(() => {
    if (billerId) {
      const selectedBiller = billerOptions.find((b) => b.value === billerId);
      if (selectedBiller) {
        setCurrency(selectedBiller.currency);
        setBillerName(selectedBiller.label);
      }
    } else if (!data) {
      setCurrency("0");
      setBillerName("");
    }
  }, [billerId, billerOptions, welcomeData, data]);

  return (
    <div className="space-y-4 w-full">
      <input type="hidden" name="billerName" value={billerName} />
      <input type="hidden" name="currency" value={currency} />

      <GlobalSelect
        name="billerId"
        required
        label={
          <>
            {t("r_billerName", "Biller Name")} <span className="text-red-500">*</span>
          </>
        }
        disabled={isView || allBillersQuery.isLoading}
        value={billerId}
        onChange={(val) => {
          setBillerId(val);
          clearError("billerId");
        }}
        error={errors.billerId}
        options={billerOptions}
        labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5"
      />
      <GlobalInput
        name="billName"
        required
        label={
          <>
            {t("bp_tpName1", "Template Name")} <span className="text-red-500">*</span>
          </>
        }
        disabled={isView}
        defaultValue={data?.templateName || ""}
        placeholder="e.g. Bill Template 001"
        maxLength={50}
        onInput={enforceAlphanumericSpace}
        error={errors.billName}
        onChange={() => clearError("billName")}
      />
      <GlobalInput
        name="refNum"
        required
        label={
          <>
            {t("bp_ref", "Reference Number")} <span className="text-red-500">*</span>
          </>
        }
        disabled={isView}
        defaultValue={data?.referenceNo || ""}
        placeholder="e.g. 12345"
        maxLength={30}
        onInput={enforceAlphanumeric}
        error={errors.refNum}
        onChange={() => clearError("refNum")}
      />
      <GlobalSelect
        name="displayCurrency"
        required
        label={t("lmCurrency", "Currency")}
        disabled={true}
        value={currency}
        options={(welcomeData?.metaData?.CURRENCY || []).map((c) => ({
          value: String(c.id),
          label: c.title,
        }))}
        labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5"
      />
    </div>
  );
}
