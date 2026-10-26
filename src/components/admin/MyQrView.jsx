import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { APP_ICON_BASE64 } from "@/assets/appIconTransBase64";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import GlobalSelect from "@/components/globals/GlobalSelect";

export default function MyQrView() {
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
        color: "#000000",
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
        name: `store-qr-${selectedCurrency || "wallet"}`,
        extension: "png",
      });
    }
  };

  const btnText = t(
    "buttonsDownloadQR",
    t("download_qr", "QR DOWNLOADEN"),
  ).toUpperCase();

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
        <div
          ref={qrRef}
          className="w-[220px] h-[220px] flex items-center justify-center"
        />
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
  );
}
