import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginWithPin, verifyOTP } from "@/lib/api/endpoints";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "kyeontan154@gmail.com", pin: "444444" },
  });

  const loginMutation = useMutation({
    mutationFn: (values) =>
      loginWithPin({ username: values.email, pin: values.pin }),
    onSuccess: (data) => {
      // Based on portal-old logic
      if (data.status === "success") {
        console.log("Login Success Data:", data);
        if (data.show_otp) {
          setShowOtpDialog(true);
        } else {
          router("/dashboard");
        }
      } else {
        // Handle error returned in success body (common in older APIs)
        setError("root.serverError", {
          type: "manual",
          message: data.message || "Invalid credentials. Please try again.",
        });
      }
    },
    onError: (error) => {
      setError("root.serverError", {
        type: "manual",
        message:
          error?.response?.data?.message ||
          "Something went wrong connecting to the server.",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (values) => verifyOTP({ otp: values.otp }),
    onSuccess: (data) => {
      if (data.status === "success" && data.statusCode === 0) {
        console.log("OTP Verification Success Data:", data);
        setShowOtpDialog(false);
        router("/dashboard");
      } else {
        setOtpError(true);
        setOtpErrorMessage(
          data.message || "Invalid OTP code. Please try again.",
        );
        setTimeout(() => {
          setOtpValue("");
        }, 800);
      }
    },
    onError: (error) => {
      setOtpError(true);
      setOtpErrorMessage(
        error?.response?.data?.message || "Something went wrong verifying OTP.",
      );
      setTimeout(() => {
        setOtpValue("");
      }, 800);
    },
  });

  async function onSubmit(values) {
    // Clear any previous root errors
    setError("root.serverError", { type: "manual", message: "" });
    loginMutation.mutate(values);
  }
  return (
    <div className="w-full">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {/* ── Heading ─────────────────────────────── */}
      <div className="mb-9 animate-[fade-up_0.4s_ease-out_both]">
        <h2
          className="
          text-3xl xl:text-4xl
          font-bold tracking-tight
          text-slate-900 dark:text-white
          leading-[1.1]
        "
        >
          Welcome back
        </h2>
        <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Sign in to your Merchant Portal
        </p>
      </div>

      {/* ── Form ────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 xl:space-y-6 animate-[fade-up_0.5s_ease-out_0.1s_both]"
        noValidate
      >
        {errors.root?.serverError?.message && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
            {errors.root.serverError.message}
          </div>
        )}

        {/* Email */}
        <GlobalInput
          id="email"
          type="email"
          label="Email Address"
          placeholder="merchant@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />

        {/* PIN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Wallet PIN
            </span>
            <Link
              to="/forgot-pin"
              className="text-xs xl:text-sm font-semibold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Forgot PIN?
            </Link>
          </div>
          <GlobalInput
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="••••••"
            maxLength="6"
            leftIcon={<Lock size={16} />}
            inputClassName="tracking-[0.3em] placeholder:tracking-widest"
            error={errors.pin?.message}
            aria-invalid={!!errors.pin}
            aria-describedby={errors.pin ? "pin-error" : undefined}
            {...register("pin")}
          />
        </div>

        {/* Submit */}
        <GlobalButton
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loginMutation.isPending}
          loadingText="Signing in…"
          className="mt-2"
        >
          Sign In
        </GlobalButton>
      </form>

      {/* ── Bottom link ─────────────────────────── */}
      <p className="mt-8 xl:mt-10 text-center text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 animate-[fade-up_0.6s_ease-out_0.2s_both]">
        Don&apos;t have an account?{" "}
        <Link
          to="/enroll"
          className="font-bold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] dark:hover:text-blue-300 hover:underline transition-colors"
        >
          Enroll as Merchant
        </Link>
      </p>

      {/* ── OTP Confirmation Dialog ───────────────── */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0f1829] border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-xl font-bold text-[#2563eb] dark:text-blue-400 mb-2">
              Confirmation OTP
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[300px] leading-relaxed">
              We have just sent you a One-time PIN via SMS and to your email.
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
                disabled={verifyOTPMutation.isPending}
              >
                <InputOTPGroup className="gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={`w-11 h-12 text-lg font-bold rounded-lg border ${otpError ? "border-red-500 bg-red-500/5" : "border-slate-200 dark:border-white/10"} shadow-sm bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white !ring-0 data-[active=true]:border-[#2563eb] dark:data-[active=true]:border-blue-500 transition-all`}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {otpError && (
              <p className="text-red-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {otpErrorMessage || "Invalid OTP code. Please try again."}
              </p>
            )}
            {verifyOTPMutation.isPending && (
              <p className="text-blue-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                Verifying...
              </p>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            <span>Didn't receive code?</span>
            <button
              type="button"
              className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline underline-offset-2 ml-1.5"
              onClick={() => {
                setOtpValue("");
                setOtpError(false);
              }}
            >
              Resend Code
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
