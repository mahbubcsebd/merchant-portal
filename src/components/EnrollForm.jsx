
import GlobalButton from '@/components/globals/GlobalButton';
import GlobalInput from '@/components/globals/GlobalInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Check, Mail, Phone } from 'lucide-react';
import { Link } from "react-router-dom";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react';

const formSchema = z.object({
  storeName: z
    .string()
    .min(2, { message: 'Store name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  countryCode: z.string().min(1, { message: 'Select a country code.' }),
  phone: z.string().min(7, { message: 'Enter a valid phone number.' }),
  acceptTerms: z
    .boolean()
    .refine((v) => v === true, {
      message: 'You must accept the Terms and Conditions.',
    }),
  acceptDevice: z.boolean(),
  dataConsent: z.enum(['yes', 'no'], {
    required_error: 'Please select an option.',
  }),
});

const COUNTRY_CODES = [
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
];

export function EnrollForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCountryBox, setOpenCountryBox] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: '',
      email: '',
      countryCode: '+880',
      phone: '',
      acceptTerms: false,
      acceptDevice: false,
      dataConsent: undefined,
    },
  });

  const acceptTerms = watch('acceptTerms');
  const acceptDevice = watch('acceptDevice');
  const dataConsent = watch('dataConsent');

  async function onSubmit(values) {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    console.log('mPay Merchant Enroll →', values);
    setIsSubmitting(false);
  }

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8 animate-[fade-up_0.4s_ease-out_both]">
        <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Create account
        </h2>
        <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Register your business on mPay Merchant Portal
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
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
          label="Business Email"
          required
          placeholder="business@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          {...register('email')}
        />

        {/* Phone */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Business Phone <span className="ml-1 text-[#e65625]">*</span>
          </label>
          <div
            className={cn(
              "flex items-stretch w-full h-10 rounded-lg border bg-slate-50 dark:bg-white/5 transition-all duration-150 overflow-hidden",
              errors.phone
                ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                : "border-slate-200 dark:border-white/10 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20"
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
                          (c) => c.code === watch('countryCode'),
                        )?.flag
                      }
                    </span>
                    <span>{watch('countryCode')}</span>
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
                                : 'opacity-0',
                            )}
                          />
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>
                              {country.country} ({country.code})
                            </span>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="relative flex-1 flex items-center">
              <Phone size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
            </div>
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1.5 animate-[fade-in_0.2s_ease-out]">
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
              <div className="absolute inset-0 rounded border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:bg-[#2563eb] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563eb]/30 transition-all bg-white dark:bg-white/5 group-hover:border-[#2563eb]/50" />
              <Check
                size={12}
                className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                strokeWidth={3}
              />
            </div>
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
              I accept the{' '}
              <Link
                to="/terms-and-conditions"
                className="font-medium text-[#2563eb] dark:text-blue-400 hover:underline"
              >
                Terms and Conditions
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 -mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.acceptTerms.message}
            </p>
          )}

          {/* Device */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5 w-4 h-4 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                {...register('acceptDevice')}
              />
              <div className="absolute inset-0 rounded border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-checked:bg-[#2563eb] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563eb]/30 transition-all bg-white dark:bg-white/5 group-hover:border-[#2563eb]/50" />
              <Check
                size={12}
                className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                strokeWidth={3}
              />
            </div>
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
              I agree that enrolling a new merchant will remove any existing
              account linked to this device.
            </span>
          </label>
        </div>

        {/* Data Consent */}
        <div className="space-y-2.5 pt-1">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Do you agree that your email and phone may be used for both the
            Merchant and Consumer Wallet apps?
          </p>
          <div className="flex gap-4">
            {['yes', 'no'].map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  <input
                    type="radio"
                    value={opt}
                    className="peer sr-only"
                    {...register('dataConsent')}
                  />
                  <div className="absolute inset-0 rounded-full border border-slate-300 dark:border-white/20 peer-checked:border-[#2563eb] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563eb]/30 transition-all bg-white dark:bg-white/5 group-hover:border-[#2563eb]/50" />
                  <div className="w-2 h-2 rounded-full bg-[#2563eb] absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-sm font-normal text-slate-600 dark:text-slate-300 capitalize">
                  {opt === 'yes' ? 'Yes' : 'No'}
                </span>
              </label>
            ))}
          </div>
          {errors.dataConsent && (
            <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errors.dataConsent.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <GlobalButton
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          loadingText="Processing…"
          className="mt-2"
        >
          Next →
        </GlobalButton>
      </form>

      {/* Bottom link */}
      <p className="mt-7 text-center text-sm font-medium text-slate-500 dark:text-slate-400 animate-[fade-up_0.6s_ease-out_0.2s_both]">
        Already have an account?{' '}
        <Link
          to="/"
          className="font-bold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
