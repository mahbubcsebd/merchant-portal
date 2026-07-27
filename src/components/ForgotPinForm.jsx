
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Calendar as CalendarIcon } from "lucide-react"
import { Link } from "react-router-dom";
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

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  dob: z.date({ required_error: "Date of Birth is required." }),
})

export function ForgotPinForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  const dobValue = watch("dob")

  async function onSubmit(values) {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    console.log("mPay Merchant Forgot PIN →", values)
    setIsSubmitting(false)
  }

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8 animate-[fade-up_0.4s_ease-out_both]">
        <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Reset Wallet PIN
        </h2>
        <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Enter your details to receive a reset link
        </p>
      </div>

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
          label="Email Address"
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
            Date of Birth <span className="text-[#e65625]">*</span>
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
                {dobValue ? format(dobValue, "PPP") : <span>mm/dd/yyyy</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dobValue}
                  onSelect={(date) => setValue("dob", date, { shouldValidate: true })}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
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
          loadingText="Submitting…"
          className="mt-2"
        >
          Submit
        </GlobalButton>
      </form>

      {/* Bottom link */}
      <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 animate-[fade-up_0.6s_ease-out_0.2s_both]">
        Remembered your PIN?{" "}
        <Link
          to="/"
          className="font-bold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
