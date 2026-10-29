import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { APP_ICON_BASE64 } from "@/assets/appIconTransBase64";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import GlobalSelect from "@/components/globals/GlobalSelect";
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  Store,
  QrCode,
  Zap,
} from "lucide-react";

export default function MyQrView() {
  const { t } = useLanguage();
  const { profile, accounts } = useDashboardContext();
  const p = profile || {};
  const qrList = p.qrcode || [];

  // Populate options from profile qrcode list
  const qrOptions = qrList.map((q) => ({
    value: q.currency,
    label: `${q.currency} Wallet QR`,
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
        imageSize: 0.35,
        margin: 0,
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
    <div className="w-full flex justify-start py-1 animate-in fade-in duration-300">
      {/* ── Left-Aligned Focused Merchant QR Card ── */}
      <div className="w-full max-w-[480px]">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Card Top Brand Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <QrCode size={120} />
            </div>

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Store size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-bold truncate text-white">
                      {merchantName}
                    </h3>
                    <ShieldCheck
                      size={16}
                      className="text-emerald-300 shrink-0"
                    />
                  </div>
                  <p className="text-xs text-blue-100/80 font-medium truncate mt-0.5">
                    {merchantUsername}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-white shrink-0">
                {activeCurrencyDisplay}
              </span>
            </div>
          </div>

          {/* QR Stand Body */}
          <div className="p-6 flex flex-col items-center">
            {/* Currency selector if multiple */}
            {qrOptions.length > 1 && (
              <div className="w-full max-w-[280px] mb-5">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center mb-1.5">
                  {t("select_qr_currency", "Select QR Wallet Currency")}
                </label>
                <GlobalSelect
                  value={selectedCurrency}
                  onChange={(val) => setSelectedCurrency(val)}
                  options={qrOptions}
                  placeholder={t("selectCurrency", "Select Currency")}
                />
              </div>
            )}

            {/* QR Frame */}
            <div className="relative group p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center w-[252px] h-[252px] transition-all">
              <div
                ref={qrRef}
                className="w-[220px] h-[220px] flex items-center justify-center"
              />
            </div>

            {/* Instruction caption */}
            <div className="flex items-center gap-1.5 mt-4 text-center">
              <Zap size={13} className="text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("scan_to_pay_text", "Scan to pay instantly with mPay")}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
              {t(
                "compatible_all_wallets",
                "Compatible with customer wallets & cameras",
              )}
            </p>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDownloadQR}
                disabled={!qrValue}
                className="flex items-center justify-center gap-2 h-10 px-4 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                <span>{t("download_qr", "Download QR")}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!qrValue}
                className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t("copied", "Copied!")}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-400" />
                    <span>{t("copy_payload", "Copy Code")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
