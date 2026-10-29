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
import BankAccountFormFields from "./BankAccountFormFields";
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  Landmark,
  Building2,
  CheckCircle2,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

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

  const [copiedId, setCopiedId] = useState(null);

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
      description: `${t(
        "confirm_delete_account_desc",
        "Are you sure you want to delete account ending in",
      )} ${bank.account.slice(-4)}?`,
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

  const copyAccountNumber = (acc, id) => {
    navigator.clipboard.writeText(acc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading && banks.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-16 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="mt-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t("loading", "Loading Bank Accounts...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* ── Row 1: 3 Colorful KPI Overview Cards (Exact /dashboard style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Connected Banks Card (Blue) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Landmark size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("linked_banks", "Linked Banks")}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {t("verified", "Verified")}
            </span>
          </div>

          <div className="relative z-10 mt-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {banks.length} {banks.length === 1 ? t("account", "Account") : t("accounts", "Accounts")}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1.5">
              {t("direct_payout_enabled", "Direct clearing enabled")}
            </p>
          </div>

          {/* Soft SVG Wave */}
          <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
            <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
                fill="url(#blue-grad-settle)"
              />
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
                stroke="#2563eb"
                strokeWidth="1.2"
                fill="none"
              />
              <defs>
                <linearGradient id="blue-grad-settle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 2. Payout Routing Card (Indigo) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("routing_system", "Payout Routing")}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              ACH / RTGS
            </span>
          </div>

          <div className="relative z-10 mt-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("multi_currency_routing", "Multi-Currency")}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1.5">
              {t("instant_routing_desc", "JMD, XCG & USD bank clearing")}
            </p>
          </div>

          {/* Soft SVG Wave */}
          <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
            <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
                fill="url(#indigo-grad-settle)"
              />
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
                stroke="#6366f1"
                strokeWidth="1.2"
                fill="none"
              />
              <defs>
                <linearGradient id="indigo-grad-settle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 3. Settlement Schedule Card (Emerald) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("schedule", "Settlement Schedule")}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {t("automated", "Automated")}
            </span>
          </div>

          <div className="relative z-10 mt-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("daily_eod", "Daily EOD")}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1.5">
              {t("auto_settlement_active", "End-of-day funds transfer to bank")}
            </p>
          </div>

          {/* Soft SVG Wave */}
          <div className="absolute bottom-0 right-0 w-36 h-12 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
            <svg viewBox="0 0 140 45" preserveAspectRatio="none" fill="none" className="w-full h-full">
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12 L 140 45 L 0 45 Z"
                fill="url(#green-grad-settle)"
              />
              <path
                d="M0 45 C 40 45, 60 28, 90 28 C 115 28, 125 15, 140 12"
                stroke="#10b981"
                strokeWidth="1.2"
                fill="none"
              />
              <defs>
                <linearGradient id="green-grad-settle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Row 2: Management Bar with Add Bank Button ────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t("sl_title", "Settlement Bank Accounts")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              "settlement_header_desc",
              "Manage linked beneficiary bank accounts for merchant wallet fund transfers",
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAddClick()}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          <span>
            {t("mba_addAcc", t("add_bank_account", "Add Bank Account"))}
          </span>
        </button>
      </div>

      {/* ── Row 3: Bank Account Cards Grid ────────────────────── */}
      {banks.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-12 text-center flex flex-col items-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Landmark size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">
            {t("no_bank_accounts_title", "No Settlement Accounts Configured")}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
            {t(
              "no_bank_accounts_desc",
              "Connect your commercial business bank account to enable automated daily end-of-day settlements and zero-fee payouts.",
            )}
          </p>
          <button
            type="button"
            onClick={() => handleAddClick()}
            className="flex items-center gap-2 h-10 px-5 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{t("add_first_bank", "Add Bank Account")}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {banks.map((bank, idx) => {
            const currencyLabel = getCurrencyLabel(bank.currency);
            const accountTypeLabel = getAccountTypeLabel(bank.accountType);

            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Top: Bank Avatar, Name & Status Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-blue-500/20">
                        <Landmark size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {bank.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {accountTypeLabel}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">
                            •
                          </span>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {currencyLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 size={11} />
                      <span>{t("active_payout", "Active")}</span>
                    </span>
                  </div>

                  {/* Card Number & EMV Chip Banner */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 my-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Stylized Golden EMV Card Chip */}
                      <div className="w-8 h-6 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-inner flex items-center justify-center shrink-0 border border-amber-500/40 opacity-90">
                        <div className="w-6 h-4 border border-amber-700/30 rounded-xs" />
                      </div>

                      <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200">
                        {bank.account}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyAccountNumber(bank.rawAccount || bank.account, idx)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                      title={t("copy_account", "Copy Account Number")}
                    >
                      {copiedId === idx ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Tags + Action Buttons */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      {currencyLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {accountTypeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleViewClick(bank)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                      title={t("view", "View Details")}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditClick(bank)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                      title={t("edit", "Edit Account")}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bank)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer disabled:opacity-50"
                      title={t("delete", "Delete Account")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
