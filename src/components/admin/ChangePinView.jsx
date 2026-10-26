import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { changePIN } from "@/lib/api/endpoints";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";

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

  const handleSubmit = () => {
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
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full mt-4">
          <GlobalInput
            label={t("old_wallet_pin", "Old Wallet PIN")}
            required
            type="password"
            name="oldPin"
            value={formData.oldPin}
            onChange={handleChange}
            error={errors.oldPin}
            maxLength={6}
            inputMode="numeric"
            placeholder="••••••"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

          <GlobalInput
            label={t("new_wallet_pin", "New Wallet PIN")}
            required
            type="password"
            name="newPin"
            value={formData.newPin}
            onChange={handleChange}
            error={errors.newPin}
            maxLength={6}
            inputMode="numeric"
            placeholder="••••••"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />

          <GlobalInput
            label={t("confirm_pin", "Confirm PIN")}
            required
            type="password"
            name="confirmPin"
            value={formData.confirmPin}
            onChange={handleChange}
            error={errors.confirmPin}
            maxLength={6}
            inputMode="numeric"
            placeholder="••••••"
            labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2"
          />
        </div>
        <div className="flex justify-center mt-4">
          <GlobalButton
            onClick={handleSubmit}
            variant="primary"
            className="px-8 text-xs font-bold uppercase tracking-wider"
            isLoading={changePinMutation.isPending}
          >
            {t("change_wallet_pin", t("change_pin", "Change PIN"))}
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
