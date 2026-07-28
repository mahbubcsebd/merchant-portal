import React from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";

export default function BillerTemplateFormFields({ data, isView }) {
  return (
    <div className="space-y-4 w-full">
      <GlobalSelect
        name="billerName"
        label="Biller Name"
        required
        disabled={isView}
        defaultValue={data?.billerName || "bank-of-america"}
        options={[
          { value: "vidanova", label: "Vidanova" },
          { value: "bank-of-america", label: "Bank of America" },
          { value: "mpay", label: "mPay Network" },
        ]}
        labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5"
      />
      <GlobalInput
        name="templateName"
        label="Bill Template Name"
        required
        disabled={isView}
        defaultValue={data?.templateName || ""}
        placeholder="e.g. Bill Template 001"
      />
      <GlobalInput
        name="referenceNo"
        label="Reference Number"
        required
        disabled={isView}
        defaultValue={data?.referenceNo || ""}
        placeholder="e.g. 12345"
      />
      <GlobalSelect
        name="currency"
        label="Currency"
        required
        disabled={isView}
        defaultValue={data?.currency || "xcg"}
        options={[{ value: "xcg", label: "XCG" }]}
        labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5"
      />
    </div>
  );
}
