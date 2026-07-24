"use client"

import { useState } from "react"
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
import Image from "next/image"
import GlobalInput from "@/components/globals/GlobalInput"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"

// ----------------------------------------------------------------------
// Sub-components for different views
// ----------------------------------------------------------------------

function MyQrView() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Huawei Corp</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-white/60">@Huawei</p>
      </div>

      <div className="relative mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center w-64 h-64">
        {/* Placeholder for actual QR code, using QrCode icon for structure */}
        <QrCode size={220} className="text-slate-900" strokeWidth={1} />
        {/* Logo in the center of QR */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md">
          <Image src="/images/logo.svg" alt="mPay" width={50} height={20} className="dark:invert-0" />
        </div>
      </div>

      <GlobalButton 
        variant="primary"
        leftIcon={<Download size={18} />}
        className="px-6 text-xs font-bold uppercase tracking-wider"
      >
        Download QR
      </GlobalButton>
    </div>
  )
}

function PaymentLimitsView() {
  const limitCategories = ["Daily Limits", "Monthly Limit", "Annual Limit"]
  
  const generateCards = (multiplier) => [
    { title: "Pay to Mobile", remaining: 9987.00 * multiplier, used: 13.00, max: 10000.00 * multiplier },
    { title: "Scan to Pay", remaining: 11111.00 * multiplier, used: 0.00, max: 11111.00 * multiplier },
    { title: "Pay Bills", remaining: 22222.00 * multiplier, used: 0.00, max: 22222.00 * multiplier },
  ]

  const columns = [
    { title: "Daily Limits", cards: generateCards(1) },
    { title: "Monthly Limit", cards: generateCards(10) },
    { title: "Annual Limit", cards: generateCards(100) },
  ]

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1b55ad] dark:text-blue-400">My Wallet Limits</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">{col.title}</h3>
            {col.cards.map((card, cardIdx) => {
              const progressPercentage = (card.used / card.max) * 100;
              return (
                <div key={cardIdx} className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{card.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2">Maximum Balance allowed on {card.title}</p>
                  
                  <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">
                    XCG {card.remaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Remaining
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  
                  <p className="text-[11px] text-slate-500 dark:text-white/50">
                    XCG {card.used.toFixed(2)} used (max: XCG {card.max.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                  </p>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function SettlementSettingsView() {
  const [view, setView] = useState('list'); // 'list', 'form', 'confirm', 'success'
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    currency: '',
    accountType: ''
  });
  const [errors, setErrors] = useState({});

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const [banks, setBanks] = useState([
    { name: "ACU Credit Union", account: "**** 5435" },
    { name: "BDC Curacao NV", account: "**** 2424" },
  ]);
  const [editIndex, setEditIndex] = useState(null);

  const handleEdit = (bank, idx) => {
    setFormData({
      bankName: bank.name,
      accountNumber: '324325435435', // Mocking full account number
      currency: 'BZD',
      accountType: 'Savings'
    });
    setEditIndex(idx);
    setErrors({});
    setView('form');
  };

  const handleAdd = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      currency: '',
      accountType: ''
    });
    setEditIndex(null);
    setErrors({});
    setView('form');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow only digits for account number (max length 12)
    if (name === 'accountNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 12) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";
    
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account Number is required";
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = "Account Number must be at least 9 digits";
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
    const last4 = formData.accountNumber.slice(-4);
    const accountStr = `**** ${last4}`;
    
    if (editIndex !== null) {
      const updatedBanks = [...banks];
      updatedBanks[editIndex] = { ...updatedBanks[editIndex], name: formData.bankName, account: accountStr };
      setBanks(updatedBanks);
    } else {
      setBanks([...banks, { name: formData.bankName, account: accountStr }]);
    }
    setView('success');
  };

  if (view === 'form') {
    return (
      <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 max-w-xl mx-auto w-full">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Edit Bank Account</h2>
          
          <div className="flex flex-col gap-5">
            <GlobalSelect
              label="Bank Name"
              required
              value={formData.bankName}
              onChange={(val) => handleSelectChange('bankName', val)}
              error={errors.bankName}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "ACU Credit Union", label: "ACU Credit Union" },
                { value: "BDC Curacao NV", label: "BDC Curacao NV" },
                { value: "CBCS Curacao", label: "CBCS Curacao" },
                { value: "Maduro & Curiel's Bank", label: "Maduro & Curiel's Bank" },
                { value: "ORCO Bank Curacao", label: "ORCO Bank Curacao" },
                { value: "PSB Bank NV Curacao", label: "PSB Bank NV Curacao" },
                { value: "RBC Bank Curacao", label: "RBC Bank Curacao" },
                { value: "Vidanova Bank", label: "Vidanova Bank" }
              ]}
            />

            <GlobalInput
              label="Account Number"
              required
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            />

            <GlobalSelect
              label="Currency"
              required
              value={formData.currency}
              onChange={(val) => handleSelectChange('currency', val)}
              error={errors.currency}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "BZD", label: "BZD" },
                { value: "CAD", label: "CAD" },
                { value: "DDT", label: "DDT" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "JMD", label: "JMD" },
                { value: "PHP", label: "PHP" },
                { value: "USD", label: "USD" },
                { value: "XCD", label: "XCD" },
                { value: "XCG", label: "XCG" }
              ]}
            />

            <GlobalSelect
              label="Account Type"
              required
              value={formData.accountType}
              onChange={(val) => handleSelectChange('accountType', val)}
              error={errors.accountType}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "Checking", label: "Checking" },
                { value: "Savings", label: "Savings" }
              ]}
            />
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <GlobalButton 
              onClick={() => setView('list')} 
              variant="secondary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </GlobalButton>
            <GlobalButton 
              onClick={handleSubmit} 
              variant="primary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              Submit
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Confirm Details</h2>
          
          <div className="flex flex-col gap-0 text-sm">
            <div className="flex items-center py-3 px-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-t-lg border-b border-white/40 dark:border-white/5">
              <span className="w-1/3 text-[#1b55ad] font-semibold text-right pr-6">Bank Name</span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">{formData.bankName}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c] border-b border-slate-100 dark:border-white/5">
              <span className="w-1/3 text-[#1b55ad] font-semibold text-right pr-6">Account No</span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">{formData.accountNumber}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-white/40 dark:border-white/5">
              <span className="w-1/3 text-[#1b55ad] font-semibold text-right pr-6">Currency</span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">{formData.currency}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c] rounded-b-lg">
              <span className="w-1/3 text-[#1b55ad] font-semibold text-right pr-6">Account Type</span>
              <span className="w-2/3 text-slate-900 dark:text-white font-semibold text-left">{formData.accountType}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <GlobalButton 
              onClick={() => setView('form')} 
              variant="secondary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              Change
            </GlobalButton>
            <GlobalButton 
              onClick={handleConfirm} 
              variant="primary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              Confirm
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

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-12 mb-6">Bank Account Details Successfully Updated</h2>
          
          <div className="flex flex-col gap-0 text-sm max-w-md mx-auto">
            <div className="flex items-center py-2.5 px-4 bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-[#1b55ad] font-semibold text-right pr-6">Bank Name</span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">{formData.bankName}</span>
            </div>
            <div className="flex items-center py-2.5 px-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-[#1b55ad] font-semibold text-right pr-6">Account No</span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">{formData.accountNumber}</span>
            </div>
            <div className="flex items-center py-2.5 px-4 bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-[#1b55ad] font-semibold text-right pr-6">Currency</span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">{formData.currency}</span>
            </div>
            <div className="flex items-center py-2.5 px-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-b-lg">
              <span className="w-1/2 text-[#1b55ad] font-semibold text-right pr-6">Account Type</span>
              <span className="w-1/2 text-slate-900 dark:text-white font-semibold text-left">{formData.accountType}</span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <GlobalButton 
              onClick={() => setView('list')} 
              variant="primary"
              className="px-8 text-xs font-bold uppercase tracking-wider"
            >
              Done
            </GlobalButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">My Settlement Settings</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 dark:text-white/70 uppercase border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-bold">Bank Name</th>
                <th className="px-4 py-3 font-bold">Account Number</th>
                <th className="px-4 py-3 font-bold text-right">Action</th>
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
                      <button className="text-slate-400 hover:text-red-500 transition-colors">
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
            Add Bank Account
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}

function ManageNotificationsView() {
  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    whatsapp: true
  });

  const toggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-4 mb-8">
          {[
            { id: 'sms', label: 'SMS Notifications' }, 
            { id: 'email', label: 'Email Notifications' }, 
            { id: 'whatsapp', label: 'WhatsApp Notifications' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
              <span className="font-semibold text-[#1b55ad] dark:text-blue-400 text-sm">{item.label}</span>
              <div 
                onClick={() => toggle(item.id)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${notifications[item.id] ? 'bg-[#1b55ad]' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${notifications[item.id] ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <GlobalButton 
            variant="primary"
            className="px-8 text-xs font-bold uppercase tracking-wider"
          >
            Update
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}

function ChangeLanguageView() {
  const languages = ['Dutch', 'English', 'French', 'Spanish']
  const [selectedLang, setSelectedLang] = useState('English')
  
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-2 mb-8">
          {languages.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedLang(item)}
              className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors"
            >
              <span className={`font-semibold text-sm ${selectedLang === item ? 'text-[#1b55ad] dark:text-blue-400' : 'text-slate-800 dark:text-white/90'}`}>{item}</span>
              {selectedLang === item && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1b55ad] dark:text-blue-400">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <GlobalButton 
            variant="primary"
            className="px-8 text-xs font-bold uppercase tracking-wider"
          >
            Update
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}

function ChangePinView() {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full mt-4">
          
          <GlobalInput
            label="Old Wallet PIN"
            required
            type="password"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

          <GlobalInput
            label="New Wallet PIN"
            required
            type="password"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

          <GlobalInput
            label="Confirm PIN"
            required
            type="password"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

        </div>
        <div className="flex justify-center mt-4">
          <GlobalButton 
            variant="primary"
            className="px-8 text-xs font-bold uppercase tracking-wider"
          >
            Change PIN
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
  const [activeTab, setActiveTab] = useState('my_qr');

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
            Content for this section is under construction.
          </div>
        )
    }
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'my_qr': return 'Store QR Code'
      case 'payment_limits': return 'Payment Limits'
      case 'settlement_settings': return 'My Settlement Settings'
      case 'manage_notifications': return 'Manage Notifications'
      case 'change_language': return 'Change Language'
      case 'change_pin': return 'Change PIN'
      default: return 'Administration'
    }
  }

  const tabs = [
    { id: 'my_qr', label: 'Store QR Code', icon: QrCode },
    { id: 'payment_limits', label: 'Payment Limits', icon: Wallet },
    { id: 'settlement_settings', label: 'My Settlement Settings', icon: Building2 },
    { id: 'manage_notifications', label: 'Manage Notifications', icon: Bell },
    { id: 'change_language', label: 'Change Language', icon: Languages },
    { id: 'change_pin', label: 'Change PIN', icon: KeyRound },
  ]

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-200 dark:border-white/10 gap-2">
        <h1 className="text-2xl font-bold text-[#1b55ad] dark:text-blue-400">
          Administration
        </h1>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-white/80">
          {getHeaderTitle()}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Sidebar Tabs - Responsive (Horizontal scroll on mobile, Vertical on Desktop) */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-1.5 snap-x">
            
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center shrink-0 lg:w-full gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 snap-start ${
                    isActive
                      ? 'bg-[#1b55ad] text-white shadow-md'
                      : 'text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#1b55ad] dark:hover:text-blue-400'
                  }`}
                >
                  <tab.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-white/40'} />
                  {tab.label}
                </button>
              )
            })}

          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>

      </div>
    </div>
  )
}
