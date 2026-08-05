import { useState } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { enforceNumeric, enforceAlphanumericSpace } from "@/lib/utils/inputFormatters";

export default function BeneficiaryFormFields({ data, isView, isEditMode = false, errors = {}, clearError = () => {} }) {
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const { t } = useLanguage();

  // Extract lists from metaData
  const bankList = welcomeData?.metaData?.SETTLEBANK || [];
  const currencyList = welcomeData?.metaData?.CURRENCY || [];

  // Format options for GlobalSelect
  const bankOptions = bankList.map((bank) => ({
    value: bank.id,
    label: bank.title,
  }));

  const currencyOptions = currencyList.map((curr) => ({
    value: curr.id,
    label: curr.title,
  }));

  const [formData, setFormData] = useState({
    payeeName: data?.payeeName || data?.name || "",
    payeeNickName: data?.payeeNickName || data?.nickname || "",
    payeeBankAccount: data?.payeeBankAccount || data?.account || "",
    payeeBankId: data?.payeeBankId || data?.bank || "",
    payeeAcctCurr: data?.payeeAcctCurr || data?.currency || "",
  });

  const handleChange = (field, value) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden inputs to pass state up to the form handler in the dialog */}
      <input type="hidden" name="payeeName" value={formData.payeeName} />
      <input
        type="hidden"
        name="payeeNickName"
        value={formData.payeeNickName}
      />
      <input
        type="hidden"
        name="payeeBankAccount"
        value={formData.payeeBankAccount}
      />
      <input type="hidden" name="payeeBankId" value={formData.payeeBankId} />
      <input
        type="hidden"
        name="payeeAcctCurr"
        value={formData.payeeAcctCurr}
      />

      <GlobalInput
        label={t("add_ben_firstLast", "Beneficiary Name")}
        name="display_payeeName"
        value={formData.payeeName}
        onChange={(e) => handleChange("payeeName", e.target.value)}
        disabled={isView || isEditMode}
        required
        maxLength={50}
        onInput={enforceAlphanumericSpace}
        error={errors.payeeName}
        placeholder="Enter beneficiary name"
      />

      <GlobalInput
        label={t("add_ben_nickname", "Beneficiary Nickname")}
        name="display_payeeNickName"
        value={formData.payeeNickName}
        onChange={(e) => handleChange("payeeNickName", e.target.value)}
        disabled={isView}
        required
        maxLength={30}
        onInput={enforceAlphanumericSpace}
        error={errors.payeeNickName}
        placeholder="Enter nickname"
      />

      <GlobalInput
        label={t("add_ben_accNo", "Account Number")}
        name="display_payeeBankAccount"
        value={formData.payeeBankAccount}
        onChange={(e) => handleChange("payeeBankAccount", e.target.value)}
        disabled={isView}
        required
        maxLength={12}
        onInput={enforceNumeric}
        error={errors.payeeBankAccount}
        placeholder="Enter account number"
      />

      <GlobalSelect
        label={t("add_ben_bank", "Bank")}
        name="display_payeeBankId"
        value={formData.payeeBankId}
        onChange={(val) => handleChange("payeeBankId", val)}
        options={bankOptions}
        disabled={isView}
        required
        error={errors.payeeBankId}
        searchable
        placeholder="Select Bank"
      />

      <GlobalSelect
        label={t("add_ben_currency", "Currency")}
        name="display_payeeAcctCurr"
        value={formData.payeeAcctCurr}
        onChange={(val) => handleChange("payeeAcctCurr", val)}
        options={currencyOptions}
        disabled={isView}
        required
        error={errors.payeeAcctCurr}
        placeholder="Select Currency"
      />
    </div>
  );
}
