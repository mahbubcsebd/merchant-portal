import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginWithPin, verifyOTP, resendOTP } from "@/lib/api/endpoints";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { cn } from "@/lib/utils";

import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  pin: z.string().min(4, { message: "PIN must be at least 4 digits." }),
});

export function LoginForm() {
  const router = useNavigate();
  const { t } = useLanguage();
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "mahbub.cse.me@gmail.com",
      pin: "111111",
    },
  });

  // Step 1: Login Mutation
  const loginMutation = useMutation({
    mutationFn: (data) =>
      loginWithPin({
        emailID: data.email,
        walletPIN: data.pin,
      }),
    onSuccess: (res) => {
      setApiError("");
      if (res?.status === "success" || res?.statusCode === 0) {
        if (res?.data?.show_otp) {
          setShowOtpDialog(true);
        } else {
          localStorage.setItem("is_authenticated", "true");
          router("/dashboard");
        }
      } else {
        setApiError(res?.message || t("login_failed", "Invalid email or PIN. Please check your credentials."));
      }
    },
    onError: (err) => {
      setApiError(err?.message || t("something_went_wrong_try_again", "Something went wrong. Please try again."));
    },
  });

  // Step 2: Verify OTP Mutation
  const verifyOTPMutation = useMutation({
    mutationFn: (data) =>
      verifyOTP({
        otp: data.otp,
        emailID: getValues("email"),
      }),
    onSuccess: (res) => {
      if (res?.status === "success" || res?.statusCode === 0) {
        setShowOtpDialog(false);
        localStorage.setItem("is_authenticated", "true");
        router("/dashboard");
      } else {
        setOtpError(true);
        setOtpErrorMessage(res?.message || t("invalid_otp_code", "Invalid OTP code. Please try again."));
      }
    },
    onError: (err) => {
      setOtpError(true);
      setOtpErrorMessage(err?.message || t("otp_verification_failed", "OTP verification failed."));
    },
  });

  // Step 3: Resend OTP Mutation
  const resendOTPMutation = useMutation({
    mutationFn: () =>
      resendOTP({
        emailID: getValues("email"),
      }),
    onSuccess: (res) => {
      if (res?.status === "success" || res?.statusCode === 0) {
        setResendSuccessMsg(res?.message || t("otp_resent_success", "The OTP has been successfully resent."));
        setTimeout(() => setResendSuccessMsg(""), 5000);
      } else {
        setOtpError(true);
        setOtpErrorMessage(res?.message || t("failed_resend_otp", "Failed to resend OTP."));
      }
    },
    onError: (err) => {
      setOtpError(true);
      setOtpErrorMessage(err?.message || t("failed_resend_otp", "Failed to resend OTP."));
    },
  });

  function onSubmit(values) {
    setApiError("");
    loginMutation.mutate(values);
  }

  return (
    <div className="w-full">
      {/* Form Heading */}
      <div className="mb-8 xl:mb-10 animate-[fade-up_0.4s_ease-out_both]">
        <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          {t("authenticateSignIn", "Sign In")}
        </h2>
        <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {t("login_subtitle", "Welcome back! Please enter your details.")}
        </p>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-600 dark:text-red-400 animate-[fade-up_0.3s_ease-out]">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{apiError}</p>
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 animate-[fade-up_0.5s_ease-out_0.1s_both]"
        noValidate
      >
        {/* Email Address */}
        <GlobalInput
          id="email"
          type="email"
          label={t("crEmail", "Email Address")}
          required
          placeholder="business@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          {...register("email")}
        />

        {/* Wallet PIN */}
        <div className="space-y-1.5">
          <GlobalInput
            id="pin"
            type="password"
            label={t("wallet_pin", "Wallet PIN")}
            required
            placeholder="••••••"
            maxLength={6}
            leftIcon={<Lock size={16} />}
            error={errors.pin?.message}
            aria-invalid={!!errors.pin}
            {...register("pin")}
          />
          <div className="flex justify-end pt-1">
            <Link
              to="/forgot-pin"
              className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] dark:hover:text-blue-300 hover:underline transition-colors"
            >
              {t("beforeLoginForgotPIN", "Forgot Wallet PIN?")}
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <GlobalButton
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loginMutation.isPending}
          loadingText={t("signing_in", "Signing in…")}
          className="mt-2"
        >
          {t("authenticateSignIn", "Sign In")}
        </GlobalButton>
      </form>

      {/* Bottom Link */}
      <p className="mt-8 xl:mt-10 text-center text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 animate-[fade-up_0.6s_ease-out_0.2s_both]">
        {t("dont_have_account", "Don't have an account?")}{" "}
        <Link
          to="/enroll"
          className="font-bold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] dark:hover:text-blue-300 hover:underline transition-colors capitalize"
        >
          {t("registerMerchant", "Merchant Registration").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
        </Link>
      </p>

      {/* ── OTP Confirmation Dialog ───────────────── */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0f1829] border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-xl font-bold text-[#2563eb] dark:text-blue-400 mb-2">
              {t("verify_registration", t("otp_confirm_title", "Confirmation OTP"))}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[300px] leading-relaxed">
              {t("otp_text", "We have just sent you a One-time PIN via SMS and to your email.")}
            </DialogDescription>
          </DialogHeader>

          <div className="my-8">
            <div className={otpError ? "animate-shake" : ""}>
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(val) => {
                  setOtpValue(val);
                  setOtpError(false);
                }}
                onComplete={(val) => {
                  verifyOTPMutation.mutate({ otp: val });
                }}
                disabled={verifyOTPMutation.isPending || resendOTPMutation.isPending}
              >
                <InputOTPGroup className="gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={cn(
                        "w-11 h-12 text-lg font-bold rounded-xl border transition-all shadow-sm bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white",
                        otpError
                          ? "border-red-500 bg-red-500/5 text-red-500"
                          : "border-slate-200 dark:border-white/10 data-[active=true]:border-[#2563eb] dark:data-[active=true]:border-blue-500 data-[active=true]:ring-2 data-[active=true]:ring-[#2563eb]/20"
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {otpError && (
              <p className="text-red-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {otpErrorMessage || t("invalid_otp_code", "Invalid OTP code. Please try again.")}
              </p>
            )}
            {resendSuccessMsg && (
              <p className="text-emerald-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {resendSuccessMsg}
              </p>
            )}
            {verifyOTPMutation.isPending && (
              <p className="text-blue-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {t("verifying", "Verifying...")}
              </p>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            <span>{t("otp_notReceive", "Didn't receive code?")}</span>
            <button
              type="button"
              disabled={resendOTPMutation.isPending}
              className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline underline-offset-2 ml-1.5 cursor-pointer disabled:opacity-50"
              onClick={() => {
                setResendSuccessMsg("");
                resendOTPMutation.mutate();
              }}
            >
              {resendOTPMutation.isPending ? t("verifying", "Resending...") : t("otp_resend", "Resend Code")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
