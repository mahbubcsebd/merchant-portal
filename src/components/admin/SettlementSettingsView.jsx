import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  getUserSetAccounts,
  createUserSetAccount,
  updateUserSetAccount,
  deleteUserSetAccount,
} from "@/lib/api/endpoints";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { Pencil, Trash2, Plus } from "lucide-react";

export const bankNamesMap = {
  ALSDCWC1: "ACU Credit Union",
  BDCCCWCU: "BDC Curacao NV",
  CBCSCWCU: "CBCS Curacao",
  MCBKCWCU: "Maduro & Curiel's Bank",
  ORBACWCU: "ORCO Bank Curacao",
  PBBPCWC1: "PSB Bank NV Curacao",
  RBTTCWCU: "RBC Bank Curacao",
  CITCCWCC: "Vidanova Bank",
  HGHYS85DHT1: "HGHYS85DHT1",
};

export const currencyMap = {
  0: "XCG",
  1: "USD",
  2: "CAD",
  3: "EUR",
  4: "GBP",
  22: "BZD",
  23: "XCD",
  125: "PHP",
  388: "JMD",
  971: "DDT",
};

export const accountTypeMap = {
  6: "Checking",
  1: "Savings",
};

export default function SettlementSettingsView() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openSuccessDialog } = useDialog();

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["userSetAccounts"],
    queryFn: () => getUserSetAccounts(),
  });

  const [view, setView] = useState("list"); // 'list', 'form', 'confirm', 'success'
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    currency: "0",
    accountType: "6",
  });
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const [banks, setBanks] = useState([]);

  useEffect(() => {
    if (accountsData?.records) {
      const formattedBanks = accountsData.records.map((record, index) => ({
        id: index,
        name: bankNamesMap[record.bankId] || record.bankId || "Bank Account",
        account: record.bankAccount
          ? `**** ${record.bankAccount.slice(-4)}`
          : "****",
        rawAccount: record.bankAccount || "",
        bic: record.bankId || "",
        routing: record.bankRouting || null,
        currency: record.bankAcctCurr || "0",
        accountType: record.bankAcctType || "6",
      }));
      setBanks(formattedBanks);
    }
  }, [accountsData]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => createUserSetAccount(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["userSetAccounts"] });
        setView("success");
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to add bank account.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description:
          err?.response?.data?.message ||
          t("something_went_wrong_try_again", "Something went wrong."),
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => updateUserSetAccount(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["userSetAccounts"] });
        setView("success");
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to update bank account.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description:
          err?.response?.data?.message ||
          t("something_went_wrong_try_again", "Something went wrong."),
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (payload) => deleteUserSetAccount(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["userSetAccounts"] });
        openSuccessDialog({
          title: t("deleted", "Deleted"),
          message: data.message || "Settlement account deleted successfully.",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to delete bank account.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description:
          err?.response?.data?.message ||
          t("something_went_wrong_try_again", "Something went wrong."),
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleEdit = (bank, idx) => {
    setFormData({
      bankName: bank.bic,
      accountNumber: bank.rawAccount,
      currency: bank.currency,
      accountType: bank.accountType,
    });
    setEditIndex(idx);
    setErrors({});
    setView("form");
  };

  const handleAdd = () => {
    setFormData({
      bankName: "",
      accountNumber: "",
      currency: "0",
      accountType: "6",
    });
    setEditIndex(null);
    setErrors({});
    setView("form");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "accountNumber") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 12) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDelete = (bank) => {
    openConfirmDialog({
      title: t("confirm_delete", "Confirm Delete"),
      description: `${t("confirm_delete_account_desc", "Are you sure you want to delete account ending in")} ${bank.account.slice(-4)}?`,
      confirmText: t("delete", "Delete"),
      cancelText: t("buttonCancel", t("cancel", "Cancel")),
      iconType: "danger",
      onConfirm: async () => {
        await deleteMutation.mutateAsync({ bankAccount: bank.rawAccount });
      },
    });
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.bankName)
      newErrors.bankName = t("err_bank_name_required", "Bank Name is required");

    if (!formData.accountNumber) {
      newErrors.accountNumber = t(
        "err_account_number_required",
        "Account Number is required",
      );
    } else {
      if (/^0/.test(formData.accountNumber)) {
        newErrors.accountNumber = t(
          "err_account_number_zero",
          "Account number cannot start with zero",
        );
      } else if (formData.accountNumber.length < 8) {
        newErrors.accountNumber = t(
          "err_account_number_min",
          "Account number must be at least 8 digits",
        );
      }
    }

    if (!formData.currency)
      newErrors.currency = t("err_currency_required", "Currency is required");
    if (!formData.accountType)
      newErrors.accountType = t(
        "err_account_type_required",
        "Account Type is required",
      );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setView("confirm");
    }
  };

  const handleConfirm = () => {
    if (editIndex !== null) {
      const originalBank = banks[editIndex];
      updateMutation.mutate({
        bankId: formData.bankName,
        bankRouting: null,
        bankAccount: originalBank.rawAccount,
        bankAcctCurr: formData.currency,
        bankAcctType: formData.accountType,
        bankAccountUpd: formData.accountNumber,
      });
    } else {
      createMutation.mutate({
        bankId: formData.bankName,
        bankRouting: null,
        bankAccount: formData.accountNumber,
        bankAcctCurr: formData.currency,
        bankAcctType: formData.accountType,
      });
    }
  };

  if (isLoading && banks.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("loading", "Loading Bank Accounts...")}
          </p>
        </div>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 max-w-xl mx-auto w-full">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            {editIndex !== null
              ? t(
                  "edit.beneficiary",
                  t("edit_bank_account", "Edit Bank Account"),
                )
              : t("mba_addAcc", t("add_bank_account", "Add Bank Account"))}
          </h2>

          <div className="flex flex-col gap-5">
            <GlobalSelect
              label={t(
                "transfers.bankName",
                t("mba_bank", t("bank_name", "Bank Name")),
              )}
              required
              value={formData.bankName}
              onChange={(val) => handleSelectChange("bankName", val)}
              error={errors.bankName}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "ALSDCWC1", label: "ACU Credit Union" },
                { value: "BDCCCWCU", label: "BDC Curacao NV" },
                { value: "CBCSCWCU", label: "CBCS Curacao" },
                { value: "MCBKCWCU", label: "Maduro & Curiel's Bank" },
                { value: "ORBACWCU", label: "ORCO Bank Curacao" },
                { value: "PBBPCWC1", label: "PSB Bank NV Curacao" },
                { value: "RBTTCWCU", label: "RBC Bank Curacao" },
                { value: "CITCCWCC", label: "Vidanova Bank" },
              ]}
            />

            <GlobalInput
              label={t("mba_accountNo", t("account_number", "Account Number"))}
              required
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            />

            <GlobalSelect
              label={t("mba_currency", t("currency", "Currency"))}
              required
              value={formData.currency}
              onChange={(val) => handleSelectChange("currency", val)}
              error={errors.currency}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "22", label: "BZD" },
                { value: "2", label: "CAD" },
                { value: "971", label: "DDT" },
                { value: "3", label: "EUR" },
                { value: "4", label: "GBP" },
                { value: "388", label: "JMD" },
                { value: "125", label: "PHP" },
                { value: "1", label: "USD" },
                { value: "23", label: "XCD" },
                { value: "0", label: "XCG" },
              ]}
            />

            <GlobalSelect
              label={t("mba_accountType", t("account_type", "Account Type"))}
              required
              value={formData.accountType}
              onChange={(val) => handleSelectChange("accountType", val)}
              error={errors.accountType}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "6", label: "Checking" },
                { value: "1", label: "Savings" },
              ]}
            />
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <GlobalButton
              onClick={() => setView("list")}
              variant="secondary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              {t("buttonCancel", t("cancel", "Cancel"))}
            </GlobalButton>
            <GlobalButton
              onClick={handleSubmit}
              variant="primary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              {t("buttonSubmit", t("submit", "Submit"))}
            </GlobalButton>
          </div>
        </div>
      </div>
    );
  }

  if (view === "confirm") {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 max-w-xl mx-auto w-full text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {t("confirm_details", "Confirm Details")}
          </h2>

          <div className="flex flex-col gap-0 text-sm">
            <div className="flex items-center py-3 px-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-t-lg border-b border-white/40 dark:border-white/5">
              <span className="w-1/3 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("bank_name", "Bank Name")}
              </span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">
                {bankNamesMap[formData.bankName] || formData.bankName}
              </span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c] border-b border-slate-100 dark:border-white/5">
              <span className="w-1/3 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("account_number", "Account No")}
              </span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">
                {formData.accountNumber}
              </span>
            </div>
            <div className="flex items-center py-3 px-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-white/40 dark:border-white/5">
              <span className="w-1/3 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("currency", "Currency")}
              </span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">
                {currencyMap[formData.currency] || formData.currency}
              </span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c] rounded-b-lg">
              <span className="w-1/3 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("account_type", "Account Type")}
              </span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">
                {accountTypeMap[formData.accountType] || formData.accountType}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <GlobalButton
              onClick={() => setView("form")}
              variant="secondary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {t("buttonChange", t("change", "Change"))}
            </GlobalButton>
            <GlobalButton
              onClick={handleConfirm}
              variant="primary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {t("buttonConfirm", t("confirm", "Confirm"))}
            </GlobalButton>
          </div>
        </div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 pb-12 max-w-xl mx-auto w-full text-center relative mt-12">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#1b55ad] rounded-full border-4 border-white dark:border-[#131c31] flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-12 mb-6">
            {t(
              "bank_account_updated_success",
              "Bank Account Details Successfully Updated",
            )}
          </h2>

          <div className="flex flex-col gap-0 text-sm max-w-md mx-auto">
            <div className="flex items-center py-2.5 px-4 bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("bank_name", "Bank Name")}
              </span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">
                {bankNamesMap[formData.bankName] || formData.bankName}
              </span>
            </div>
            <div className="flex items-center py-2.5 px-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("account_number", "Account No")}
              </span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">
                {formData.accountNumber}
              </span>
            </div>
            <div className="flex items-center py-2.5 px-4 bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("currency", "Currency")}
              </span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">
                {currencyMap[formData.currency] || formData.currency}
              </span>
            </div>
            <div className="flex items-center py-2.5 px-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-b-lg">
              <span className="w-1/2 text-[#1b55ad] dark:text-blue-400 font-semibold text-right pr-6">
                {t("account_type", "Account Type")}
              </span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">
                {accountTypeMap[formData.accountType] || formData.accountType}
              </span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <GlobalButton
              onClick={() => setView("list")}
              variant="primary"
              className="px-8 text-xs font-bold uppercase tracking-wider"
            >
              {t("done", "Done")}
            </GlobalButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 dark:text-white/70 uppercase border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-bold">
                  {t(
                    "transfers.bankName",
                    t("mba_bank", t("bank_name", "Bank Name")),
                  )}
                </th>
                <th className="px-4 py-3 font-bold">
                  {t("mba_accountNo", t("account_number", "Account Number"))}
                </th>
                <th className="px-4 py-3 font-bold text-right">
                  {t("teAction", t("myqr_action", t("action", "Action")))}
                </th>
              </tr>
            </thead>
            <tbody>
              {banks.map((bank, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : ""} border-b border-slate-100 dark:border-white/5 last:border-0`}
                >
                  <td className="px-4 py-4 font-semibold text-slate-800 dark:text-white/90">
                    {bank.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-white/70">
                    {bank.account}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(bank, idx)}
                        className="text-slate-400 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(bank)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <GlobalButton
            onClick={handleAdd}
            variant="primary"
            leftIcon={<Plus size={18} />}
            className="px-6 text-xs font-bold uppercase tracking-wider"
          >
            {t("mba_addAcc", t("add_bank_account", "Add Bank Account"))}
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
