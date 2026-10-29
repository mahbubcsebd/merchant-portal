import {
  MapPin,
  Pencil,
  User,
  Share2,
  Download,
  Building2,
  AtSign,
  Phone,
  Mail,
  Camera,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QRCodeStyling from "qr-code-styling";
import { APP_ICON_BASE64 } from "@/assets/appIconTransBase64";
import { useRef, useState, useEffect, useMemo } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useDashboardContext } from "@/pages/dashboard/context";
import {
  updateProfile,
  uploadDocument,
  getDocumentContent,
} from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  enforceNumeric,
  enforceAlphanumericSpace,
} from "@/lib/utils/inputFormatters";
import { useFormValidation } from "@/hooks/useFormValidation";

export default function BusinessProfilePage() {
  const { profile, accounts } = useDashboardContext();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const {
    validate,
    errors: validationErrors,
    clearError,
  } = useFormValidation();

  // Get welcome API data (COUNTRYCODE)
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const countryOptions = useMemo(() => {
    const countries = welcomeData?.metaData?.COUNTRYCODE || [];
    return countries.map((c) => ({
      value: c.id,
      label: c.title,
    }));
  }, [welcomeData]);

  const { openConfirmDialog } = useDialog();
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Initialize selected account ID when accounts load
  useEffect(() => {
    if (accounts?.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].ACCOUNTNUMBER);
    }
  }, [accounts, selectedAccountId]);

  const p = profile || {};
  const profileImageQuery = useProfileImage(profile);

  useEffect(() => {
    if (profileImageQuery.data) {
      setProfileImage(profileImageQuery.data);
    }
  }, [profileImageQuery.data]);

  const {
    register,
    handleSubmit,
    control,
  } = useForm({
    values: {
      addrStreetNo: p.addrStreetNo || "",
      addrStreetName: p.addrStreetName || "",
      city: p.city || "",
      state: p.state || "",
      country: p.country || "",
      zipCode: p.zipCode || "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (values) => {
      const res = await uploadDocument(values);
      const imgId = res?.data?.[0]?.IMGIDNUM;
      if (!imgId) {
        throw new Error("Failed to retrieve image ID after upload.");
      }

      const payload = {
        custName: p.custName || "",
        mobilePhone: p.mobilePhone || p.PHONE || "",
        email: p.email || p.EMAIL || "",
        country: p.country || "",
        resCountry: p.resCountry || p.country || "",
        state: p.state || "",
        city: p.city || "",
        addrStreetNo: p.addrStreetNo || "",
        addrStreetName: p.addrStreetName || "",
        zipCode: p.zipCode || "",
        citCountry: p.citCountry || p.country || "",
        custphotoid: imgId,
      };
      await updateProfile(payload);

      const docRes = await getDocumentContent({ imgId: imgId });

      return {
        imgId,
        finalImage: docRes?.data || values.imgData,
        message: res.message,
      };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      openConfirmDialog({
        title: "Success",
        description: res.message || "Profile image updated successfully.",
        confirmText: "Close",
        iconType: "success",
        hideCancel: true,
      });

      setProfileImage(res.finalImage);
    },
    onError: (err) => {
      openConfirmDialog({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Failed to upload image.",
        confirmText: "Close",
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      openConfirmDialog({
        title: "Invalid File",
        description: "Please upload a valid image file (JPEG, PNG).",
        confirmText: "Close",
        iconType: "danger",
        hideCancel: true,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      openConfirmDialog({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        confirmText: "Close",
        iconType: "danger",
        hideCancel: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      uploadMutation.mutate({ imgData: base64, imgType: "custphotoid" });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const updateMutation = useMutation({
    mutationFn: (values) => updateProfile(values),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["userProfile"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...variables,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      openConfirmDialog({
        title: "Success",
        description:
          data?.message ||
          "Your business profile has been updated successfully.",
        confirmText: "Close",
        iconType: "success",
        hideCancel: true,
      });
    },
    onError: (err) => {
      openConfirmDialog({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to update profile.",
        confirmText: "Close",
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const onSubmit = (data) => {
    const fields = [
      {
        name: "addrStreetNo",
        value: data.addrStreetNo,
        label: t("street_no", "Street No"),
        required: true,
      },
      {
        name: "addrStreetName",
        value: data.addrStreetName,
        label: t("street_name", "Street Name"),
        required: true,
      },
      {
        name: "city",
        value: data.city,
        label: t("city", "City"),
        required: true,
      },
      {
        name: "state",
        value: data.state,
        label: t("state", "State"),
        required: true,
      },
      {
        name: "country",
        value: data.country,
        label: t("crCountry", "Country"),
        type: "select",
        required: true,
      },
      {
        name: "zipCode",
        value: data.zipCode,
        label: t("ucZipCode", "Zip Code"),
        required: true,
      },
    ];

    const { isValid } = validate(fields);
    if (!isValid) return;

    const payload = {
      custName: p.custName || "",
      mobilePhone: p.mobilePhone || p.PHONE || "",
      email: p.email || p.EMAIL || "",
      country: data.country,
      resCountry: p.resCountry || data.country,
      state: data.state,
      city: data.city,
      addrStreetNo: data.addrStreetNo,
      addrStreetName: data.addrStreetName,
      zipCode: data.zipCode,
      citCountry: p.citCountry || data.country,
    };
    updateMutation.mutate(payload);
  };

  const qrList = p.qrcode || [];
  const selectedAccount = accounts?.find(
    (acc) => acc.ACCOUNTNUMBER === selectedAccountId,
  );
  const selectedQr = qrList.find(
    (q) => q.currency === selectedAccount?.CURSHRTNAME,
  );
  const qrValue =
    selectedQr?.qrcode ||
    (p.userName && p.mobilePhone
      ? `${p.userName}#${p.mobilePhone}`
      : p.custName
        ? `${p.custName}#${p.userName}`
        : "");

  useEffect(() => {
    if (!qrRef.current || !qrValue) return;

    qrRef.current.innerHTML = "";
    const qrCode = new QRCodeStyling({
      type: "svg",
      width: 200,
      height: 200,
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
        name: `business-qr-${selectedAccount?.CURSHRTNAME || "account"}`,
        extension: "png",
      });
    }
  };

  const businessMetaFields = [
    {
      key: "storeName",
      label: t("store_name", "Store Name"),
      value: p.custName || "—",
      icon: Building2,
      copyable: true,
    },
    {
      key: "userId",
      label: t("businessUserID", "Business User ID"),
      value: p.userName || "—",
      icon: AtSign,
      copyable: true,
    },
    {
      key: "phone",
      label: t("businessPhone", "Business Phone Number"),
      value: p.mobilePhone || p.PHONE || "—",
      icon: Phone,
      copyable: true,
    },
    {
      key: "email",
      label: t("businessEmail", "Business Email Address"),
      value: p.email || p.EMAIL || "—",
      icon: Mail,
      copyable: true,
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-5 pb-8">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("business_profile", "Business Profile")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("business_profile_subtitle", "Manage your merchant brand identity, verified business info, and address details")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* ── Left Column: Business Info & Editable Address ── */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Business Profile Card */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("business_profile", "Business Profile")}
                </h3>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                <ShieldCheck size={13} />
                <span>{t("verified", "Verified")}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo / Avatar with inline upload action */}
              <div className="flex flex-col items-center gap-2.5 shrink-0 self-center md:self-start">
                <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                        <User className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload logo"
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 mt-1"
                >
                  {uploadMutation.isPending ? t("uploading", "Uploading...") : t("change_logo", "Change Logo")}
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/jpg"
                  style={{ display: "none" }}
                />
              </div>

              {/* Data showcase */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessMetaFields.map((field) => {
                  const IconComp = field.icon;
                  const isCopied = copiedKey === field.key;
                  return (
                    <div
                      key={field.key}
                      className="group relative p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                          <IconComp size={13} />
                          <span className="text-[11px] font-medium tracking-wide">
                            {field.label}
                          </span>
                        </div>
                        {field.copyable && field.value !== "—" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(field.value, field.key)}
                            aria-label={`Copy ${field.label}`}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-60 group-hover:opacity-100 transition-opacity p-0.5"
                          >
                            {isCopied ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate select-all">
                        {field.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Editable Address Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            noValidate
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("address_details", "Address Details")}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mb-5">
              <GlobalInput
                label={t("street_no", "Street No")}
                required={true}
                placeholder="e.g. 12"
                leftIcon={<MapPin size={14} />}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                error={validationErrors.addrStreetNo}
                maxLength={10}
                onInput={enforceNumeric}
                {...register("addrStreetNo", {
                  onChange: () => clearError("addrStreetNo"),
                })}
              />

              <GlobalInput
                label={t("street_name", "Street Name")}
                required={true}
                placeholder="e.g. Main Street"
                leftIcon={<MapPin size={14} />}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                error={validationErrors.addrStreetName}
                maxLength={30}
                onInput={enforceAlphanumericSpace}
                {...register("addrStreetName", {
                  onChange: () => clearError("addrStreetName"),
                })}
              />

              <GlobalInput
                label={t("city", "City")}
                required={true}
                placeholder="e.g. Kingston"
                leftIcon={<MapPin size={14} />}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                error={validationErrors.city}
                maxLength={30}
                onInput={enforceAlphanumericSpace}
                {...register("city", {
                  onChange: () => clearError("city"),
                })}
              />

              <GlobalInput
                label={t("state", "State")}
                required={true}
                placeholder="e.g. Saint Andrew"
                leftIcon={<Pencil size={14} />}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                error={validationErrors.state}
                maxLength={30}
                onInput={enforceAlphanumericSpace}
                {...register("state", {
                  onChange: () => clearError("state"),
                })}
              />

              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <GlobalSelect
                    label={t("crCountry", "Country")}
                    required={true}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      clearError("country");
                    }}
                    labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    options={countryOptions}
                    error={validationErrors.country}
                  />
                )}
              />

              <GlobalInput
                label={t("ucZipCode", "Zip Code")}
                required={true}
                placeholder="e.g. 10001"
                leftIcon={<Pencil size={14} />}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                error={validationErrors.zipCode}
                maxLength={7}
                onInput={enforceNumeric}
                {...register("zipCode", {
                  onChange: () => clearError("zipCode"),
                })}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <GlobalButton
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto px-6 h-10 text-xs font-bold tracking-wider"
              >
                {updateMutation.isPending
                  ? t("submitting", "Saving...")
                  : t("save_changes", "Save Changes")}
              </GlobalButton>
            </div>
          </form>
        </div>

        {/* ── Right Column: Business QR Code Card (Matches Left Column Height) ── */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-full justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <QrCode size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("business_qr_code", "Business QR Code")}
                  </h3>
                </div>
              </div>

              {/* Merchant Identity Header */}
              <div className="text-center mb-5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {p.custName || "Merchant Store"}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  @{p.userName || "store"}
                </p>
              </div>

              {/* Account Selector Dropdown */}
              <div className="mb-6">
                <GlobalSelect
                  label={t("ott_account", "Account")}
                  value={selectedAccountId}
                  onChange={setSelectedAccountId}
                  labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  options={
                    accounts?.map((acc) => {
                      const code = acc.CURSHRTNAME || acc.CURCODE || "XCG";
                      const bal = new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                      }).format(parseFloat(acc.AVBALANCE || 0));
                      return {
                        value: acc.ACCOUNTNUMBER,
                        label: `${code} (${bal})`,
                      };
                    }) || []
                  }
                />
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center">
                <div className="relative p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 shadow-inner flex items-center justify-center">
                  <div
                    ref={qrRef}
                    className="rounded-xl overflow-hidden bg-white p-2.5 shadow-sm flex items-center justify-center"
                  />
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-3 font-normal max-w-[240px]">
                  {t("scan_to_pay_hint", "Customers can scan this QR code directly with mPay")}
                </p>
              </div>
            </div>

            {/* Actions: Matching standard GlobalButton styling and radius */}
            <div className="grid grid-cols-2 gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/60">
              <GlobalButton
                variant="outline"
                leftIcon={<Share2 size={14} />}
                className="w-full text-xs font-semibold h-10"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: p.custName,
                        text: `Pay ${p.custName} using this code: ${qrValue}`,
                      })
                      .catch(console.error);
                  }
                }}
              >
                {t("share", "Share")}
              </GlobalButton>
              <GlobalButton
                onClick={handleDownloadQR}
                variant="primary"
                leftIcon={<Download size={14} />}
                className="w-full text-xs font-semibold h-10"
              >
                {t("download", "Download")}
              </GlobalButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
