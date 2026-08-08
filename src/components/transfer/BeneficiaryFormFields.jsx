import { useState } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function BeneficiaryFormFields({ data, isView, isEditMode = false, errors = {}, clearError = () => {} }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

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
        label={t("beneficiary_name", "Beneficiary Name")}
        name="display_payeeName"
        value={formData.payeeName}
        onChange={(e) => handleChange("payeeName", e.target.value)}
        disabled={isView || isEditMode}
        required
        error={errors.payeeName}
        placeholder={t("ph_enter_beneficiary_name", "Enter beneficiary name")}
      />

      <GlobalInput
        label={t("beneficiary_nickname", "Beneficiary Nickname")}
        name="display_payeeNickName"
        value={formData.payeeNickName}
        onChange={(e) => handleChange("payeeNickName", e.target.value)}
        disabled={isView}
        required
        error={errors.payeeNickName}
        placeholder={t("ph_enter_nickname", "Enter nickname")}
      />

      <GlobalInput
        label={t("account_number", "Account Number")}
        name="display_payeeBankAccount"
        value={formData.payeeBankAccount}
        onChange={(e) => handleChange("payeeBankAccount", e.target.value)}
        disabled={isView}
        required
        error={errors.payeeBankAccount}
        placeholder={t("ph_enter_account_number", "Enter account number")}
      />

      <GlobalSelect
        label={t("bank_name", "Bank")}
        name="display_payeeBankId"
        value={formData.payeeBankId}
        onChange={(val) => handleChange("payeeBankId", val)}
        options={bankOptions}
        disabled={isView}
        required
        error={errors.payeeBankId}
        searchable
        placeholder={t("ph_select_bank", "Select Bank")}
      />

      <GlobalSelect
        label={t("currency", "Currency")}
        name="display_payeeAcctCurr"
        value={formData.payeeAcctCurr}
        onChange={(val) => handleChange("payeeAcctCurr", val)}
        options={currencyOptions}
        disabled={isView}
        required
        error={errors.payeeAcctCurr}
        placeholder={t("ph_select_currency", "Select Currency")}
      />
    </div>
  );
}
