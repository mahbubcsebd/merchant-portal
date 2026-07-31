import React, { useState, useEffect } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { usePayBills } from "@/hooks/usePayBills";
import { useQueryClient } from "@tanstack/react-query";

export default function BillerTemplateFormFields({
  data,
  isView,
  errors = {},
  clearError = () => {},
}) {
  const { allBillersQuery } = usePayBills();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const [billerId, setBillerId] = useState(data?.billerId || "");
  const [billerName, setBillerName] = useState(data?.billerName || "");
  const [currency, setCurrency] = useState(data?.currency || "");

  // If creating new template, try to default to local currency (XCG / "0")
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

  // Auto-fill currency when billerId changes
  useEffect(() => {
    if (billerId) {
      const selectedBiller = billerOptions.find((b) => b.value === billerId);
      if (selectedBiller) {
        setCurrency(selectedBiller.currency);
        setBillerName(selectedBiller.label);
      }
    } else if (!data) {
      // If we deselect biller during creation, reset back to local currency (XCG / "0")
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
        label="Biller Name"
        required
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
        label="Bill Template Name"
        required
        disabled={isView}
        defaultValue={data?.templateName || ""}
        placeholder="e.g. Bill Template 001"
        error={errors.billName}
        onChange={() => clearError("billName")}
      />
      <GlobalInput
        name="refNum"
        label="Reference Number"
        required
        disabled={isView}
        defaultValue={data?.referenceNo || ""}
        placeholder="e.g. 12345"
        error={errors.refNum}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
          clearError("refNum");
        }}
      />
      <GlobalSelect
        name="displayCurrency"
        label="Currency"
        required
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
