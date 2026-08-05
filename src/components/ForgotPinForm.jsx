import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Calendar as CalendarIcon, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { buttonVariants } from "@/components/ui/button"
import GlobalButton from "@/components/globals/GlobalButton"
import GlobalInput from "@/components/globals/GlobalInput"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { forgotPin } from "@/lib/api/endpoints"
import { useDialog } from "@/components/globals/DialogProvider"
import { useLanguage } from "@/components/globals/LanguageProvider"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  dob: z.date({ required_error: "Date of Birth is required." }),
})

export function ForgotPinForm() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")
  const { openConfirmDialog } = useDialog()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  const dobValue = watch("dob")

  async function onSubmit(values) {
    setIsSubmitting(true)
    setApiError("")
    try {
      const formattedDob = format(values.dob, "dd/MM/yyyy")
      const payload = {
        email: values.email,
        dateOfBirth: formattedDob,
        custType: "C",
      }

      const res = await forgotPin(payload)

      if (res?.status === "success" || res?.statusCode === 0) {
        openConfirmDialog({
          title: t("request_submitted", "Request Submitted"),
          description: res?.message || t("forgot_pin_success_desc", "If the details match, instructions to reset your PIN have been sent to your email."),
          confirmText: t("back_to_login", t("authenticateSignIn", "Back to Login")),
          iconType: "success",
          hideCancel: true,
          onConfirm: () => {
            reset()
            navigate("/")
          },
        })
      } else {
        setApiError(res?.message || t("invalid_details_try_again", "Invalid details. Please try again"))
      }
    } catch (err) {
      setApiError(err?.message || t("something_went_wrong_try_again", "Something went wrong. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8 animate-[fade-up_0.4s_ease-out_both]">
        <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          {t("beforeLoginForgotPIN", t("changePassword", "Forgot Wallet PIN"))}
        </h2>
        <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {t("forgot_pin_subtitle", "Enter your registered email address and date of birth to reset your PIN.")}
        </p>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-600 dark:text-red-400 animate-[fade-up_0.3s_ease-out]">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{apiError}</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 animate-[fade-up_0.5s_ease-out_0.1s_both]"
        noValidate
      >
        {/* Email */}
        <GlobalInput
          id="email"
          type="email"
          label={t("merCrEmail", t("crEmail", "Email Address"))}
          required
          placeholder="business@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          {...register("email")}
        />

        {/* Date of Birth */}
        <div className="space-y-2">
          <label htmlFor="dob" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("crDateOfBirth", t("date_of_birth", "Date of Birth"))} <span className="text-[#e65625]">*</span>
          </label>
          <div className="relative w-full flex">
            <CalendarIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full pl-10 h-11 text-sm font-medium justify-start text-left bg-white dark:bg-white/5 border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all duration-150 shadow-none",
                  !dobValue ? "text-slate-400 font-normal" : "text-slate-900 dark:text-white"
                )}
              >
                {dobValue ? format(dobValue, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dobValue}
                  onSelect={(date) => {
                    setValue("dob", date, { shouldValidate: true })
                    setApiError("")
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  captionLayout="dropdown"
                  fromYear={1930}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.dob && (
            <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.dob.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <GlobalButton
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          loadingText={t("submitting", "Submitting…")}
          className="mt-2"
        >
          {t("buttonSubmit", t("submit", "Submit"))}
        </GlobalButton>
      </form>

      {/* Bottom link */}
      <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 animate-[fade-up_0.6s_ease-out_0.2s_both]">
        {t("remembered_pin", "Remembered your PIN?")}{" "}
        <Link
          to="/"
          className="font-bold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] hover:underline transition-colors"
        >
          {t("back_to_login", t("authenticateSignIn", "Sign In"))}
        </Link>
      </p>
    </div>
  )
}
