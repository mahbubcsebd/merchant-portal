import { useState, useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"
import { useDashboardContext } from "@/pages/dashboard/context"
import { useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useDialog } from "@/components/globals/DialogProvider"
import { useLanguage } from "@/components/globals/LanguageProvider"
import { 
  getTransactionLimits, 
  getUserSetAccounts, 
  createUserSetAccount, 
  updateUserSetAccount, 
  deleteUserSetAccount,
  loadAlertNotificationSetting,
  updateAlertNotification,
  updateLanguage,
  changePIN
} from "@/lib/api/endpoints"
import { 
  QrCode, 
  Wallet, 
  Building2, 
  Bell, 
  Languages, 
  KeyRound,
  Download,
  Pencil,
  Trash2,
  Plus
} from "lucide-react"

import GlobalInput from "@/components/globals/GlobalInput"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"

// ----------------------------------------------------------------------
// Sub-components for different views
// ----------------------------------------------------------------------

function MyQrView() {
  const { t } = useLanguage();
  const { profile } = useDashboardContext();
  const p = profile || {};
  const qrList = p.qrcode || [];

  // Populate options from profile qrcode list
  const qrOptions = qrList.map((q) => ({
    value: q.currency,
    label: `${q.currency} Wallet QR`,
  }));

  const [selectedCurrency, setSelectedCurrency] = useState("");

  // Initialize selected currency
  useEffect(() => {
    if (qrOptions.length > 0 && !selectedCurrency) {
      setSelectedCurrency(qrOptions[0].value);
    }
  }, [qrOptions, selectedCurrency]);

  const selectedQr = qrList.find((q) => q.currency === selectedCurrency);
  // If we have a qrcode string from the profile, use it; otherwise fallback
  const qrValue = selectedQr?.qrcode || (p.custName ? `${p.custName}#${p.userName}` : "mPay");

  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  useEffect(() => {
    if (!qrValue) return;

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 220,
        height: 220,
        data: qrValue,
        margin: 0,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "Q",
        },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
        dotsOptions: { type: "extra-rounded", color: "#000" },
        backgroundOptions: { color: "#ffffff" },
        image: "/images/logo.svg",
      });
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
        qrCodeInstance.current.append(qrRef.current);
      }
    } else {
      qrCodeInstance.current.update({ data: qrValue });
    }
  }, [qrValue]);

  const handleDownloadQR = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({ 
        name: `store-qr-${selectedCurrency || "wallet"}`, 
        extension: "png" 
      });
    }
  };

  const btnText = (t("buttonsDownloadQR", t("download_qr", "QR DOWNLOADEN"))).toUpperCase();

  return (
    <div className="w-full min-h-[480px] flex flex-col items-center justify-center p-8 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
      
      {/* Merchant Details */}
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {p.custName || p.FIRSTNAME || "Merchant Store"}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          {p.userName ? `@${p.userName}` : ""}
        </p>
      </div>

      {/* Currency Select */}
      {qrOptions.length > 1 && (
        <div className="w-full max-w-[260px] mb-6">
          <GlobalSelect
            value={selectedCurrency}
            onChange={(val) => setSelectedCurrency(val)}
            options={qrOptions}
            placeholder={t("selectCurrency", "Select Currency")}
          />
        </div>
      )}

      {/* QR Code White Box */}
      <div className="relative mb-6 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center w-[250px] h-[250px]">
        <div ref={qrRef} className="w-[220px] h-[220px] flex items-center justify-center" />
      </div>

      {/* Download Button */}
      <button 
        type="button"
        className="px-6 py-2.5 bg-[#1b55ad] hover:bg-[#184994] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        onClick={handleDownloadQR}
        disabled={!qrValue}
      >
        {btnText}
      </button>

    </div>
  )
}

function PaymentLimitsView() {
  const { t } = useLanguage();
  const { data: limitsData, isLoading } = useQuery({
    queryKey: ["transactionLimits"],
    queryFn: () => getTransactionLimits(),
  });

  const limitsList = limitsData?.txnLimitUsers || [];

  // Extract unique currency names
  const currencies = Array.from(new Set(limitsList.map((item) => item.CURRNAME))).filter(Boolean);
  const currencyOptions = [
    { value: "all", label: t("all_currencies", "All Currencies") },
    ...currencies.map((curr) => ({
      value: curr,
      label: `${curr} ${t("limits", "Limits")}`,
    })),
  ];

  const [selectedCurrency, setSelectedCurrency] = useState("all");

  if (isLoading && limitsList.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  // Filter limits based on selected currency
  const filteredLimits = selectedCurrency === "all"
    ? limitsList
    : limitsList.filter((item) => item.CURRNAME === selectedCurrency);

  // Map limits into columns
  const mapCard = (item, limitType) => {
    let max = 0;
    let used = 0;
    let remaining = 0;

    if (limitType === "daily") {
      max = parseFloat(item.USERTXNDAILYLIMIT || 0);
      used = parseFloat(item.USERTXNDAILYUSED || 0);
      remaining = parseFloat(item.USERTXNDAILYREMAIN || 0);
    } else if (limitType === "monthly") {
      max = parseFloat(item.USERTXNMONTHLYLIMIT || 0);
      used = parseFloat(item.USERTXNMONTHLYUSED || 0);
      remaining = parseFloat(item.USERTXNMONTHLYREMAIN || 0);
    } else if (limitType === "annual") {
      max = parseFloat(item.USERTXNANNUALLIMIT || 0);
      used = parseFloat(item.USERTXNANNUALUSED || 0);
      remaining = parseFloat(item.USERTXNANNUALREMAIN || 0);
    }

    return {
      title: item.TXNNAME || item.TXNID,
      remaining,
      used,
      max,
      currency: item.CURRNAME || "XCG",
    };
  };

  const columns = [
    {
      title: t("dailyLimit", t("daily_limits", "Daily Limits")),
      cards: filteredLimits.map((item) => mapCard(item, "daily")),
    },
    {
      title: t("MonthlyLimit", t("monthly_limits", "Monthly Limit")),
      cards: filteredLimits.map((item) => mapCard(item, "monthly")),
    },
    {
      title: t("annualLimit", t("annual_limits", "Annual Limit")),
      cards: filteredLimits.map((item) => mapCard(item, "annual")),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {currencyOptions.length > 1 && (
        <div className="flex justify-end">
          <div className="w-full sm:w-48 shrink-0">
            <GlobalSelect
              value={selectedCurrency}
              onChange={(val) => setSelectedCurrency(val)}
              options={currencyOptions}
              placeholder={t("selectCurrency", "Select Currency")}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">{col.title}</h3>
            {col.cards.length === 0 ? (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 p-4 text-center">
                {t("no_limits_configured", "No limits configured")}
              </p>
            ) : (
              col.cards.map((card, cardIdx) => {
                const progressPercentage = card.max > 0 ? (card.used / card.max) * 100 : 0;
                return (
                  <div key={cardIdx} className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{card.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2">{t("limit_max", "Maximum Balance allowed on")} {card.title}</p>
                    
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">
                      {card.currency} {card.remaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {t("remaining", "Remaining")}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-white/50">
                      {card.currency} {card.used.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {t("used", "used")} (max: {card.currency} {card.max.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                    </p>
                  </div>
                )
              })
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const bankNamesMap = {
  "ALSDCWC1": "ACU Credit Union",
  "BDCCCWCU": "BDC Curacao NV",
  "CBCSCWCU": "CBCS Curacao",
  "MCBKCWCU": "Maduro & Curiel's Bank",
  "ORBACWCU": "ORCO Bank Curacao",
  "PBBPCWC1": "PSB Bank NV Curacao",
  "RBTTCWCU": "RBC Bank Curacao",
  "CITCCWCC": "Vidanova Bank",
  "HGHYS85DHT1": "HGHYS85DHT1"
};

const currencyMap = {
  "0": "XCG",
  "1": "USD",
  "2": "CAD",
  "3": "EUR",
  "4": "GBP",
  "22": "BZD",
  "23": "XCD",
  "125": "PHP",
  "388": "JMD",
  "971": "DDT"
};

const accountTypeMap = {
  "6": "Checking",
  "1": "Savings"
};

function SettlementSettingsView() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openSuccessDialog } = useDialog();

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["userSetAccounts"],
    queryFn: () => getUserSetAccounts(),
  });

  const [view, setView] = useState('list'); // 'list', 'form', 'confirm', 'success'
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    currency: '0',
    accountType: '6'
  });
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const [banks, setBanks] = useState([]);

  useEffect(() => {
    if (accountsData?.records) {
      const formattedBanks = accountsData.records.map((record, index) => ({
        id: index,
        name: bankNamesMap[record.bankId] || record.bankId || "Bank Account",
        account: record.bankAccount ? `**** ${record.bankAccount.slice(-4)}` : "****",
        rawAccount: record.bankAccount || "",
        bic: record.bankId || "",
        routing: record.bankRouting || null,
        currency: record.bankAcctCurr || "0",
        accountType: record.bankAcctType || "6"
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
        setView('success');
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to add bank account.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description: err?.response?.data?.message || "Something went wrong.",
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true
      });
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => updateUserSetAccount(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["userSetAccounts"] });
        setView('success');
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to update bank account.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description: err?.response?.data?.message || "Something went wrong.",
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true
      });
    }
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
          hideCancel: true
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description: err?.response?.data?.message || "Something went wrong.",
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true
      });
    }
  });

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEdit = (bank, idx) => {
    setFormData({
      bankName: bank.bic,
      accountNumber: bank.rawAccount,
      currency: bank.currency,
      accountType: bank.accountType
    });
    setEditIndex(idx);
    setErrors({});
    setView('form');
  };

  const handleAdd = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      currency: '0',
      accountType: '6'
    });
    setEditIndex(null);
    setErrors({});
    setView('form');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'accountNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
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
      description: `Are you sure you want to delete account ending in ${bank.account.slice(-4)}?`,
      confirmText: t("delete", "Delete"),
      cancelText: t("buttonCancel", t("cancel", "Cancel")),
      iconType: "danger",
      onConfirm: async () => {
        await deleteMutation.mutateAsync({ bankAccount: bank.rawAccount });
      }
    });
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";
    
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account Number is required";
    } else {
      if (/^0/.test(formData.accountNumber)) {
        newErrors.accountNumber = "Account number cannot start with zero";
      } else if (formData.accountNumber.length < 8) {
        newErrors.accountNumber = "Account number must be at least 8 digits";
      }
    }

    if (!formData.currency) newErrors.currency = "Currency is required";
    if (!formData.accountType) newErrors.accountType = "Account Type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setView('confirm');
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
        bankAccountUpd: formData.accountNumber
      });
    } else {
      createMutation.mutate({
        bankId: formData.bankName,
        bankRouting: null,
        bankAccount: formData.accountNumber,
        bankAcctCurr: formData.currency,
        bankAcctType: formData.accountType
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

  if (view === 'form') {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 max-w-xl mx-auto w-full">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            {editIndex !== null ? t("edit.beneficiary", t("edit_bank_account", "Edit Bank Account")) : t("mba_addAcc", t("add_bank_account", "Add Bank Account"))}
          </h2>
          
          <div className="flex flex-col gap-5">
            <GlobalSelect
              label={t("transfers.bankName", t("mba_bank", t("bank_name", "Bank Name")))}
              required
              value={formData.bankName}
              onChange={(val) => handleSelectChange('bankName', val)}
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
                { value: "CITCCWCC", label: "Vidanova Bank" }
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
              onChange={(val) => handleSelectChange('currency', val)}
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
                { value: "0", label: "XCG" }
              ]}
            />

            <GlobalSelect
              label={t("mba_accountType", t("account_type", "Account Type"))}
              required
              value={formData.accountType}
              onChange={(val) => handleSelectChange('accountType', val)}
              error={errors.accountType}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "6", label: "Checking" },
                { value: "1", label: "Savings" }
              ]}
            />
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <GlobalButton 
              onClick={() => setView('list')} 
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

  if (view === 'confirm') {
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
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">{formData.accountNumber}</span>
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
              onClick={() => setView('form')} 
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

  if (view === 'success') {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 pb-12 max-w-xl mx-auto w-full text-center relative mt-12">
          
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#1b55ad] rounded-full border-4 border-white dark:border-[#131c31] flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-12 mb-6">
            {t("bank_account_updated_success", "Bank Account Details Successfully Updated")}
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
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">{formData.accountNumber}</span>
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
              onClick={() => setView('list')} 
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
                <th className="px-4 py-3 font-bold">{t("transfers.bankName", t("mba_bank", t("bank_name", "Bank Name")))}</th>
                <th className="px-4 py-3 font-bold">{t("mba_accountNo", t("account_number", "Account Number"))}</th>
                <th className="px-4 py-3 font-bold text-right">{t("teAction", t("myqr_action", t("action", "Action")))}</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((bank, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} border-b border-slate-100 dark:border-white/5 last:border-0`}>
                  <td className="px-4 py-4 font-semibold text-slate-800 dark:text-white/90">{bank.name}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-white/70">{bank.account}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handleEdit(bank, idx)} className="text-slate-400 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(bank)} className="text-slate-400 hover:text-red-500 transition-colors" disabled={deleteMutation.isPending}>
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
  )
}

function ManageNotificationsView() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openSuccessDialog } = useDialog();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["alertNotificationSetting"],
    queryFn: () => loadAlertNotificationSetting(),
  });

  const [notifications, setNotifications] = useState({
    sms: false,
    email: false,
    whatsapp: false,
  });

  // Populate state when settings are loaded
  useEffect(() => {
    if (settingsData?.alertNotiFlag) {
      setNotifications({
        sms: !!settingsData.alertNotiFlag.smsFlag,
        email: !!settingsData.alertNotiFlag.emailFlag,
        whatsapp: !!settingsData.alertNotiFlag.whtFlag,
      });
    }
  }, [settingsData]);

  const toggle = (key) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(updated);
    
    updateMutation.mutate({
      smsFlag: updated.sms,
      emailFlag: updated.email,
      pushFlag: true,
      whtFlag: updated.whatsapp,
    });
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => updateAlertNotification(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["alertNotificationSetting"] });
        openSuccessDialog({
          title: t("success", "Success"),
          message: data.message || "Alert notification updated successfully.",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to update notification settings.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description: err?.response?.data?.message || "Something went wrong.",
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("loading", "Loading Notification Settings...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-4 mb-2">
          {[
            { id: 'sms', label: t("mn_sms", t("sms_notifications", "SMS Notifications")) }, 
            { id: 'email', label: t("mn_email", t("email_notifications", "Email Notifications")) }, 
            { id: 'whatsapp', label: t("mn_wht", t("whatsapp_notifications", "WhatsApp Notifications")) }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
              <span className="font-semibold text-[#1b55ad] dark:text-blue-400 text-sm">{item.label}</span>
              <button 
                type="button"
                onClick={() => toggle(item.id)}
                disabled={updateMutation.isPending}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${notifications[item.id] ? 'bg-[#1b55ad]' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${notifications[item.id] ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChangeLanguageView() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openSuccessDialog } = useDialog();
  const { profile } = useDashboardContext();
  const { setLanguage } = useLanguage();

  const langMap = {
    "nl": "Dutch",
    "en": "English",
    "fr": "French",
    "es": "Spanish"
  };

  const reverseLangMap = {
    "Dutch": "nl",
    "English": "en",
    "French": "fr",
    "Spanish": "es"
  };

  const languages = [
    { key: "Dutch", label: t("lang_dutch", "Dutch") },
    { key: "English", label: t("chl_english", t("lang_english", "English")) },
    { key: "French", label: t("chl_franch", t("lang_french", "French")) },
    { key: "Spanish", label: t("chl_spanish", t("lang_spanish", "Spanish")) }
  ];

  const [selectedLang, setSelectedLang] = useState('English');

  // Initialize selected language from user profile
  useEffect(() => {
    if (profile?.languageId && langMap[profile.languageId]) {
      setSelectedLang(langMap[profile.languageId]);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateLanguage(payload),
    onSuccess: (data, variables) => {
      if (data.status === "success") {
        setLanguage(variables.languageId);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        openSuccessDialog({
          title: t("success", "Success"),
          message: data.message || "Preferred language updated successfully.",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to update language.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description: err?.response?.data?.message || "Something went wrong.",
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const handleSelectLanguage = (itemKey) => {
    setSelectedLang(itemKey);
    const languageCode = reverseLangMap[itemKey] || "en";
    updateMutation.mutate({ languageId: languageCode });
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-2 mb-2">
          {languages.map((item) => (
            <button 
              key={item.key} 
              type="button"
              onClick={() => handleSelectLanguage(item.key)}
              disabled={updateMutation.isPending}
              className="w-full flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors text-left"
            >
              <span className={`font-semibold text-sm ${selectedLang === item.key ? 'text-[#1b55ad] dark:text-blue-400' : 'text-slate-800 dark:text-white/90'}`}>
                {item.label}
              </span>
              {selectedLang === item.key && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1b55ad] dark:text-blue-400">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChangePinView() {
  const { t } = useLanguage();
  const { openConfirmDialog, openSuccessDialog } = useDialog();

  const [formData, setFormData] = useState({
    oldPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const changePinMutation = useMutation({
    mutationFn: (payload) => changePIN(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        openSuccessDialog({
          title: t("success", "Success"),
          message: data.message || "PIN changed successfully.",
        });
        setFormData({
          oldPin: "",
          newPin: "",
          confirmPin: "",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to change PIN.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description: err?.response?.data?.message || "Something went wrong.",
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.oldPin) {
      newErrors.oldPin = "Old PIN is required";
    } else if (formData.oldPin.length < 6) {
      newErrors.oldPin = "Old PIN must be 6 digits";
    }

    if (!formData.newPin) {
      newErrors.newPin = "New PIN is required";
    } else if (formData.newPin.length < 6) {
      newErrors.newPin = "New PIN must be 6 digits";
    }

    if (!formData.confirmPin) {
      newErrors.confirmPin = "Confirm PIN is required";
    } else if (formData.confirmPin !== formData.newPin) {
      newErrors.confirmPin = "Confirm PIN does not match New PIN";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      changePinMutation.mutate({
        oldPin: formData.oldPin,
        newPin: formData.newPin,
        confirmPin: formData.confirmPin,
        custType: "C",
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full mt-4">
          
          <GlobalInput
            label={t("old_wallet_pin", "Old Wallet PIN")}
            required
            type="password"
            name="oldPin"
            value={formData.oldPin}
            onChange={handleChange}
            error={errors.oldPin}
            maxLength={6}
            inputMode="numeric"
            placeholder="••••••"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

          <GlobalInput
            label={t("new_wallet_pin", "New Wallet PIN")}
            required
            type="password"
            name="newPin"
            value={formData.newPin}
            onChange={handleChange}
            error={errors.newPin}
            maxLength={6}
            inputMode="numeric"
            placeholder="••••••"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

          <GlobalInput
            label={t("confirm_pin", "Confirm PIN")}
            required
            type="password"
            name="confirmPin"
            value={formData.confirmPin}
            onChange={handleChange}
            error={errors.confirmPin}
            maxLength={6}
            inputMode="numeric"
            placeholder="••••••"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

        </div>
        <div className="flex justify-center mt-4">
          <GlobalButton 
            onClick={handleSubmit}
            variant="primary"
            className="px-8 text-xs font-bold uppercase tracking-wider"
            isLoading={changePinMutation.isPending}
          >
            {t("change_wallet_pin", t("change_pin", "Change PIN"))}
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function AdminPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "my_qr";

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'my_qr':
        return <MyQrView />
      case 'payment_limits':
        return <PaymentLimitsView />
      case 'settlement_settings':
        return <SettlementSettingsView />
      case 'manage_notifications':
        return <ManageNotificationsView />
      case 'change_language':
        return <ChangeLanguageView />
      case 'change_pin':
        return <ChangePinView />
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 text-slate-500">
            {t("under_construction", "Content for this section is under construction.")}
          </div>
        )
    }
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'my_qr': return t("my_qr", t("manage_storeQR", "Manage Store QR"))
      case 'payment_limits': return t("walletLimit", t("paymentLimits", "My Wallet Limits"))
      case 'settlement_settings': return t("sl_title", t("settlement_settings", "My Settlement Settings"))
      case 'manage_notifications': return t("ps_manageNotification", t("notifications_tlt", "Manage Notifications"))
      case 'change_language': return t("ps_changeLang", t("change_language", "Change Language"))
      case 'change_pin': return t("change_wallet_pin", t("change_pin", "Change PIN"))
      default: return t("adm_title", t("lmAdministration", "Administration"))
    }
  }

  const tabs = [
    { id: 'my_qr', label: t("manage_storeQR", t("myqr_title", t("store_qr_code", "Manage Store QR"))), icon: QrCode },
    { id: 'payment_limits', label: t("paymentLimits", t("payment_limits", "Payment Limits")), icon: Wallet },
    { id: 'settlement_settings', label: t("sl_title", t("my_settlement_settings", "My Settlement Settings")), icon: Building2 },
    { id: 'manage_notifications', label: t("ps_manageNotification", t("notifications_tlt", t("manage_notifications", "Manage Notifications"))), icon: Bell },
    { id: 'change_language', label: t("ps_changeLang", t("change_language", "Change Language")), icon: Languages },
    { id: 'change_pin', label: t("change_wallet_pin", t("change_pin", "Change PIN")), icon: KeyRound },
  ]

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-[#0f1829] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-2 snap-x">
            
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center shrink-0 lg:w-full gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 snap-start ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'} />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}

          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <h2 className="text-xl font-bold text-[#1b55ad] dark:text-blue-400 mb-4 animate-in fade-in">
            {getHeaderTitle()}
          </h2>
          {renderContent()}
        </div>

      </div>
    </div>
  )
}
