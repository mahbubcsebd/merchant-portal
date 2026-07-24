"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Lock, Mail } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import GlobalButton from "@/components/globals/GlobalButton"
import GlobalInput from "@/components/globals/GlobalInput"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  pin: z.string().min(4, { message: "PIN must be at least 4 digits." }),
})

export function LoginForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", pin: "" },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    console.log("mPay Merchant Login →", values)
    setIsSubmitting(false)

    // Trigger OTP for any valid login (for demo purposes)
    // Or specifically for a demo user
    if (values.email) {
      setShowOtpDialog(true)
    }
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
        <h2 className="
          text-3xl xl:text-4xl
          font-bold tracking-tight
          text-slate-900 dark:text-white
          leading-[1.1]
        ">
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
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Wallet PIN</span>
            <Link
              href="/forgot-pin"
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
          isLoading={isSubmitting}
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
          href="/enroll"
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
                  setOtpValue(val)
                  setOtpError(false)
                }}
                onComplete={(val) => {
                  if (val === "123456") {
                    router.push("/dashboard")
                  } else {
                    setOtpError(true)
                    // Automatically clear value on error after a brief visual shake feedback
                    setTimeout(() => {
                      setOtpValue("")
                    }, 800)
                  }
                }}
              >
                <InputOTPGroup className="gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className={`w-11 h-12 text-lg font-bold rounded-lg border ${otpError ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-white/10'} shadow-sm bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white !ring-0 data-[active=true]:border-[#2563eb] dark:data-[active=true]:border-blue-500 transition-all`} 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {otpError && <p className="text-red-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">Invalid OTP code. Please try again.</p>}
          </div>

          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            <span>Didn't receive code?</span>
            <button 
              type="button"
              className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline underline-offset-2 ml-1.5"
              onClick={() => {
                setOtpValue("")
                setOtpError(false)
              }}
            >
              Resend Code
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
