import { Link } from 'react-router-dom';
import GlobalButton from "@/components/globals/GlobalButton"
import { useLanguage } from "@/components/globals/LanguageProvider"

export default function HelpPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-900 text-white">
      <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">{t("portal_menu_help", "Help Center")}</h2>
        <p className="text-white/60 mb-6">{t("coming_soon_desc", "Content is coming soon. Stay tuned!")}</p>
        <Link to="/dashboard">
          <GlobalButton 
            variant="primary"
            className="text-xs font-bold uppercase tracking-wider"
          >
            {t("go_to_dashboard", "Go to Dashboard")}
          </GlobalButton>
        </Link>
      </div>
    </div>
  )
}
