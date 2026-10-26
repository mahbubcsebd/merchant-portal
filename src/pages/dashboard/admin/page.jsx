import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  QrCode,
  Wallet,
  Building2,
  Bell,
  Languages,
  KeyRound,
} from "lucide-react";

import MyQrView from "@/components/admin/MyQrView";
import PaymentLimitsView from "@/components/admin/PaymentLimitsView";
import SettlementSettingsView from "@/components/admin/SettlementSettingsView";
import ManageNotificationsView from "@/components/admin/ManageNotificationsView";
import ChangeLanguageView from "@/components/admin/ChangeLanguageView";
import ChangePinView from "@/components/admin/ChangePinView";

export default function AdminPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "my_qr";

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "my_qr":
        return <MyQrView />;
      case "payment_limits":
        return <PaymentLimitsView />;
      case "settlement_settings":
        return <SettlementSettingsView />;
      case "manage_notifications":
        return <ManageNotificationsView />;
      case "change_language":
        return <ChangeLanguageView />;
      case "change_pin":
        return <ChangePinView />;
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 text-slate-500">
            {t(
              "under_construction",
              "Content for this section is under construction.",
            )}
          </div>
        );
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "my_qr":
        return t("my_qr", t("manage_storeQR", "Manage Store QR"));
      case "payment_limits":
        return t("walletLimit", t("paymentLimits", "My Wallet Limits"));
      case "settlement_settings":
        return t(
          "sl_title",
          t("settlement_settings", "My Settlement Settings"),
        );
      case "manage_notifications":
        return t(
          "ps_manageNotification",
          t("notifications_tlt", "Manage Notifications"),
        );
      case "change_language":
        return t("ps_changeLang", t("change_language", "Change Language"));
      case "change_pin":
        return t("change_wallet_pin", t("change_pin", "Change PIN"));
      default:
        return t("adm_title", t("lmAdministration", "Administration"));
    }
  };

  const tabs = [
    {
      id: "my_qr",
      label: t(
        "manage_storeQR",
        t("myqr_title", t("store_qr_code", "Manage Store QR")),
      ),
      icon: QrCode,
    },
    {
      id: "payment_limits",
      label: t("paymentLimits", t("payment_limits", "Payment Limits")),
      icon: Wallet,
    },
    {
      id: "settlement_settings",
      label: t(
        "sl_title",
        t("my_settlement_settings", "My Settlement Settings"),
      ),
      icon: Building2,
    },
    {
      id: "manage_notifications",
      label: t(
        "ps_manageNotification",
        t(
          "notifications_tlt",
          t("manage_notifications", "Manage Notifications"),
        ),
      ),
      icon: Bell,
    },
    {
      id: "change_language",
      label: t("ps_changeLang", t("change_language", "Change Language")),
      icon: Languages,
    },
    {
      id: "change_pin",
      label: t("change_wallet_pin", t("change_pin", "Change PIN")),
      icon: KeyRound,
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-[#0f1829] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-2 snap-x">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center shrink-0 lg:w-full gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 snap-start ${
                    isActive
                      ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <tab.icon
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 dark:text-slate-400"
                    }
                  />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
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
  );
}
