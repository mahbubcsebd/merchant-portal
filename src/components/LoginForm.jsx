import { useLanguage } from '@/components/globals/LanguageProvider';
import { loginWithPin, resendOTP, verifyOTP } from '@/lib/api/endpoints';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

import GlobalButton from '@/components/globals/GlobalButton';
import GlobalInput from '@/components/globals/GlobalInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const getFormSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t('usernameRequired', 'User ID / Email Address is required.') })
      .email({ message: t('invalid_email', 'Please enter a valid Email Address.') })
      .max(80, { message: t('email_max_error', 'Email Address cannot exceed 80 characters.') }),
    pin: z
      .string()
      .min(1, { message: t('enter_pin', 'Wallet PIN is required.') })
      .length(6, { message: t('pin_digit_error', 'Wallet PIN must be exactly 6 digits.') })
      .regex(/^[0-9]+$/, { message: t('pin_numeric_error', 'Wallet PIN must contain numbers only.') }),
  });

export function LoginForm() {
  const router = useNavigate();
  const { t } = useLanguage();
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState('');
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');

  const schema = useMemo(() => getFormSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: 'kyeontan154@gmail.com', pin: '111111' },
  });

  const loginMutation = useMutation({
    mutationFn: (values) =>
      loginWithPin({ username: values.email, pin: values.pin }),
    onSuccess: (data) => {
      // Based on portal-old logic
      if (data.status === 'success') {
        console.log('Login Success Data:', data);
        if (data.show_otp) {
          setShowOtpDialog(true);
        } else {
          localStorage.setItem('is_authenticated', 'true');
          router('/dashboard');
        }
      } else {
        // Handle error returned in success body (common in older APIs)
        setError('root.serverError', {
          type: 'manual',
          message: data.message || t('invalid_credentials_try_again', 'Invalid credentials. Please try again.'),
        });
      }
    },
    onError: (error) => {
      setError('root.serverError', {
        type: 'manual',
        message:
          error?.response?.data?.message ||
          t('server_connection_error', 'Something went wrong connecting to the server.'),
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (values) => verifyOTP({ otp: values.otp }),
    onSuccess: (data) => {
      if (data.status === 'success' && data.statusCode === 0) {
        console.log('OTP Verification Success Data:', data);
        localStorage.setItem('is_authenticated', 'true');
        setShowOtpDialog(false);
        router('/dashboard');
      } else {
        setOtpError(true);
        setOtpErrorMessage(
          data.message || t('invalid_otp_code', 'Invalid OTP code. Please try again.'),
        );
        setTimeout(() => {
          setOtpValue('');
        }, 800);
      }
    },
    onError: (error) => {
      setOtpError(true);
      setOtpErrorMessage(
        error?.response?.data?.message || t('otp_verify_failed_try_again', 'Something went wrong verifying OTP.'),
      );
      setTimeout(() => {
        setOtpValue('');
      }, 800);
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: () => resendOTP({ custType: 'C' }),
    onSuccess: (data) => {
      setOtpValue('');
      setOtpError(false);
      if (data.status === 'success' || data.statusCode === 0) {
        setResendSuccessMsg(
          data.message || 'The OTP has been successfully resent.',
        );
        setTimeout(() => setResendSuccessMsg(''), 5000);
      } else {
        setOtpError(true);
        setOtpErrorMessage(
          data.message || 'Failed to resend OTP. Please try again.',
        );
      }
    },
    onError: (error) => {
      setOtpError(true);
      setOtpErrorMessage(
        error?.response?.data?.message ||
          'Failed to resend OTP. Please try again.',
      );
    },
  });

  async function onSubmit(values) {
    // Clear any previous root errors
    setError('root.serverError', { type: 'manual', message: '' });
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
      <div className="mb-8 xl:mb-10 animate-[fade-up_0.4s_ease-out_both]">
        <h2 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          {t('authenticateTitle', t('wallet_pin_login', t('welcome_back', 'Welcome back')))}
        </h2>
        <p className="mt-2 text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {t(
            'authenticateSubTitle',
            t('enter_pin_to_continue', 'Sign in to your Merchant Portal account')
          )}
        </p>
      </div>

      {/* ── Form ────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 animate-[fade-up_0.5s_ease-out_0.1s_both]"
        noValidate
      >
        {/* Email */}
        <GlobalInput
          id="email"
          type="email"
          label={t('crEmail', t('authenticateUserID', 'Email Address'))}
          required
          placeholder="merchant@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          {...register('email')}
        />

        {/* PIN */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="pin"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('crPassword', t('enter_your_pin', 'Wallet PIN'))}{' '}
              <span className="text-[#e65625]">*</span>
            </label>
            <Link
              to="/forgot-pin"
              className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 hover:underline underline-offset-2"
            >
              {t('beforeLoginForgotPIN', t('forget_wallet_pin', 'Forgot PIN?'))}
            </Link>
          </div>
          <GlobalInput
            id="pin"
            type="password"
            placeholder="••••••"
            maxLength={6}
            leftIcon={<Lock size={16} />}
            error={errors.pin?.message}
            aria-invalid={!!errors.pin}
            {...register('pin')}
          />
        </div>

        {/* Server Error Alert */}
        {errors.root?.serverError?.message && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 mt-2 animate-[fade-in_0.2s_ease-out]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {errors.root.serverError.message}
          </p>
        )}

        {/* Submit */}
        <GlobalButton
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loginMutation.isPending}
          loadingText={t('verifying', 'Signing in…')}
          className="mt-2"
        >
          {t('authenticateSignIn', 'SIGN IN')}
        </GlobalButton>
      </form>

      {/* ── Bottom link ─────────────────────────── */}
      <p className="mt-8 xl:mt-10 text-center text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400 animate-[fade-up_0.6s_ease-out_0.2s_both]">
        {t('dont_have_account', "Don't have an account?")}{' '}
        <Link
          to="/enroll"
          className="font-bold text-[#2563eb] dark:text-blue-400 hover:text-[#1d4ed8] dark:hover:text-blue-300 hover:underline transition-colors capitalize"
        >
          {t('merNewToMobileBanking', t('registerMerchant', 'Merchant Registration'))}
        </Link>
      </p>

      {/* ── OTP Confirmation Dialog ───────────────── */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0f1829] border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="text-xl font-bold text-[#2563eb] dark:text-blue-400 mb-2">
              {t(
                'verify_registration',
                t('otp_confirm_title', 'Confirmation OTP'),
              )}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[300px] leading-relaxed">
              {t(
                'otp_text',
                'We have just sent you a One-time PIN via SMS and to your email.',
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="my-8">
            <div className={otpError ? 'animate-shake' : ''}>
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
                disabled={
                  verifyOTPMutation.isPending || resendOTPMutation.isPending
                }
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
            {otpError && (
              <p className="text-red-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {otpErrorMessage || 'Invalid OTP code. Please try again.'}
              </p>
            )}
            {resendSuccessMsg && (
              <p className="text-emerald-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {resendSuccessMsg}
              </p>
            )}
            {verifyOTPMutation.isPending && (
              <p className="text-blue-500 text-xs font-semibold mt-3 animate-[fade-in_0.2s_ease-out]">
                {t('verifying', 'Verifying...')}
              </p>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            <span>{t('otp_notReceive', "Didn't receive code?")}</span>
            <button
              type="button"
              disabled={resendOTPMutation.isPending}
              className="font-bold text-[#2563eb] dark:text-blue-400 hover:underline underline-offset-2 ml-1.5 cursor-pointer disabled:opacity-50"
              onClick={() => {
                setResendSuccessMsg('');
                resendOTPMutation.mutate();
              }}
            >
              {resendOTPMutation.isPending
                ? t('verifying', 'Resending...')
                : t('otp_resend', 'Resend Code')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
