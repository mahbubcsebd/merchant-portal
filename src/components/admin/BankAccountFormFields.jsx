import React, { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getBankRoutingByBankId } from "@/lib/api/endpoints";

export default function BankAccountFormFields({
  data = {},
  isView = false,
  errors = {},
  clearError = () => {},
}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const bankOptions = useMemo(() => {
    const list = welcomeData?.metaData?.SETTLEBANK;
    if (Array.isArray(list)) {
      return list.map((b) => ({
        value: String(b.id),
        label: b.title || b.name || String(b.id),
      }));
    }
    return [];
  }, [welcomeData]);

  const currencyOptions = useMemo(() => {
    const list = welcomeData?.metaData?.CURRENCY;
    if (Array.isArray(list)) {
      return list.map((c) => ({
        value: String(c.id),
        label: c.title || c.name || String(c.id),
      }));
    }
    return [];
  }, [welcomeData]);

  const accountTypeOptions = useMemo(() => {
    const list = welcomeData?.metaData?.ACCOUNTTYPE;
    if (Array.isArray(list)) {
      return list.map((a) => ({
        value: String(a.id),
        label: a.title || a.name || String(a.id),
      }));
    }
    return [];
  }, [welcomeData]);

  const [bankName, setBankName] = useState(data.bankName || "");
  const [bankRouting, setBankRouting] = useState(data.bankRouting || "");
  const [accountNumber, setAccountNumber] = useState(data.accountNumber || "");
  const [currency, setCurrency] = useState(
    data.currency ||
      currencyOptions.find((c) => c.value === "0" || c.label === "XCG")?.value ||
      currencyOptions[0]?.value ||
      "",
  );
  const [accountType, setAccountType] = useState(
    data.accountType ||
      accountTypeOptions.find((a) => a.value === "6")?.value ||
      accountTypeOptions[0]?.value ||
      "",
  );

  useEffect(() => {
    if (bankName) {
      getBankRoutingByBankId({ payeeBankId: bankName, bankId: bankName })
        .then((res) => {
          const routing = res?.bankRouting || res?.data?.bankRouting || "";
          if (routing) setBankRouting(routing);
        })
        .catch((err) => {
          console.warn("Failed to fetch bank routing:", err);
        });
    }
  }, [bankName]);

  const handleAccountChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 12) {
      setAccountNumber(numericValue);
      if (clearError) clearError("accountNumber");
    }
  };

  const handleBankChange = (val) => {
    setBankName(val);
    if (clearError) clearError("bankName");
  };

  const handleCurrencyChange = (val) => {
    setCurrency(val);
    if (clearError) clearError("currency");
  };

  const handleTypeChange = (val) => {
    setAccountType(val);
    if (clearError) clearError("accountType");
  };

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="bankRouting" value={bankRouting} />

      <GlobalSelect
        name="bankName"
        label={t(
          "transfers.bankName",
          t("mba_bank", t("bank_name", "Bank Name")),
        )}
        required
        disabled={isView}
        value={bankName}
        onChange={handleBankChange}
        error={errors.bankName}
        labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
        options={bankOptions}
      />

      <GlobalInput
        name="accountNumber"
        label={t("mba_accountNo", t("account_number", "Account Number"))}
        required
        disabled={isView}
        type="text"
        value={accountNumber}
        onChange={handleAccountChange}
        error={errors.accountNumber}
        labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
      />

      <GlobalSelect
        name="currency"
        label={t("mba_currency", t("currency", "Currency"))}
        required
        disabled={isView}
        value={currency}
        onChange={handleCurrencyChange}
        error={errors.currency}
        labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
        options={currencyOptions}
      />

      <GlobalSelect
        name="accountType"
        label={t("mba_accountType", t("account_type", "Account Type"))}
        required
        disabled={isView}
        value={accountType}
        onChange={handleTypeChange}
        error={errors.accountType}
        labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
        options={accountTypeOptions}
      />
    </div>
  );
}
