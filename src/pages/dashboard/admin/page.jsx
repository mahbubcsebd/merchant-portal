import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useDashboardContext } from "@/pages/dashboard/context";
import {
  QrCode,
  Wallet,
  Building2,
  Bell,
  Languages,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import MyQrView from "@/components/admin/MyQrView";
import PaymentLimitsView from "@/components/admin/PaymentLimitsView";
import SettlementSettingsView from "@/components/admin/SettlementSettingsView";
import ManageNotificationsView from "@/components/admin/ManageNotificationsView";
import ChangeLanguageView from "@/components/admin/ChangeLanguageView";
import ChangePinView from "@/components/admin/ChangePinView";

export default function AdminPage() {
  const { t } = useLanguage();
  const { profile } = useDashboardContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "my_qr";

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    {
      id: "my_qr",
      label: t(
        "manage_storeQR",
        t("myqr_title", t("store_qr_code", "Manage Store QR")),
      ),
      description: t(
        "myqr_desc",
        "Generate and download storefront payment QR",
      ),
      icon: QrCode,
      category: "Payments",
    },
    {
      id: "payment_limits",
      label: t("paymentLimits", t("payment_limits", "Payment Limits")),
      description: t(
        "limits_desc",
        "Daily, monthly and annual transaction quotas",
      ),
      icon: Wallet,
      category: "Limits",
    },
    {
      id: "settlement_settings",
      label: t(
        "sl_title",
        t("my_settlement_settings", "My Settlement Settings"),
      ),
      description: t(
        "settlement_desc",
        "Linked bank accounts for payouts and settlements",
      ),
      icon: Building2,
      category: "Banking",
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
      description: t(
        "notifications_desc",
        "SMS, Email and WhatsApp alert preferences",
      ),
      icon: Bell,
      category: "Preferences",
    },
    {
      id: "change_language",
      label: t("ps_changeLang", t("change_language", "Change Language")),
      description: t(
        "language_desc",
        "Select your preferred merchant portal language",
      ),
      icon: Languages,
      category: "Preferences",
    },
    {
      id: "change_pin",
      label: t("change_wallet_pin", t("change_pin", "Change PIN")),
      description: t(
        "pin_desc",
        "Update your 6-digit transaction authorization PIN",
      ),
      icon: KeyRound,
      category: "Security",
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

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
          <div className="w-full flex items-center justify-center bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-slate-500">
            {t(
              "under_construction",
              "Content for this section is under construction.",
            )}
          </div>
        );
    }
  };

  const merchantName =
    profile?.custName || profile?.FIRSTNAME || "Huawei Corp";

  return (
    <div className="w-full space-y-5 pb-8 animate-in fade-in duration-300">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("adm_title", t("lmAdministration", "Administration"))}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles size={11} />
              <span>{t("merchant_portal", "Merchant Portal")}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              "admin_subtitle",
              "Manage store QR codes, payment limits, settlement accounts, and security preferences",
            )}
          </p>
        </div>

        {/* Merchant identity pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shrink-0 self-start sm:self-auto">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {merchantName}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {t("verified_merchant", "Verified Merchant")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar Tabs + Content Area ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sub-Navigation Rail */}
        <div className="lg:col-span-4 xl:col-span-3 w-full">
          {/* Desktop & Mobile Card */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-2.5">
            {/* Mobile horizontal scroll / Desktop vertical stack */}
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-1.5 snap-x">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center justify-between w-auto lg:w-full shrink-0 px-3.5 py-3 rounded-xl text-left transition-all duration-200 snap-start cursor-pointer ${
                      isActive
                        ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}
                      >
                        <IconComponent size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold truncate">
                          {tab.label}
                        </span>
                        <span
                          className={`hidden lg:block text-[11px] truncate mt-0.5 ${
                            isActive
                              ? "text-blue-100"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {tab.description}
                        </span>
                      </div>
                    </div>

                    {/* Active chevron indicator on desktop */}
                    <ChevronRight
                      size={15}
                      className={`hidden lg:block shrink-0 transition-transform ${
                        isActive
                          ? "text-white opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick helper tip in sidebar */}
            <div className="hidden lg:block mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 px-3 py-2 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {t("tip_title", "Security Note:")}
                </span>{" "}
                {t(
                  "admin_help_note",
                  "Changes to settlement accounts and PIN require verification for your safety.",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Active Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 w-full min-w-0">
          {/* Active Section Context Header */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {currentTab.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentTab.description}
              </p>
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {currentTab.category}
            </span>
          </div>

          {/* Tab View */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
