import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Check, Mail, Phone, AlertCircle, ChevronsUpDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import GlobalButton from '@/components/globals/GlobalButton';
import GlobalInput from '@/components/globals/GlobalInput';
import { registerMerchant, verifyMerchantOTP } from '@/lib/api/endpoints';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InputOTP,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

const COUNTRY_CODES = [
  { code: '355', flag: '🇦🇱', country: 'Albania (+355)' },
  { code: '1', flag: '🇺🇸', country: 'USA (+1)' },
  { code: '124', flag: '🇨🇦', country: 'Canada (+124)' },
  { code: '880', flag: '🇧🇩', country: 'Bangladesh (+880)' },
  { code: '91', flag: '🇮🇳', country: 'India (+91)' },
  { code: '44', flag: '🇬🇧', country: 'UK (+44)' },
  { code: '93', flag: '🇦🇫', country: 'Afghanistan (+93)' },
  { code: '12', flag: '🇩🇿', country: 'Algeria (+12)' },
  { code: '54', flag: '🇦🇷', country: 'Argentina (+54)' },
  { code: '358', flag: '🇫🇮', country: 'Finland (+358)' },
  { code: '81', flag: '🇯🇵', country: 'Japan (+81)' },
  { code: '92', flag: '🇵🇰', country: 'Pakistan (+92)' },
  { code: '63', flag: '🇵🇭', country: 'Philippines (+63)' },
  { code: '82', flag: '🇰🇷', country: 'South Korea (+82)' },
];

const formSchema = z.object({
  storeName: z
    .string()
    .min(2, { message: 'Store name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  countryCode: z.string().min(1, { message: 'Select a country code.' }),
  phone: z.string().min(6, { message: 'Enter a valid phone number.' }),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: 'You must accept the Terms and Conditions.',
  }),
  acceptDevice: z.boolean().refine((v) => v === true, {
    message: 'You must agree to the device account agreement.',
  }),
  appConsent: z.enum(['Y', 'N'], {
    required_error: 'Please select an option.',
  }),
});

export function EnrollForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'otp' | 'success'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [openCountryBox, setOpenCountryBox] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: '',
      email: '',
      countryCode: '355',
      phone: '',
      acceptTerms: false,
      acceptDevice: false,
      appConsent: 'Y',
    },
  });

  const formValues = watch();

  // Step 1 Form Submission → Move to Step 2 (Confirm Details)
  function onFormSubmit() {
    setApiError('');
    setStep('confirm');
  }

  // Step 2 Confirm Submit → Trigger /walletmc/register API
  async function handleRegisterSubmit() {
    setIsSubmitting(true);
    setApiError('');
    try {
      const values = getValues();
      const payload = {
        storeName: values.storeName,
        emailID: values.email,
        countryCode: values.countryCode,
        phoneNumber: `${values.countryCode}${values.phone}`,
        terms_and_conditions_checkbox: true,
        removing_customer_check: true,
        appConsent: values.appConsent,
        crossAppConsent: values.appConsent,
        phCountryCode: values.countryCode,
        challenge: [],
        custType: 'C',
      };

      const res = await registerMerchant(payload);

      if (res?.status === 'success' || res?.statusCode === 0) {
        setStep('otp');
      } else {
        setApiError(res?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 3 OTP Verification → Trigger /walletmc/verifyMerchantOTP API
  async function handleVerifyOTP() {
    if (!otpCode || otpCode.length < 6) {
      setApiError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    try {
      const values = getValues();
      const payload = {
        otp: otpCode,
        emailID: values.email,
        phoneNumber: `${values.countryCode}${values.phone}`,
        storeName: values.storeName,
        countryCode: values.countryCode,
        phCountryCode: values.countryCode,
        custType: 'C',
      };

      const res = await verifyMerchantOTP(payload);

      if (res?.status === 'success' || res?.statusCode === 0) {
        setSuccessMessage(
          res?.message ||
            'Merchant verification link has been sent to your registered email address. Please check your inbox to complete enrollment.'
        );
        setStep('success');
      } else {
        setApiError(res?.message || 'Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setApiError(err?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Error Alert */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-600 dark:text-red-400 animate-[fade-up_0.3s_ease-out]">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{apiError}</p>
        </div>
      )}

      {/* ── STEP 1: FORM FILL ────────────────────────────────────────────── */}
      {step === 'form' && (
        <div className="w-full">
          {/* Heading */}
          <div className="mb-8 animate-[fade-up_0.4s_ease-out_both]">
            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              MERCHANT REGISTRATION
            </h2>
            <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              Register your business on mPay Merchant Portal
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-5 animate-[fade-up_0.5s_ease-out_0.1s_both]"
            noValidate
          >
            {/* Store Name */}
            <GlobalInput
              id="storeName"
              label="Store Name"
              required
              placeholder="Your Business Name"
              leftIcon={<Building2 size={16} />}
              error={errors.storeName?.message}
              aria-invalid={!!errors.storeName}
              {...register('storeName')}
            />

            {/* Business Email */}
            <GlobalInput
              id="email"
              type="email"
              label="Business Email Address"
              required
              placeholder="business@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              aria-invalid={!!errors.email}
              {...register('email')}
            />

            {/* Phone Number */}
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Business Phone Number <span className="text-[#e65625]">*</span>
              </label>
              <div
                className={cn(
                  'flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 transition-all duration-150 overflow-hidden',
                  errors.phone
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
                    : 'border-slate-200 dark:border-white/10 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20'
                )}
              >
                <Popover open={openCountryBox} onOpenChange={setOpenCountryBox}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={openCountryBox}
                      className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>
                          {
                            COUNTRY_CODES.find(
                              (c) => c.code === watch('countryCode')
                            )?.flag
                          }
                        </span>
                        <span>+{watch('countryCode')}</span>
                      </span>
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_CODES.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.country + ' ' + country.code}
                              onSelect={() => {
                                setValue('countryCode', country.code);
                                setOpenCountryBox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  watch('countryCode') === country.code
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.country}</span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
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
                    placeholder="1886225492"
                    className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    aria-invalid={!!errors.phone}
                    {...register('phone')}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5 w-4 h-4 shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    {...register('acceptTerms')}
                  />
                  <div className="absolute inset-0 rounded border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:bg-[#2563eb] transition-all bg-white dark:bg-white/5" />
                  <Check
                    size={12}
                    className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  Accept{' '}
                  <Link
                    to="/terms-and-conditions"
                    className="font-medium text-[#2563eb] dark:text-blue-400 hover:underline"
                  >
                    Terms and Conditions
                  </Link>{' '}
                  <span className="text-[#e65625]">*</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 -mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.acceptTerms.message}
                </p>
              )}

              {/* Device Check */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5 w-4 h-4 shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    {...register('acceptDevice')}
                  />
                  <div className="absolute inset-0 rounded border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:bg-[#2563eb] transition-all bg-white dark:bg-white/5" />
                  <Check
                    size={12}
                    className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  I agree that enrolling a new customer will remove the existing
                  account linked on this device. <span className="text-[#e65625]">*</span>
                </span>
              </label>
              {errors.acceptDevice && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 -mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errors.acceptDevice.message}
                </p>
              )}
            </div>

            {/* App Consent Radio */}
            <div className="space-y-2.5 pt-2">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                Do you agree that your email and phone number may be used for both
                the Merchant and Consumer Wallet apps?
              </p>
              <div className="flex gap-6">
                {[
                  { label: 'Yes', value: 'Y' },
                  { label: 'No', value: 'N' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                      <input
                        type="radio"
                        value={opt.value}
                        className="peer sr-only"
                        {...register('appConsent')}
                      />
                      <div className="absolute inset-0 rounded-full border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] transition-all bg-white dark:bg-white/5" />
                      <div className="w-2 h-2 rounded-full bg-[#2563eb] absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <GlobalButton
              type="submit"
              variant="primary"
              fullWidth
              className="mt-4"
            >
              Next →
            </GlobalButton>
          </form>

          {/* Sign In Link */}
          <p className="mt-7 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/"
              className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline"
            >
              SIGN IN
            </Link>
          </p>
        </div>
      )}

      {/* ── STEP 2: CONFIRM DETAILS ──────────────────────────────────────── */}
      {step === 'confirm' && (
        <div className="w-full bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 animate-[fade-up_0.4s_ease-out_both]">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">
            Confirm Details
          </h2>

          <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/10 mb-8">
            {/* Store Name */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-blue-50/60 dark:bg-white/5 gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-1/2">
                Store Name
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/2 text-left sm:text-right font-medium">
                {formValues.storeName}
              </span>
            </div>

            {/* Business Email */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-white dark:bg-[#131c31] gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-1/2">
                Business Email Address
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/2 text-left sm:text-right font-medium break-all">
                {formValues.email}
              </span>
            </div>

            {/* Business Phone */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-blue-50/60 dark:bg-white/5 gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-1/2">
                Business Phone Number
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/2 text-left sm:text-right font-medium">
                +{formValues.countryCode} {formValues.phone}
              </span>
            </div>

            {/* Cross App Consent */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 bg-white dark:bg-[#131c31] gap-1">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 sm:w-2/3 leading-relaxed">
                Do you agree that your email and phone number may be used for both
                the Merchant and Consumer Wallet apps?
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:w-1/3 text-left sm:text-right font-semibold">
                {formValues.appConsent === 'Y' ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <GlobalButton
              type="button"
              variant="outline"
              onClick={() => setStep('form')}
              className="flex-1 max-w-[160px] uppercase font-bold"
            >
              CHANGE
            </GlobalButton>
            <GlobalButton
              type="button"
              variant="primary"
              onClick={handleRegisterSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting…"
              className="flex-1 max-w-[160px] uppercase font-bold"
            >
              SUBMIT
            </GlobalButton>
          </div>
        </div>
      )}

      {/* ── STEP 3: VERIFY REGISTRATION (OTP) ────────────────────────────── */}
      {step === 'otp' && (
        <div className="w-full bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-10 text-center animate-[fade-up_0.4s_ease-out_both]">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1b55ad] dark:text-blue-400 mb-3">
            Verify Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8 max-w-[340px] mx-auto leading-relaxed">
            We have just sent you a One-time PIN via SMS and to your email.
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
                    className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-white/20 focus:border-[#2563eb] dark:focus:border-blue-500 bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-sm transition-all !rounded-xl !border-l !border-y !border-r"
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
              loadingText="Verifying…"
              className="flex-1 max-w-[160px] uppercase font-bold"
            >
              CONTINUE
            </GlobalButton>
            <GlobalButton
              type="button"
              variant="outline"
              onClick={() => setStep('confirm')}
              className="flex-1 max-w-[160px] uppercase font-bold"
            >
              CANCEL
            </GlobalButton>
          </div>

          {/* Resend Link */}
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Didn't receive code?{' '}
            <button
              type="button"
              onClick={handleRegisterSubmit}
              className="font-bold text-[#e65625] hover:underline ml-1 cursor-pointer"
            >
              Resend Code
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: REGISTRATION SUCCESSFUL ───────────────────────────────── */}
      {step === 'success' && (
        <div className="w-full bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-8 sm:p-12 text-center animate-[fade-up_0.4s_ease-out_both] flex flex-col items-center">
          {/* Big Check Circle */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#1b55ad] text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
            <Check size={48} strokeWidth={3} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Registration Successful
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[340px] leading-relaxed mb-8">
            {successMessage ||
              'Please check your email for verification link and upload documents to process your request.'}
          </p>

          <GlobalButton
            type="button"
            variant="primary"
            onClick={() => navigate('/')}
            className="px-8 uppercase font-bold text-xs tracking-wider"
          >
            GO TO LOGIN PAGE
          </GlobalButton>
        </div>
      )}
    </div>
  );
}
