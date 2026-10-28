import { useLanguage } from "@/components/globals/LanguageProvider";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, X } from "lucide-react";
import GlobalButton from "@/components/globals/GlobalButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TERMS_AND_CONDITIONS } from "@/lib/constants/termsContent";

export default function TermsAndConditionsPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const langKey = language ? language.toLowerCase() : "en";
  const content = TERMS_AND_CONDITIONS[langKey] || TERMS_AND_CONDITIONS.en;

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1220] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-12 animate-[fade-up_0.4s_ease-out]">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {content.title ||
                  t("terms_and_conditions", "Terms and Conditions")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("official_agreement", "Official Service & User Agreement")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <LanguageSwitcher />
            <GlobalButton
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-8 sm:h-9 px-3 text-xs gap-1.5 rounded-full"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">
                {t("buttonBack", t("back", "Back"))}
              </span>
            </GlobalButton>
          </div>
        </div>

        {/* ── Content Body ──────────────────────────────────── */}
        <div className="space-y-7 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Articles 1 through 13 */}
          {content.articles.map((article, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {article.number}. {article.title}
              </h2>

              {article.paragraphs?.map((p, pIdx) => (
                <p key={pIdx} className="text-slate-600 dark:text-slate-300">
                  {p}
                </p>
              ))}

              {article.list && article.list.length > 0 && (
                <div className="pl-4 sm:pl-6">
                  {article.listType === "alpha" ? (
                    <ol className="list-[lower-alpha] space-y-1.5 pl-4 text-slate-600 dark:text-slate-300">
                      {article.list.map((item, lIdx) => (
                        <li key={lIdx} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : article.listType === "numeric" ? (
                    <ol className="list-decimal space-y-1.5 pl-4 text-slate-600 dark:text-slate-300">
                      {article.list.map((item, lIdx) => (
                        <li key={lIdx} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="list-disc space-y-1.5 pl-4 text-slate-600 dark:text-slate-300">
                      {article.list.map((item, lIdx) => (
                        <li key={lIdx} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {article.definitions?.map((def, dIdx) => (
                <p
                  key={dIdx}
                  className="font-semibold text-slate-900 dark:text-slate-100 pl-1 border-l-2 border-[#2563eb]/40 my-2"
                >
                  {def}
                </p>
              ))}

              {article.extraParagraphs?.map((ep, epIdx) => (
                <p key={epIdx} className="text-slate-600 dark:text-slate-300">
                  {ep}
                </p>
              ))}
            </section>
          ))}

          {/* Pricing Section */}
          {content.pricing && (
            <section className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {content.pricing.title}
              </h3>
              <ul className="list-disc space-y-2 pl-8 sm:pl-10 text-slate-600 dark:text-slate-300">
                {content.pricing.items.map((item, pIdx) => (
                  <li key={pIdx} className="pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Security Section */}
          {content.security && (
            <section className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {content.security.title}
              </h3>
              <ul className="list-disc space-y-2 pl-8 sm:pl-10 text-slate-600 dark:text-slate-300">
                {content.security.items.map((item, sIdx) => (
                  <li key={sIdx} className="pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Footer / Actions ──────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <GlobalButton
            type="button"
            variant="primary"
            onClick={handleClose}
            className="w-full sm:w-auto min-w-[140px] h-11 px-8 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20"
          >
            {content.closeBtn || t("buttonsClose", "CLOSE")}
          </GlobalButton>

          <Link to="/enroll" className="w-full sm:w-auto">
            <GlobalButton
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 text-xs font-bold uppercase rounded-xl"
            >
              {t(
                "buttonContinue",
                t("continue_registration", "Continue to Registration"),
              )}
            </GlobalButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
