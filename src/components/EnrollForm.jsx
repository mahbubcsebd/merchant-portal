import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Check,
  Mail,
  Phone,
  AlertCircle,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import {
  registerMerchant,
  verifyMerchantOTP,
  resendOTP,
  welcomeApi,
} from "@/lib/api/endpoints";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { getDynamicCountryOptions } from "@/lib/constants/countries";
import {
  enforceAlphanumericSpace,
  enforceEmail,
  enforceNumeric,
} from "@/lib/utils/inputFormatters";

const getFormSchema = (t) =>
  z.object({
    storeName: z
      .string()
      .min(1, { message: t("store_name_required", "Store Name is required.") })
      .min(2, {
        message: t(
          "store_name_min_error",
          "Store Name must be at least 2 characters.",
        ),
      })
      .max(50, {
        message: t(
          "store_name_max_error",
          "Store Name cannot exceed 50 characters.",
        ),
      })
      .regex(/^[a-zA-Z0-9 ]+$/, {
        message: t(
          "store_name_alphanumeric_error",
          "Store Name must contain letters, numbers, and spaces only.",
        ),
      }),
    emailID: z
      .string()
      .min(1, {
        message: t("email_required", "Business Email Address is required."),
      })
      .email({
        message: t("invalid_email", "Please enter a valid Email Address."),
      })
      .max(80, {
        message: t(
          "email_max_error",
          "Email Address cannot exceed 80 characters.",
        ),
      }),
    countryCode: z.string().min(1, {
      message: t("country_code_required", "Select a country code."),
    }),
    phoneNumber: z
      .string()
      .min(1, {
        message: t("phone_required", "Business Phone Number is required."),
      })
      .min(7, {
        message: t(
          "phone_min_error",
          "Business Phone Number length should be at least 7 characters.",
        ),
      })
      .max(12, {
        message: t("phone_max_error", "Phone number cannot exceed 12 digits."),
      })
      .regex(/^[0-9]+$/, {
        message: t(
          "phone_numeric_error",
          "Phone number must contain digits only.",
        ),
      }),
    terms_and_conditions_checkbox: z.boolean().refine((v) => v === true, {
      message: t(
        "accept_terms_required",
        "You must accept the Terms and Conditions.",
      ),
    }),
    removing_customer_check: z.boolean().refine((v) => v === true, {
      message: t(
        "accept_device_required",
        "You must agree to the device account agreement.",
      ),
    }),
    appConsent: z.enum(["Y", "N"], {
      required_error: t(
        "app_consent_required",
        "Please select Yes or No to proceed.",
      ),
    }),
  });

export function EnrollForm() {
  const navigate = useNavigate();
  const { data: welcomeData } = useQuery({
    queryKey: ["welcome"],
    queryFn: welcomeApi,
    staleTime: Infinity,
  });
  const { t } = useLanguage();

  const [step, setStep] = useState("form"); // 'form' | 'confirm' | 'otp' | 'success'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");
  const [openCountryBox, setOpenCountryBox] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const countryCodesList = useMemo(
    () => getDynamicCountryOptions(welcomeData),
    [welcomeData],
  );

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countryCodesList;
    const q = searchQuery.toLowerCase().trim();
    return countryCodesList.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        (c.isoCode && c.isoCode.toLowerCase().includes(q)),
    );
  }, [countryCodesList, searchQuery]);

  const schema = useMemo(() => getFormSchema(t), [t]);

  const defaultValues = useMemo(() => {
    try {
      const saved = sessionStorage.getItem("enroll_form_draft");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      storeName: "",
      emailID: "",
      countryCode: "",
      phoneNumber: "",
      terms_and_conditions_checkbox: false,
      removing_customer_check: false,
      appConsent: "Y",
    };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Persist form values so SPA navigation to /terms-and-conditions doesn't lose inputs
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem("enroll_form_draft", JSON.stringify(values));
      } catch (e) {}
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const formValues = watch();

  // Step 1 Form Submission → Move to Step 2 (Confirm Details)
  function onFormSubmit() {
    setApiError("");
    setResendSuccessMsg("");
    setStep("confirm");
  }

  // Step 2 Confirm Submit → Trigger /walletmc/register API
  async function handleRegisterSubmit() {
    setIsSubmitting(true);
    setApiError("");
    setResendSuccessMsg("");
    try {
      const values = getValues();
      const payload = {
        storeName: values.storeName,
        emailID: values.emailID,
        countryCode: values.countryCode,
        phoneNumber: `${values.countryCode}${values.phoneNumber}`,
        terms_and_conditions_checkbox: true,
        removing_customer_check: true,
        appConsent: values.appConsent,
        crossAppConsent: values.appConsent,
        phCountryCode: values.countryCode,
        challenge: [],
        custType: "C",
      };

      const res = await registerMerchant(payload);

      if (res?.status === "success" || res?.statusCode === 0) {
        setStep("otp");
      } else {
        setApiError(
          res?.message ||
            t(
              "registration_failed_try_again",
              "Registration failed. Please try again.",
            ),
        );
      }
    } catch (err) {
      setApiError(
        err?.message ||
          t(
            "something_went_wrong_try_again",
            "Something went wrong. Please try again.",
          ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Resend OTP → Trigger /walletmc/resendOTP API
  async function handleResendOTP() {
    setIsSubmitting(true);
    setApiError("");
    setResendSuccessMsg("");
    try {
      const values = getValues();
      const payload = {
        custType: "C",
        emailID: values.emailID,
        phoneNumber: `${values.countryCode}${values.phoneNumber}`,
      };

      const res = await resendOTP(payload);

      if (res?.status === "success" || res?.statusCode === 0) {
        setResendSuccessMsg(
          res?.message ||
            t("otp_resent_success", "The OTP has been successfully resent."),
        );
        setTimeout(() => setResendSuccessMsg(""), 5000);
      } else {
        setApiError(
          res?.message ||
            t("failed_resend_otp", "Failed to resend OTP. Please try again."),
        );
      }
    } catch (err) {
      setApiError(
        err?.message ||
          t("failed_resend_otp", "Failed to resend OTP. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 3 OTP Verification → Trigger /walletmc/verifyMerchantOTP API
  async function handleVerifyOTP() {
    if (!otpCode || otpCode.length < 6) {
      setApiError(
        t("enter_complete_otp", "Please enter the complete 6-digit OTP code."),
      );
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    setResendSuccessMsg("");
    try {
      const values = getValues();
      const payload = {
        otp: otpCode,
        emailID: values.emailID,
        phoneNumber: `${values.countryCode}${values.phoneNumber}`,
        storeName: values.storeName,
        countryCode: values.countryCode,
        phCountryCode: values.countryCode,
        custType: "C",
      };

      const res = await verifyMerchantOTP(payload);

      if (res?.status === "success" || res?.statusCode === 0) {
        // Clear stored draft upon success
        try {
          sessionStorage.removeItem("enroll_form_draft");
        } catch (e) {}

        setSuccessMessage(
          res?.message ||
            t(
              "verification_link_sent_email",
              "Merchant verification link has been sent to your registered email address. Please check your inbox to complete enrollment.",
            ),
        );
        setStep("success");
      } else {
        setApiError(
          res?.message ||
            t("invalid_otp_code", "Invalid OTP code. Please try again."),
        );
      }
    } catch (err) {
      setApiError(
        err?.message ||
          t(
            "otp_verification_failed",
            "OTP verification failed. Please try again.",
          ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Resend OTP Success Alert */}
      {resendSuccessMsg && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center gap-2.5 animate-[fade-down_0.3s_ease-out]">
          <Check size={18} className="text-emerald-500 shrink-0" />
          <span>{resendSuccessMsg}</span>
        </div>
      )}

      {/* Global Form Error Message */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm font-medium flex items-center gap-2.5 animate-[fade-down_0.3s_ease-out]">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* ── STEP 1: INITIAL DETAILS ───────────────────────────────────────── */}
      {step === "form" && (
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b55ad] dark:text-blue-400 uppercase">
              {t("registerMerchant", "MERCHANT REGISTRATION")}
            </h2>
            <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              {t(
                "register_subtitle",
                "Register your business on mPay Merchant Portal",
              )}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-5 animate-[fade-up_0.5s_ease-out_0.1s_both]"
            noValidate
          >
            {/* Store Name */}
            <GlobalInput
              id="custname"
              label={t("storeName", "Store Name")}
              required
              placeholder={t("storeName", "Store Name")}
              leftIcon={<Building2 size={16} />}
              error={errors.storeName?.message}
              aria-invalid={!!errors.storeName}
              maxLength={50}
              onInput={enforceAlphanumericSpace}
              {...register("storeName")}
            />

            {/* Business Email */}
            <GlobalInput
              id="email"
              type="email"
              label={t("merCrEmail", "Business Email Address")}
              required
              placeholder="business@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.emailID?.message}
              aria-invalid={!!errors.emailID}
              maxLength={80}
              onInput={enforceEmail}
              {...register("emailID")}
            />

            {/* Business Phone Number */}
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("merCrPhoneNo", "Business Phone Number")}{" "}
                <span className="text-[#e65625]">*</span>
              </label>
              <div
                className={cn(
                  "flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 transition-all duration-150 overflow-hidden",
                  errors.phoneNumber || errors.countryCode
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                    : "border-slate-200 dark:border-white/10 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20",
                )}
              >
                <Popover open={openCountryBox} onOpenChange={setOpenCountryBox}>
                  <PopoverTrigger
                    type="button"
                    aria-expanded={openCountryBox}
                    className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer"
                  >
                    {countryCodesList.find(
                      (c) => c.code === watch("countryCode"),
                    ) ? (
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                        {countryCodesList.find(
                          (c) => c.code === watch("countryCode"),
                        )?.flag && (
                          <span className="text-sm">
                            {
                              countryCodesList.find(
                                (c) => c.code === watch("countryCode"),
                              )?.flag
                            }
                          </span>
                        )}
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          +{watch("countryCode")}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        {t("select_country", "Select")}
                      </span>
                    )}
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-2 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[100]"
                    align="start"
                  >
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t(
                          "ph_search_country",
                          "Search country...",
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setValue("countryCode", "", { shouldValidate: true });
                          setOpenCountryBox(false);
                          setSearchQuery("");
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/10 text-left cursor-pointer",
                          !watch("countryCode")
                            ? "bg-blue-50/80 dark:bg-white/10 text-[#2563eb] dark:text-blue-400 font-bold"
                            : "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        <span>{t("select_country", "Select")}</span>
                        {!watch("countryCode") && (
                          <Check className="h-3.5 w-3.5 text-[#2563eb] dark:text-blue-400 shrink-0" />
                        )}
                      </button>

                      {filteredCountries.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">
                          {t("no_country_found", "No country found")}
                        </div>
                      ) : (
                        filteredCountries.map((country, idx) => (
                          <button
                            key={`${country.code}-${country.isoCode || idx}`}
                            type="button"
                            onClick={() => {
                              setValue("countryCode", country.code, {
                                shouldValidate: true,
                              });
                              setOpenCountryBox(false);
                              setSearchQuery("");
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-blue-50 dark:hover:bg-white/10 text-left cursor-pointer",
                              watch("countryCode") === country.code
                                ? "bg-blue-50/80 dark:bg-white/10 text-[#2563eb] dark:text-blue-400 font-bold"
                                : "text-slate-700 dark:text-slate-200",
                            )}
                          >
                            <span className="flex items-center gap-2 truncate">
                              {country.flag && (
                                <span className="text-sm shrink-0">
                                  {country.flag}
                                </span>
                              )}
                              <span className="font-semibold shrink-0">
                                +{country.code}
                              </span>
                              <span className="truncate text-slate-600 dark:text-slate-300">
                                {country.name}
                              </span>
                            </span>
                            {watch("countryCode") === country.code && (
                              <Check className="h-3.5 w-3.5 text-[#2563eb] dark:text-blue-400 shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="relative flex-1 flex items-center">
                  <Phone
                    size={16}
                    className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none"
                  />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="XXXXXXXXXX"
                    maxLength={12}
                    onInput={enforceNumeric}
                    className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    aria-invalid={!!errors.phoneNumber}
                    {...register("phoneNumber")}
                  />
                </div>
              </div>
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.phoneNumber.message}
                </p>
              )}
              {errors.countryCode && !errors.phoneNumber && (
                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.countryCode.message}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5 w-4 h-4 shrink-0">
                  <input
                    id="accept_terms"
                    type="checkbox"
                    className="peer sr-only"
                    {...register("terms_and_conditions_checkbox")}
                  />
                  <div className="absolute inset-0 rounded border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:bg-[#2563eb] transition-all bg-white dark:bg-white/5" />
                  <Check
                    size={12}
                    className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  {t("accept", "Accept")}{" "}
                  <Link
                    to="/terms-and-conditions"
                    className="font-medium text-[#2563eb] dark:text-blue-400 hover:underline cursor-pointer inline"
                  >
                    {t(
                      "term_cond",
                      t("terms_and_conditions", "Terms and Conditions"),
                    )}
                  </Link>{" "}
                  <span className="text-[#e65625]">*</span>
                </span>
              </label>
              {errors.terms_and_conditions_checkbox && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 -mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.terms_and_conditions_checkbox.message}
                </p>
              )}

              {/* Device Check */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5 w-4 h-4 shrink-0">
                  <input
                    id="removing_customer_check"
                    type="checkbox"
                    className="peer sr-only"
                    {...register("removing_customer_check")}
                  />
                  <div className="absolute inset-0 rounded border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:bg-[#2563eb] transition-all bg-white dark:bg-white/5" />
                  <Check
                    size={12}
                    className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  {t(
                    "agreement",
                    "I agree that enrolling a new customer will remove the existing account linked on this device.",
                  )}{" "}
                  <span className="text-[#e65625]">*</span>
                </span>
              </label>
              {errors.removing_customer_check && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 -mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.removing_customer_check.message}
                </p>
              )}
            </div>

            {/* Cross App Consent Radio */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5 leading-relaxed">
                {t(
                  "crossAppConsent",
                  "Do you agree that your email and phone number may be used for both the Merchant and Consumer Wallet apps?",
                )}
              </label>
              <div className="flex items-center gap-6">
                {[
                  { value: "Y", label: t("yes", "Yes") },
                  { value: "N", label: t("no", "No") },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      value={value}
                      className="peer sr-only"
                      {...register("appConsent")}
                    />
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:border-4 transition-all bg-white dark:bg-white/5" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.appConsent && (
                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.appConsent.message}
                </p>
              )}
            </div>

            {/* Submit / Next Button */}
            <GlobalButton
              type="submit"
              variant="primary"
              fullWidth
              className="mt-6 uppercase font-bold tracking-wider"
            >
              {t("buttonNext", t("next", "NEXT"))}
            </GlobalButton>
          </form>

          {/* Sign In Link */}
          <p className="mt-7 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("already_have_account", "Already have an account?")}{" "}
            <Link
              to="/"
              className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline uppercase"
            >
              {t("authenticateSignIn", "SIGN IN")}
            </Link>
          </p>
        </div>
      )}

      {/* ── STEP 2: CONFIRM DETAILS ──────────────────────────────────────── */}
      {step === "confirm" && (
        <div className="w-full bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 animate-[fade-up_0.4s_ease-out_both]">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">
            {t("confirm_details", "Confirm Details")}
          </h2>

          <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/10 mb-8">
            {/* Store Name */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-blue-50/60 dark:bg-white/5 gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-1/2">
                {t("storeName", "Store Name")}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/2 text-left sm:text-right font-medium">
                {formValues.storeName}
              </span>
            </div>

            {/* Business Email */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-white dark:bg-[#131c31] gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-1/2">
                {t("merCrEmail", "Business Email Address")}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/2 text-left sm:text-right font-medium break-all">
                {formValues.emailID}
              </span>
            </div>

            {/* Business Phone */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-blue-50/60 dark:bg-white/5 gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-1/2">
                {t("merCrPhoneNo", "Business Phone Number")}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/2 text-left sm:text-right font-medium">
                +{formValues.countryCode} {formValues.phoneNumber}
              </span>
            </div>

            {/* Cross App Consent */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-white dark:bg-[#131c31] gap-1">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-2/3 leading-relaxed">
                {t(
                  "crossAppConsent",
                  "Do you agree that your email and phone number may be used for both the Merchant and Consumer Wallet apps?",
                )}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/3 text-left sm:text-right font-semibold">
                {formValues.appConsent === "Y"
                  ? t("yes", "Yes")
                  : t("no", "No")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <GlobalButton
              type="button"
              variant="outline"
              onClick={() => setStep("form")}
              disabled={isSubmitting}
              className="flex-1 uppercase font-bold"
            >
              {t("buttonCancel", t("back", "BACK"))}
            </GlobalButton>
            <GlobalButton
              type="button"
              variant="primary"
              onClick={handleRegisterSubmit}
              isLoading={isSubmitting}
              loadingText={t("submitting", "Submitting…")}
              className="flex-1 uppercase font-bold"
            >
              {t("buttonSubmit", t("submit", "SUBMIT"))}
            </GlobalButton>
          </div>
        </div>
      )}

      {/* ── STEP 3: VERIFY REGISTRATION (OTP) ────────────────────────────── */}
      {step === "otp" && (
        <div className="w-full bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-10 text-center animate-[fade-up_0.4s_ease-out_both]">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1b55ad] dark:text-blue-400 mb-3">
            {t("verify_registration", "Verify Registration")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8 max-w-[340px] mx-auto leading-relaxed">
            {t(
              "otp_text",
              "We have just sent you a One-time PIN via SMS and to your email.",
            )}
          </p>

          {/* 6 Standalone Individual Rounded Boxes for OTP */}
          <div className="flex justify-center mb-8">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(val) => setOtpCode(val)}
              containerClassName="justify-center"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold rounded-xl border border-slate-200 dark:border-white/20 data-[active=true]:border-[#2563eb] dark:data-[active=true]:border-blue-500 data-[active=true]:ring-2 data-[active=true]:ring-[#2563eb]/20 bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-sm transition-all"
                  />
                ))}
              </div>
            </InputOTP>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <GlobalButton
              type="button"
              variant="primary"
              onClick={handleVerifyOTP}
              isLoading={isSubmitting}
              loadingText={t("verifying", "Verifying…")}
              className="flex-1 max-w-[160px] uppercase font-bold"
            >
              {t("buttonContinue", "CONTINUE")}
            </GlobalButton>
            <GlobalButton
              type="button"
              variant="outline"
              onClick={() => setStep("confirm")}
              className="flex-1 max-w-[160px] uppercase font-bold"
            >
              {t("buttonCancel", "CANCEL")}
            </GlobalButton>
          </div>

          {/* Resend Link */}
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("otp_notReceive", "Didn't receive code?")}{" "}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isSubmitting}
              className="font-bold text-[#e65625] hover:underline ml-1 cursor-pointer disabled:opacity-50"
            >
              {t("otp_resend", "Resend Code")}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: REGISTRATION SUCCESSFUL ───────────────────────────────── */}
      {step === "success" && (
        <div className="w-full bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-8 sm:p-12 text-center animate-[fade-up_0.4s_ease-out_both] flex flex-col items-center">
          {/* Big Check Circle */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#1b55ad] text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
            <Check size={48} strokeWidth={3} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t("registration_successful", "Registration Successful")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[340px] leading-relaxed mb-8">
            {successMessage ||
              t(
                "verification_link_sent_email",
                "Please check your email for verification link and upload documents to process your request.",
              )}
          </p>

          <GlobalButton
            type="button"
            variant="primary"
            onClick={() => navigate("/")}
            className="w-full max-w-[200px] uppercase font-bold"
          >
            {t("back_to_login", "BACK TO LOGIN")}
          </GlobalButton>
        </div>
      )}
    </div>
  );
}
