import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  getUserSetAccounts,
  createUserSetAccount,
  updateUserSetAccount,
  deleteUserSetAccount,
  getBankRoutingByBankId,
} from "@/lib/api/endpoints";
import GlobalButton from "@/components/globals/GlobalButton";
import BankAccountFormFields from "./BankAccountFormFields";
import { Pencil, Trash2, Eye, Plus } from "lucide-react";

export default function SettlementSettingsView() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const {
    openFormDialog,
    openConfirmDialog,
    openDetailDialog,
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
  } = useDialog();

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["userSetAccounts"],
    queryFn: () => getUserSetAccounts(),
  });

  const welcomeData = queryClient.getQueryData(["welcome"]);

  const getBankName = (id) => {
    if (!id) return "N/A";
    const found = welcomeData?.metaData?.SETTLEBANK?.find(
      (b) => String(b.id).trim() === String(id).trim(),
    );
    return found?.title || id;
  };

  const getCurrencyLabel = (id) => {
    if (id === undefined || id === null || id === "") return "N/A";
    const found = welcomeData?.metaData?.CURRENCY?.find(
      (c) => String(c.id).trim() === String(id).trim(),
    );
    return found?.title || id;
  };

  const getAccountTypeLabel = (id) => {
    if (id === undefined || id === null || id === "") return "N/A";
    const found = welcomeData?.metaData?.ACCOUNTTYPE?.find(
      (a) => String(a.id).trim() === String(id).trim(),
    );
    return found?.title || id;
  };

  const [banks, setBanks] = useState([]);

  useEffect(() => {
    if (accountsData?.records) {
      const formattedBanks = accountsData.records.map((record, index) => ({
        id: index,
        name: getBankName(record.bankId),
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
  }, [accountsData, welcomeData]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => createUserSetAccount(payload),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => updateUserSetAccount(payload),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (payload) => deleteUserSetAccount(payload),
  });

  const getDetailsObj = (values) => ({
    [t("bank_name", "Bank Name")]:
      values.bankNameLabel || getBankName(values.bankName),
    [t("account_number", "Account No")]: values.accountNumber,
    [t("currency", "Currency")]:
      values.currencyLabel || getCurrencyLabel(values.currency),
    [t("account_type", "Account Type")]:
      values.accountTypeLabel || getAccountTypeLabel(values.accountType),
  });

  const validateBankAccount = (values) => {
    const newErrors = {};
    if (!values.bankName) {
      newErrors.bankName = t("err_bank_name_required", "Bank Name is required");
    }

    if (!values.accountNumber) {
      newErrors.accountNumber = t(
        "err_account_number_required",
        "Account Number is required",
      );
    } else {
      if (/^0/.test(values.accountNumber)) {
        newErrors.accountNumber = t(
          "err_account_number_zero",
          "Account number cannot start with zero",
        );
      } else if (values.accountNumber.length < 8) {
        newErrors.accountNumber = t(
          "err_account_number_min",
          "Account number must be at least 8 digits",
        );
      }
    }

    if (!values.currency) {
      newErrors.currency = t("err_currency_required", "Currency is required");
    }
    if (!values.accountType) {
      newErrors.accountType = t(
        "err_account_type_required",
        "Account Type is required",
      );
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleAddClick = (initialValues = {}) => {
    const currentValues = {
      bankName: initialValues.bankName || "",
      accountNumber: initialValues.accountNumber || "",
      currency: initialValues.currency || "0",
      accountType: initialValues.accountType || "6",
    };

    openFormDialog({
      title: t("mba_addAcc", t("add_bank_account", "Add Bank Account")),
      size: "sm:max-w-xl",
      submitText: t("buttonSubmit", t("submit", "Submit")),
      disableAutoValidation: true,
      content: <BankAccountFormFields data={currentValues} />,
      onSave: (values, setFormErrors) => {
        const { isValid, errors } = validateBankAccount(values);
        if (!isValid) {
          setFormErrors(errors);
          return false;
        }

        openPreconfirmDialog({
          title: t("confirm_details", "Confirm Details"),
          details: getDetailsObj(values),
          onChange: () => {
            handleAddClick(values);
          },
          onSubmit: async () => {
            let routing = values.bankRouting || "";
            if (!routing) {
              try {
                const routingRes = await getBankRoutingByBankId({
                  payeeBankId: values.bankName,
                  bankId: values.bankName,
                });
                routing =
                  routingRes?.bankRouting ||
                  routingRes?.data?.bankRouting ||
                  "";
              } catch (e) {
                console.warn("Failed to fetch routing", e);
              }
            }

            createMutation.mutate(
              {
                bankId: values.bankName,
                bankRouting: routing,
                bankAccount: values.accountNumber,
                bankAcctCurr: values.currency,
                bankAcctType: values.accountType,
              },
              {
                onSuccess: (data) => {
                  if (data.status === "success") {
                    queryClient.invalidateQueries({
                      queryKey: ["userSetAccounts"],
                    });
                    openSuccessDialog({
                      title: t("success", "Success"),
                      message:
                        data.message ||
                        t(
                          "bank_account_created_success",
                          "Bank Account Successfully Created",
                        ),
                      details: getDetailsObj(values),
                    });
                  } else {
                    openGlobalPopup({
                      title: t("error", "Error"),
                      description:
                        data.message || "Failed to add bank account.",
                      type: "error",
                      onClose: () => {
                        handleAddClick(values);
                      },
                    });
                  }
                },
                onError: (err) => {
                  openGlobalPopup({
                    title: t("error", "Error"),
                    description:
                      err?.response?.data?.message ||
                      err?.message ||
                      t(
                        "something_went_wrong_try_again",
                        "Something went wrong.",
                      ),
                    type: "error",
                    onClose: () => {
                      handleAddClick(values);
                    },
                  });
                },
              },
            );
          },
        });

        return false;
      },
    });
  };

  const handleEditClick = (bank, currentFormValues = null) => {
    const currentValues = currentFormValues || {
      bankName: bank.bic,
      bankRouting: bank.routing,
      accountNumber: bank.rawAccount,
      currency: bank.currency,
      accountType: bank.accountType,
    };

    openFormDialog({
      title: t(
        "edit.beneficiary",
        t("edit_bank_account", "Edit Bank Account"),
      ),
      size: "sm:max-w-xl",
      submitText: t("buttonSubmit", t("submit", "Submit")),
      disableAutoValidation: true,
      content: <BankAccountFormFields data={currentValues} />,
      onSave: (values, setFormErrors) => {
        const { isValid, errors } = validateBankAccount(values);
        if (!isValid) {
          setFormErrors(errors);
          return false;
        }

        openPreconfirmDialog({
          title: t("confirm_details", "Confirm Details"),
          details: getDetailsObj(values),
          onChange: () => {
            handleEditClick(bank, values);
          },
          onSubmit: async () => {
            let routing = values.bankRouting || bank.routing || "";
            if (!routing || bank.bic !== values.bankName) {
              try {
                const routingRes = await getBankRoutingByBankId({
                  payeeBankId: values.bankName,
                  bankId: values.bankName,
                });
                routing =
                  routingRes?.bankRouting ||
                  routingRes?.data?.bankRouting ||
                  routing;
              } catch (e) {
                console.warn("Failed to fetch routing", e);
              }
            }

            updateMutation.mutate(
              {
                bankId: values.bankName,
                bankRouting: routing,
                bankAccount: bank.rawAccount,
                bankAcctCurr: values.currency,
                bankAcctType: values.accountType,
                bankAccountUpd: values.accountNumber,
              },
              {
                onSuccess: (data) => {
                  if (data.status === "success") {
                    queryClient.invalidateQueries({
                      queryKey: ["userSetAccounts"],
                    });
                    openSuccessDialog({
                      title: t("success", "Success"),
                      message:
                        data.message ||
                        t(
                          "bank_account_updated_success",
                          "Bank Account Details Successfully Updated",
                        ),
                      details: getDetailsObj(values),
                    });
                  } else {
                    openGlobalPopup({
                      title: t("error", "Error"),
                      description:
                        data.message || "Failed to update bank account.",
                      type: "error",
                      onClose: () => {
                        handleEditClick(bank, values);
                      },
                    });
                  }
                },
                onError: (err) => {
                  openGlobalPopup({
                    title: t("error", "Error"),
                    description:
                      err?.response?.data?.message ||
                      err?.message ||
                      t(
                        "something_went_wrong_try_again",
                        "Something went wrong.",
                      ),
                    type: "error",
                    onClose: () => {
                      handleEditClick(bank, values);
                    },
                  });
                },
              },
            );
          },
        });

        return false;
      },
    });
  };

  const handleViewClick = (bank) => {
    openDetailDialog({
      title: t("view_bank_account", "View Bank Account"),
      details: [
        {
          label: t("bank_name", "Bank Name"),
          value: bank.name || getBankName(bank.bic),
        },
        {
          label: t("account_number", "Account Number"),
          value: bank.rawAccount || bank.account,
        },
        {
          label: t("currency", "Currency"),
          value: getCurrencyLabel(bank.currency),
        },
        {
          label: t("account_type", "Account Type"),
          value: getAccountTypeLabel(bank.accountType),
        },
      ],
      doneText: t("buttonsClose", t("close", "Close")),
    });
  };

  const handleDelete = (bank) => {
    openConfirmDialog({
      title: t("confirm_delete", "Confirm Delete"),
      description: `${t("confirm_delete_account_desc", "Are you sure you want to delete account ending in")} ${bank.account.slice(-4)}?`,
      confirmText: t("delete", "Delete"),
      cancelText: t("buttonCancel", t("cancel", "Cancel")),
      iconType: "danger",
      onConfirm: async () => {
        try {
          const res = await deleteMutation.mutateAsync({
            bankAccount: bank.rawAccount,
          });
          if (
            res?.status === "success" ||
            res?.statusCode === 0 ||
            res?.statusCode === "0"
          ) {
            queryClient.invalidateQueries({ queryKey: ["userSetAccounts"] });
            openSuccessDialog({
              title: t("deleted", "Deleted"),
              message:
                res?.message ||
                t(
                  "settlement_deleted_success",
                  "Settlement account deleted successfully.",
                ),
            });
          } else {
            openGlobalPopup({
              title: t("error", "Error"),
              description: res?.message || "Failed to delete bank account.",
              type: "error",
            });
          }
        } catch (err) {
          openGlobalPopup({
            title: t("error", "Error"),
            description:
              err?.response?.data?.message ||
              err?.message ||
              t("something_went_wrong_try_again", "Something went wrong."),
            type: "error",
          });
        }
        return false;
      },
    });
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
              {banks.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    {t("no_bank_accounts", "No bank accounts found.")}
                  </td>
                </tr>
              ) : (
                banks.map((bank, idx) => (
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
                          onClick={() => handleViewClick(bank)}
                          className="text-slate-400 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                          title={t("view", "View")}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(bank)}
                          className="text-slate-400 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                          title={t("edit", "Edit")}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bank)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          disabled={deleteMutation.isPending}
                          title={t("delete", "Delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <GlobalButton
            onClick={() => handleAddClick()}
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
