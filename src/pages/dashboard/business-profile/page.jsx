import { MapPin, Pencil, User, Share2, Download } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import QRCodeStyling from "qr-code-styling";
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

function Card({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 ${className}`}
    >
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-[#2563eb] dark:text-white mb-4 sm:mb-6">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function InputField({
  label,
  placeholder,
  icon: Icon,
  required,
  registration,
  error,
  isReadOnly,
  maxLength,
  onInput,
}) {
  return (
    <GlobalInput
      label={label}
      required={required}
      placeholder={placeholder}
      leftIcon={Icon ? <Icon size={14} /> : null}
      labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
      error={error}
      isReadOnly={isReadOnly}
      maxLength={maxLength}
      onInput={onInput}
      {...registration}
    />
  );
}

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

  // Initialize selected account ID when accounts load
  useEffect(() => {
    if (accounts?.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].ACCOUNTNUMBER);
    }
  }, [accounts, selectedAccountId]);

  // Force a fresh fetch every time this tab is visited
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  }, [queryClient]);

  // Fallback to empty if profile is somehow missing
  const p = profile || {};
  const profileImageQuery = useProfileImage(profile);
  const displayImage = profileImageQuery.data;

  useEffect(() => {
    if (profileImageQuery.data) {
      setProfileImage(profileImageQuery.data);
    }
  }, [profileImageQuery.data]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: rhfErrors },
    getValues,
  } = useForm({
    values: {
      custName: p.custName || "",
      userName: p.userName || "",
      mobilePhone: p.mobilePhone || p.PHONE || "",
      email: p.email || p.EMAIL || "",
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

    // Validate file type
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

    // Validate file size (e.g. max 5MB)
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
      // Update the cache with the new values
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
      // Invalidate to ensure sync
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
      custName: data.custName,
      mobilePhone: data.mobilePhone,
      email: data.email,
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

  const qrValue = `${p.custName}#${p.userName}`;

  useEffect(() => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 170,
        height: 170,
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
        // Clear anything currently in the ref
        qrRef.current.innerHTML = "";
        qrCodeInstance.current.append(qrRef.current);
      }
    } else {
      qrCodeInstance.current.update({ data: qrValue });
    }
  }, [qrValue]);

  const handleDownloadQR = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({ name: "my-qr-code", extension: "png" });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b55ad] dark:text-blue-400 mb-1">
            Settings
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t("business_profile", "Business Profile")}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (Forms) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="xl:col-span-8 flex flex-col gap-6"
          noValidate
        >
          {/* Business Profile */}
          <Card title={t("business_profile", "Business Profile")}>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#2563eb] p-1">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#2563eb] dark:text-white">
                      <User
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-white/40">
                  {t("uploadLogo", "Upload Company Logo")}
                </span>
                <GlobalButton
                  variant="primary"
                  className="px-5 py-1.5 h-8 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={uploadMutation.isPending}
                >
                  {t("fileUploadButton", "Upload")}
                </GlobalButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/jpg"
                  style={{ display: "none" }}
                />
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField
                  label={t("store_name", "Store Name")}
                  isReadOnly={true}
                  registration={register("custName")}
                  error={rhfErrors.custName?.message}
                />
                <InputField
                  label={t("businessUserID", "Business User ID")}
                  isReadOnly={true}
                  registration={register("userName")}
                  error={rhfErrors.userName?.message}
                />
                <InputField
                  label={t("businessPhone", "Business Phone Number")}
                  isReadOnly={true}
                  registration={register("mobilePhone")}
                  error={rhfErrors.mobilePhone?.message}
                />
                <InputField
                  label={t("businessEmail", "Business Email Address")}
                  isReadOnly={true}
                  registration={register("email")}
                  error={rhfErrors.email?.message}
                />
              </div>
            </div>
          </Card>

          {/* Address Details */}
          <Card title={t("address_details", "Address Details")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <InputField
                label={t("street_no", "Street No")}
                icon={MapPin}
                required={true}
                registration={register("addrStreetNo", {
                  onChange: () => clearError("addrStreetNo"),
                })}
                error={validationErrors.addrStreetNo}
                maxLength={10}
                onInput={enforceNumeric}
              />
              <InputField
                label={t("street_name", "Street Name")}
                icon={MapPin}
                required={true}
                registration={register("addrStreetName", {
                  onChange: () => clearError("addrStreetName"),
                })}
                error={validationErrors.addrStreetName}
                maxLength={30}
                onInput={enforceAlphanumericSpace}
              />
              <InputField
                label={t("city", "City")}
                icon={MapPin}
                required={true}
                registration={register("city", {
                  onChange: () => clearError("city"),
                })}
                error={validationErrors.city}
                maxLength={30}
                onInput={enforceAlphanumericSpace}
              />
              <InputField
                label={t("state", "State")}
                icon={Pencil}
                required={true}
                registration={register("state", {
                  onChange: () => clearError("state"),
                })}
                error={validationErrors.state}
                maxLength={30}
                onInput={enforceAlphanumericSpace}
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
                    labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                    options={countryOptions}
                    error={validationErrors.country}
                  />
                )}
              />

              <InputField
                label={t("ucZipCode", "Zip Code")}
                icon={Pencil}
                required={true}
                registration={register("zipCode", {
                  onChange: () => clearError("zipCode"),
                })}
                error={validationErrors.zipCode}
                maxLength={7}
                onInput={enforceNumeric}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
              <GlobalButton
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
              >
                {updateMutation.isPending
                  ? "Submitting..."
                  : t("buttonSubmit", "Submit")}
              </GlobalButton>
            </div>
          </Card>
        </form>

        {/* Right Column (QR Code) */}
        <div className="xl:col-span-4 flex flex-col">
          <Card
            title={t("businessQrCode", "Business QR Code")}
            className="flex-1 flex flex-col h-full"
          >
            <div className="flex flex-col items-center flex-1">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {p.custName || "Business Name"}
              </h4>
              <p className="text-sm text-slate-500 dark:text-white/40 mb-6">
                @{p.userName || "username"}
              </p>

              <GlobalSelect
                label={t("ott_account", "Account")}
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                containerClassName="w-full mb-6"
                options={
                  accounts?.map((acc) => ({
                    value: acc.ACCOUNTNUMBER,
                    label: `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(acc.AVBALANCE || 0))} ${acc.CURSHRTNAME || acc.CURCODE}`,
                  })) || []
                }
              />

              <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white rounded-xl p-2 mb-6 flex items-center justify-center border-2 border-slate-200 dark:border-white/10">
                <div ref={qrRef} className="flex items-center justify-center" />
              </div>

              <div className="w-full flex flex-row gap-3 mt-auto pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
                <GlobalButton
                  variant="secondary"
                  leftIcon={<Share2 size={16} />}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10"
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
                  {t("buttonsShareQR", "Share")}
                </GlobalButton>
                <GlobalButton
                  onClick={handleDownloadQR}
                  variant="primary"
                  leftIcon={<Download size={16} />}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10"
                >
                  {t("buttonsDownloadQR", "Download")}
                </GlobalButton>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
