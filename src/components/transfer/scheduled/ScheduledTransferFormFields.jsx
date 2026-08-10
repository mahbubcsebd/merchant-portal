import React, { useState } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { enforceNumericSpace, enforceAlphanumericSpace } from "@/lib/utils/inputFormatters";
import { getBankName, getCurrencyLabel } from "@/lib/utils/TransferUtils";
import { useQueryClient } from "@tanstack/react-query";
import TransferScheduledFields from "@/components/transfer/TransferScheduledFields";
import { parse, format } from "date-fns";

export default function ScheduledTransferFormFields({ data = {}, accounts = [], errors = {}, clearError = () => {} }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const accountOptions = (accounts || []).map((acc) => ({
    value: acc.ACCOUNTNUMBER,
    label: `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(acc.AVBALANCE || "0"))} ${acc.CURSHRTNAME || acc.CURCODE}`,
  }));

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === "0") return null;
    if (dateStr.length === 8) {
      return parse(dateStr, "yyyyMMdd", new Date());
    }
    if (dateStr.includes("-")) {
      return parse(dateStr, "yyyy-MM-dd", new Date());
    }
    return new Date();
  };

  const [formData, setFormData] = useState({
    TXNAMOUNT: data.TXNAMOUNT || "",
    TXNDESC: data.TXNDESC || "",
    when: "Scheduled",
    startDate: parseDate(data.STRDATE),
    howOften: data.FREQUENCY || "1",
    until: data.ENDDATE && data.ENDDATE !== "0" ? "Y" : "N",
    endDate: parseDate(data.ENDDATE),
    fromAccount: data.WACCOUNT || (accountOptions[0]?.value || ""), // Default to first if not provided
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleSelectChange = (name, val) => {
    handleChange(name, val);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="SCHEDULEDTXNID" value={data.SCHEDULEDTXNID || ""} />
      <input type="hidden" name="BENFNAME" value={data.BENFNAME || ""} />
      <input type="hidden" name="BENFACCUR" value={data.BENFACCUR || ""} />
      <input type="hidden" name="BENFBNKAC" value={data.BENFBNKAC || ""} />
      
      {/* Dynamic fields mapped to API expected names inside ManageScheduledTransfers */}
      <input type="hidden" name="TXNAMOUNT" value={formData.TXNAMOUNT} />
      <input type="hidden" name="TXNDESC" value={formData.TXNDESC} />
      <input type="hidden" name="STRDATE" value={formData.startDate ? format(formData.startDate, "yyyyMMdd") : ""} />
      <input type="hidden" name="FREQUENCY" value={formData.howOften} />
      <input type="hidden" name="ENDDATE" value={formData.until === "Y" && formData.endDate ? format(formData.endDate, "yyyyMMdd") : "0"} />
      <input type="hidden" name="FROMACC" value={formData.fromAccount} />

      <div className="bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4 space-y-3 mb-2 animate-in fade-in duration-300">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-white/80">{t("p2b_benbank", "Bank Name")}</span>
          <span className="text-slate-600 dark:text-white/60">{getBankName(welcomeData, data.BENFBNKID)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-white/80">{t("p2b_benname", "Beneficiary Name")}</span>
          <span className="text-slate-600 dark:text-white/60">{data.BENFNAME}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-white/80">{t("p2b_accno", "Account No.")}</span>
          <span className="text-slate-600 dark:text-white/60">{data.BENFBNKAC || data.account || "N/A"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-white/80">{t("p2b_currency", "Currency")}</span>
          <span className="text-slate-600 dark:text-white/60">{getCurrencyLabel(welcomeData, data.BENFACCUR)}</span>
        </div>
      </div>

      <GlobalSelect
        label={t("from_account", "From Account")}
        name="display_fromAccount"
        value={formData.fromAccount}
        onChange={(val) => handleSelectChange("fromAccount", val)}
        options={accountOptions}
        required
      />

      <GlobalInput
        label={t("teAmount", "Amount")}
        name="display_amount"
        value={formData.TXNAMOUNT}
        onChange={(e) => handleChange("TXNAMOUNT", e.target.value)}
        required
        maxLength={17}
        onInput={enforceNumericSpace}
        error={errors.TXNAMOUNT}
      />

      <GlobalInput
        label={t("ptb_description", "Description")}
        name="display_desc"
        value={formData.TXNDESC}
        onChange={(e) => handleChange("TXNDESC", e.target.value)}
        maxLength={30}
        onInput={enforceAlphanumericSpace}
      />

      {/* Reuse exact schedule fields from Transfer */}
      <TransferScheduledFields
        formData={formData}
        handleSelectChange={handleSelectChange}
        errors={{
           startDate: errors.STRDATE,
           howOften: errors.FREQUENCY,
           endDate: errors.ENDDATE,
           ...errors
        }}
      />
    </div>
  );
}
