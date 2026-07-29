import { MapPin, Pencil, User, Share2, Download } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import QRCodeStyling from "qr-code-styling";
import { useRef, useState, useEffect, useMemo } from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { useDashboardContext } from "@/pages/dashboard/context";
import { updateProfile } from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";

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
      {...registration}
    />
  );
}

export default function BusinessProfilePage() {
  const { profile, accounts } = useDashboardContext();
  const queryClient = useQueryClient();

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
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
            Business Profile
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (Forms) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="xl:col-span-8 flex flex-col gap-6"
        >
          {/* Business Profile */}
          <Card title="Business Profile">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#2563eb] p-1">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#2563eb] dark:text-white">
                    <User
                      className="w-10 h-10 sm:w-12 sm:h-12"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-white/40">
                  Upload Company Logo
                </span>
                <GlobalButton
                  variant="primary"
                  className="px-5 py-1.5 h-8 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                >
                  Upload
                </GlobalButton>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField
                  label="Store Name"
                  isReadOnly={true}
                  registration={register("custName")}
                  error={errors.custName?.message}
                />
                <InputField
                  label="Business User ID"
                  isReadOnly={true}
                  registration={register("userName")}
                  error={errors.userName?.message}
                />
                <InputField
                  label="Business Phone Number"
                  isReadOnly={true}
                  registration={register("mobilePhone")}
                  error={errors.mobilePhone?.message}
                />
                <InputField
                  label="Business Email Address"
                  isReadOnly={true}
                  registration={register("email")}
                  error={errors.email?.message}
                />
              </div>
            </div>
          </Card>

          {/* Address Details */}
          <Card title="Address Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <InputField
                label="Street No"
                icon={MapPin}
                registration={register("addrStreetNo")}
                error={errors.addrStreetNo?.message}
              />
              <InputField
                label="Street Name"
                icon={MapPin}
                registration={register("addrStreetName")}
                error={errors.addrStreetName?.message}
              />
              <InputField
                label="City"
                icon={MapPin}
                registration={register("city")}
                error={errors.city?.message}
              />
              <InputField
                label="State"
                icon={Pencil}
                registration={register("state")}
                error={errors.state?.message}
              />

              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <GlobalSelect
                    label="Country"
                    value={field.value}
                    onChange={field.onChange}
                    labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                    options={countryOptions}
                  />
                )}
              />

              <InputField
                label="Zip Code"
                icon={Pencil}
                registration={register("zipCode")}
                error={errors.zipCode?.message}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
              <GlobalButton
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
              >
                {updateMutation.isPending ? "Submitting..." : "Submit"}
              </GlobalButton>
            </div>
          </Card>
        </form>

        {/* Right Column (QR Code) */}
        <div className="xl:col-span-4 flex flex-col">
          <Card
            title="Business QR Code"
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
                label="Account"
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
                  Share
                </GlobalButton>
                <GlobalButton
                  onClick={handleDownloadQR}
                  variant="primary"
                  leftIcon={<Download size={16} />}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10"
                >
                  Download
                </GlobalButton>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
