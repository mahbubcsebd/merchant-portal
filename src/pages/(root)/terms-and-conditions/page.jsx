import { useLanguage } from "@/components/globals/LanguageProvider";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";

export default function TermsAndConditionsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1220] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-10 animate-[fade-up_0.4s_ease-out]">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-[#2563eb] dark:text-blue-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t("terms_and_conditions", "Terms and Conditions")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: August 2026
              </p>
            </div>
          </div>
          <Link to="/">
            <GlobalButton variant="outline" className="h-9 px-3 text-xs gap-1.5">
              <ArrowLeft size={14} />
              {t("back", "Back")}
            </GlobalButton>
          </Link>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-white text-base">
            mPay Merchant Account Service Agreement
          </p>
          <p>
            {t(
              "terms_intro",
              "By creating or operating a Merchant Account on the mPay Network platform, you agree to adhere to all terms, operational guidelines, and regulatory requirements outlined below."
            )}
          </p>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              1. {t("terms_sec_1_title", "Account Enrollment & Device Consent")}
            </h3>
            <p>
              {t(
                "device_consent_text",
                "Enrolling a new merchant account on this device will remove the existing customer account linked to this device. You represent that you have legal authority to operate the merchant store account."
              )}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              2. {t("terms_sec_2_title", "Security & Wallet PIN")}
            </h3>
            <p>
              {t(
                "terms_sec_2_desc",
                "You are responsible for keeping your 6-digit Wallet PIN and login credentials safe. mPay will never ask for your PIN via phone or email."
              )}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              3. {t("terms_sec_3_title", "Cross-App & Transaction Consent")}
            </h3>
            <p>
              {t(
                "app_consent_question",
                "Do you agree that your email and phone number may be used for both the Merchant and Consumer Wallet apps?"
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <Link to="/enroll">
            <GlobalButton variant="primary" className="px-6 text-xs font-bold uppercase">
              {t("buttonContinue", "Continue to Registration")}
            </GlobalButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
