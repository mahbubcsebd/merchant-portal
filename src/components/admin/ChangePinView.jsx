import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { changePIN } from "@/lib/api/endpoints";
import GlobalInput from "@/components/globals/GlobalInput";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function ChangePinView() {
  const { t } = useLanguage();
  const { openConfirmDialog, openSuccessDialog } = useDialog();

  const [formData, setFormData] = useState({
    oldPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 6) {
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const changePinMutation = useMutation({
    mutationFn: (payload) => changePIN(payload),
    onSuccess: (data) => {
      if (data.status === "success") {
        openSuccessDialog({
          title: t("success", "Success"),
          message: data.message || "PIN changed successfully.",
        });
        setFormData({
          oldPin: "",
          newPin: "",
          confirmPin: "",
        });
      } else {
        openConfirmDialog({
          title: t("error", "Error"),
          description: data.message || "Failed to change PIN.",
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!formData.oldPin) {
      newErrors.oldPin = t("err_old_pin_required", "Old PIN is required");
    } else if (formData.oldPin.length < 6) {
      newErrors.oldPin = t("err_old_pin_digits", "Old PIN must be 6 digits");
    }

    if (!formData.newPin) {
      newErrors.newPin = t("err_new_pin_required", "New PIN is required");
    } else if (formData.newPin.length < 6) {
      newErrors.newPin = t("err_new_pin_digits", "New PIN must be 6 digits");
    }

    if (!formData.confirmPin) {
      newErrors.confirmPin = t(
        "err_confirm_pin_required",
        "Confirm PIN is required",
      );
    } else if (formData.confirmPin !== formData.newPin) {
      newErrors.confirmPin = t(
        "err_confirm_pin_mismatch",
        "Confirm PIN does not match New PIN",
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      changePinMutation.mutate({
        oldPin: formData.oldPin,
        newPin: formData.newPin,
        confirmPin: formData.confirmPin,
        custType: "C",
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in duration-300">
      {/* ── Section Header Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t("change_wallet_pin", "Wallet Security PIN")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                "change_pin_sub",
                "Your 6-digit PIN authorizes high-value merchant payouts and security updates",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Form & Guidance 2-Column Grid ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Card (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <GlobalInput
                label={t("old_wallet_pin", "Current Wallet PIN")}
                required
                type="password"
                name="oldPin"
                value={formData.oldPin}
                onChange={handleChange}
                error={errors.oldPin}
                maxLength={6}
                inputMode="numeric"
                placeholder="••••••"
                labelClassName="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                {t("enter_current_6_digit", "Enter your current 6-digit authorization PIN")}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <GlobalInput
                label={t("new_wallet_pin", "New 6-Digit PIN")}
                required
                type="password"
                name="newPin"
                value={formData.newPin}
                onChange={handleChange}
                error={errors.newPin}
                maxLength={6}
                inputMode="numeric"
                placeholder="••••••"
                labelClassName="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                {t("enter_new_6_digit", "Must be 6 numeric digits")}
              </span>
            </div>

            <div>
              <GlobalInput
                label={t("confirm_pin", "Confirm New PIN")}
                required
                type="password"
                name="confirmPin"
                value={formData.confirmPin}
                onChange={handleChange}
                error={errors.confirmPin}
                maxLength={6}
                inputMode="numeric"
                placeholder="••••••"
                labelClassName="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="submit"
                disabled={changePinMutation.isPending}
                className="w-full flex items-center justify-center gap-2 h-11 px-6 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {changePinMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                <span>
                  {t("update_pin_button", "Update Security PIN")}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Guidance Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("pin_security_tips", "Security Recommendations")}
            </h4>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                title: t("tip_digits_title", "6 Numeric Digits"),
                desc: t(
                  "tip_digits_desc",
                  "Your PIN must contain exactly 6 digits without letters or special characters.",
                ),
              },
              {
                title: t("tip_predictable_title", "Avoid Simple Sequences"),
                desc: t(
                  "tip_predictable_desc",
                  "Avoid obvious numbers such as 123456, 111111, or your birth year.",
                ),
              },
              {
                title: t("tip_confidential_title", "Keep It Confidential"),
                desc: t(
                  "tip_confidential_desc",
                  "mPay support agents or bank staff will NEVER ask you for your wallet PIN.",
                ),
              },
              {
                title: t("tip_authorization_title", "Authorizes Payouts"),
                desc: t(
                  "tip_authorization_desc",
                  "This PIN validates bank account settlements and daily limit configuration changes.",
                ),
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={14}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {tip.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
