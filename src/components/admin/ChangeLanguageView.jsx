import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useDashboardContext } from "@/pages/dashboard/context";
import { updateLanguage } from "@/lib/api/endpoints";
import { Globe, Check, Sparkles, CheckCircle2 } from "lucide-react";

export default function ChangeLanguageView() {
  const { t, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const { openConfirmDialog, openSuccessDialog } = useDialog();
  const { profile } = useDashboardContext();

  const langMap = {
    nl: "Dutch",
    en: "English",
    fr: "French",
    es: "Spanish",
  };

  const reverseLangMap = {
    Dutch: "nl",
    English: "en",
    French: "fr",
    Spanish: "es",
  };

  // Flag SVGs for premium international look
  const languages = [
    {
      key: "English",
      code: "en",
      label: "English",
      nativeLabel: "United States · UK",
      desc: "Global Merchant Default",
      flag: (
        <svg viewBox="0 0 36 24" className="w-8 h-5.5 rounded-sm shadow-xs overflow-hidden shrink-0">
          <rect width="36" height="24" fill="#012169" />
          <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
          <path d="M0,0 L36,24 M36,0 L0,24" stroke="#c8102e" strokeWidth="2.5" />
          <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
          <path d="M18,0 V24 M0,12 H36" stroke="#c8102e" strokeWidth="3.5" />
        </svg>
      ),
      accentColor: "#2563eb",
    },
    {
      key: "Dutch",
      code: "nl",
      label: "Nederlands",
      nativeLabel: "Nederland · Suriname",
      desc: "Dutch Regional Interface",
      flag: (
        <svg viewBox="0 0 36 24" className="w-8 h-5.5 rounded-sm shadow-xs overflow-hidden shrink-0">
          <rect width="36" height="8" fill="#AE1C28" />
          <rect y="8" width="36" height="8" fill="#FFFFFF" />
          <rect y="16" width="36" height="8" fill="#21468B" />
        </svg>
      ),
      accentColor: "#ea580c",
    },
    {
      key: "French",
      code: "fr",
      label: "Français",
      nativeLabel: "France · Caraïbes",
      desc: "Interface en langue française",
      flag: (
        <svg viewBox="0 0 36 24" className="w-8 h-5.5 rounded-sm shadow-xs overflow-hidden shrink-0">
          <rect width="12" height="24" fill="#002654" />
          <rect x="12" width="12" height="24" fill="#FFFFFF" />
          <rect x="24" width="12" height="24" fill="#CE1126" />
        </svg>
      ),
      accentColor: "#4f46e5",
    },
    {
      key: "Spanish",
      code: "es",
      label: "Español",
      nativeLabel: "España · América Latina",
      desc: "Interfaz en idioma español",
      flag: (
        <svg viewBox="0 0 36 24" className="w-8 h-5.5 rounded-sm shadow-xs overflow-hidden shrink-0">
          <rect width="36" height="6" fill="#AA151B" />
          <rect y="6" width="36" height="12" fill="#F1BF00" />
          <rect y="18" width="36" height="6" fill="#AA151B" />
        </svg>
      ),
      accentColor: "#dc2626",
    },
  ];

  const [selectedLang, setSelectedLang] = useState("English");

  // Initialize selected language from user profile
  useEffect(() => {
    if (profile?.languageId && langMap[profile.languageId]) {
      setSelectedLang(langMap[profile.languageId]);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateLanguage(payload),
    onSuccess: (data, variables) => {
      if (data.status === "success") {
        setLanguage(variables.languageId);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        openSuccessDialog({
          title: t("success", "Success"),
          message: data.message || "Preferred language updated successfully.",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to update language.",
          confirmText: t("close", "Close"),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error", "Error"),
        description:
          err?.response?.data?.message ||
          t("something_went_wrong_try_again", "Something went wrong."),
        confirmText: t("close", "Close"),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const handleSelectLanguage = (itemKey) => {
    setSelectedLang(itemKey);
    const languageCode = reverseLangMap[itemKey] || "en";
    updateMutation.mutate({ languageId: languageCode });
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* ── Section Header Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t("language_preferences", "Language & Regional Settings")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  "language_subtitle",
                  "Select your preferred language interface for the merchant portal",
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {t("active_language", "Active:")} {selectedLang}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 Languages in a SINGLE ROW on Desktop ───────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {languages.map((item) => {
          const isSelected = selectedLang === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectLanguage(item.key)}
              disabled={updateMutation.isPending}
              className={`relative overflow-hidden p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group ${
                isSelected
                  ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-sm ring-2 ring-blue-500/20"
                  : "border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              }`}
            >
              {/* Top: Flag + Radio Check */}
              <div className="flex items-center justify-between w-full">
                <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  {item.flag}
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                      : "border-slate-300 dark:border-slate-700 bg-transparent opacity-40 group-hover:opacity-100"
                  }`}
                >
                  {isSelected && <Check size={13} strokeWidth={3} />}
                </div>
              </div>

              {/* Middle: Language Label & Region */}
              <div className="my-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {item.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {item.nativeLabel}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
                  {item.desc}
                </p>
              </div>

              {/* Bottom: Selection Pill Status */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"
                  }`}
                >
                  {isSelected
                    ? t("active_selected", "Active Language")
                    : t("click_to_select", "Select")}
                </span>

                {isSelected && (
                  <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
