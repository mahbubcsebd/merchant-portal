import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useDashboardContext } from "@/pages/dashboard/context";
import { updateLanguage } from "@/lib/api/endpoints";

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

  const languages = [
    { key: "Dutch", label: t("lang_dutch", "Dutch") },
    { key: "English", label: t("chl_english", t("lang_english", "English")) },
    { key: "French", label: t("chl_franch", t("lang_french", "French")) },
    { key: "Spanish", label: t("chl_spanish", t("lang_spanish", "Spanish")) },
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
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-2 mb-2">
          {languages.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectLanguage(item.key)}
              disabled={updateMutation.isPending}
              className="w-full flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors text-left"
            >
              <span
                className={`font-semibold text-sm ${selectedLang === item.key ? "text-[#1b55ad] dark:text-blue-400" : "text-slate-800 dark:text-white/90"}`}
              >
                {item.label}
              </span>
              {selectedLang === item.key && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#1b55ad] dark:text-blue-400"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
