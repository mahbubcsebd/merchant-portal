import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { APP_ICON_BASE64 } from "@/assets/appIconTransBase64";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  Zap,
  Share2,
  Sparkles,
  Smartphone,
} from "lucide-react";

export default function MyQrView() {
  const { t } = useLanguage();
  const { profile, accounts } = useDashboardContext();
  const p = profile || {};
  const qrList = p.qrcode || [];

  // Populate options from profile qrcode list or fall back to user accounts
  const qrOptions =
    qrList.length > 0
      ? qrList.map((q) => ({
          value: q.currency,
          label: `${q.currency} Wallet QR`,
        }))
      : (accounts || []).map((acc) => ({
          value: acc.CURSHRTNAME || acc.CURCODE || "XCG",
          label: `${acc.CURSHRTNAME || acc.CURCODE || "XCG"} Wallet QR`,
        }));

  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [copied, setCopied] = useState(false);

  // Initialize selected currency
  useEffect(() => {
    if (qrOptions.length > 0 && !selectedCurrency) {
      setSelectedCurrency(qrOptions[0].value);
    }
  }, [qrOptions, selectedCurrency]);

  const selectedQr = qrList.find((q) => q.currency === selectedCurrency);
  const qrValue =
    selectedQr?.qrcode ||
    (p.userName && p.mobilePhone
      ? `${p.userName}#${p.mobilePhone}`
      : p.custName
        ? `${p.custName}#${p.userName}`
        : "mPay");

  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  useEffect(() => {
    if (!qrRef.current || !qrValue) return;

    qrRef.current.innerHTML = "";
    const qrCode = new QRCodeStyling({
      type: "svg",
      width: 220,
      height: 220,
      data: qrValue,
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "Q",
      },
      imageOptions: {
        saveAsBlob: false,
        hideBackgroundDots: true,
        imageSize: 0.32,
        margin: 2,
      },
      dotsOptions: {
        type: "extra-rounded",
        color: "#0f172a",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      image: APP_ICON_BASE64,
    });

    qrCode.append(qrRef.current);
    qrCodeInstance.current = qrCode;
  }, [qrValue]);

  const handleDownloadQR = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({
        name: `mpay-store-qr-${selectedCurrency || "wallet"}`,
        extension: "png",
      });
    }
  };

  const handleCopyCode = () => {
    if (!qrValue) return;
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const merchantName = p.custName || p.FIRSTNAME || "Huawei Corp";
  const merchantUsername = p.userName ? `@${p.userName}` : "@merchant";
  const activeCurrencyDisplay =
    selectedCurrency ||
    accounts?.[0]?.CURSHRTNAME ||
    accounts?.[0]?.CURCODE ||
    "XCG";

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* ── Left Column: Storefront QR Card ── */}
        <div className="xl:col-span-7 flex flex-col">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm flex flex-col h-full justify-between">
            <div>
              {/* Header: Clean matching standard cards */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center">
                    <QrCode size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {t("store_qr_code", "Store QR Code")}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {t("in_store_point_of_sale", "Point-of-Sale Checkout Stand")}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 text-[11px] font-semibold border border-blue-200/60 dark:border-blue-500/20">
                  <ShieldCheck size={13} />
                  <span>{t("verified", "Verified")}</span>
                </div>
              </div>

              {/* Merchant Store Header */}
              <div className="text-center mb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {merchantName}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  {merchantUsername}
                </p>
              </div>

              {/* Currency Selector Dropdown (When multiple or standard) */}
              {qrOptions.length > 1 && (
                <div className="mb-5 max-w-sm mx-auto">
                  <GlobalSelect
                    label={t("ott_account", "Account / Currency")}
                    value={selectedCurrency}
                    onChange={(val) => setSelectedCurrency(val)}
                    options={qrOptions}
                    placeholder={t("selectCurrency", "Select Currency")}
                    labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  />
                </div>
              )}

              {/* QR Code Container */}
              <div className="flex flex-col items-center">
                <div className="relative p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-inner flex items-center justify-center">
                  <div
                    ref={qrRef}
                    className="rounded-lg overflow-hidden bg-white p-2.5 shadow-sm flex items-center justify-center"
                  />
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-center">
                  <Zap size={13} className="text-[#2563eb] dark:text-blue-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {t("scan_to_pay_text", "Scan to pay instantly with mPay")}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center max-w-[280px]">
                  {t(
                    "compatible_all_wallets",
                    "Compatible with customer wallets & mobile camera apps",
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons: Unified GlobalButton layout */}
            <div className="grid grid-cols-2 gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-white/10">
              <GlobalButton
                variant="outline"
                leftIcon={copied ? <Check size={14} className="text-blue-600 dark:text-blue-400" /> : <Copy size={14} />}
                className="w-full text-xs font-semibold h-10"
                onClick={handleCopyCode}
                disabled={!qrValue}
              >
                {copied ? t("copied", "Copied!") : t("copy_payload", "Copy Code")}
              </GlobalButton>
              <GlobalButton
                onClick={handleDownloadQR}
                variant="primary"
                leftIcon={<Download size={14} />}
                className="w-full text-xs font-semibold h-10"
                disabled={!qrValue}
              >
                {t("download_qr", "Download QR")}
              </GlobalButton>
            </div>
          </div>
        </div>

        {/* ── Right Column: Information, Guidelines & Integration Details ── */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* Active Configuration Summary Card (Consistent rounded-xl corner matching system) */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("store_qr_spec", "QR Specifications")}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#2563eb] dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                {activeCurrencyDisplay}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-white/[0.04] border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("merchant_name", "Merchant Name")}
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {merchantName}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-white/[0.04] border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("active_currency", "Settlement Currency")}
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {activeCurrencyDisplay}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-white/[0.04] border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("resolution", "Export Resolution")}
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    High Quality (SVG / PNG)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-white/[0.04] border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("status", "Status")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[#2563eb] dark:text-blue-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                    {t("active_ready", "Active & Ready")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Best Practices & Tips Card */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("checkout_guidelines", "Storefront Guidelines")}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t("display_at_counter", "Display at Cash Register")}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {t("display_counter_desc", "Place printed QR code stands where customers can scan seamlessly upon checkout.")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t("instant_settlement", "Real-Time Confirmation")}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {t("instant_settlement_desc", "Every completed customer payment appears immediately under Live Transactions.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sharing Helper */}
            {navigator.share && (
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    navigator
                      .share({
                        title: merchantName,
                        text: `Pay ${merchantName} using this code: ${qrValue}`,
                      })
                      .catch(console.error);
                  }}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  <Share2 size={13} className="text-[#2563eb] dark:text-blue-400" />
                  <span>{t("share_store_qr", "Share Store QR Link")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
