import { useLanguage } from "@/components/globals/LanguageProvider";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1220] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-10 animate-[fade-up_0.4s_ease-out]">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-[#2563eb] dark:text-blue-400">
              <Lock size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t("privacy_policy", "Privacy Policy")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: August 2026
              </p>
            </div>
          </div>
          <Link to="/">
            <GlobalButton variant="outline" className="h-9 px-3 text-xs gap-1.5">
              <ArrowLeft size={14} />
              {t("buttonBack", t("back", "Back"))}
            </GlobalButton>
          </Link>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-white text-base">
            {t("privacy_statement_title", "mPay Network Privacy Statement")}
          </p>
          <p>
            {t(
              "privacy_intro",
              "Your privacy and data protection are paramount. This Privacy Policy details how mPay Network collects, safeguards, and utilizes merchant and transaction information."
            )}
          </p>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              1. {t("privacy_sec_1_title", "Information We Collect")}
            </h3>
            <p>
              {t(
                "privacy_sec_1_desc",
                "We collect store details, registered email address, phone number, and transaction logs required to provide secure settlement and merchant payment processing."
              )}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              2. {t("privacy_sec_2_title", "Data Protection & Encryption")}
            </h3>
            <p>
              {t(
                "privacy_sec_2_desc",
                "All sensitive communications and API payloads are encrypted using standard SHA-256 cryptographic signatures and HTTPS TLS protocols."
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <Link to="/">
            <GlobalButton variant="primary" className="px-6 text-xs font-bold uppercase">
              {t("authenticateSignIn", "Sign In")}
            </GlobalButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
