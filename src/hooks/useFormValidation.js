import { useState } from 'react';
import { useLanguage } from '@/components/globals/LanguageProvider';

export function useFormValidation() {
  const [errors, setErrors] = useState({});
  const { t } = useLanguage();

  const validate = (fields) => {
    const newErrors = {};
    let isValid = true;
    
    fields.forEach(({ name, value, label, type = 'input', required = false, customValidation = null }) => {
      if (required && (value === null || value === undefined || String(value).trim() === '')) {
        newErrors[name] = type === 'select' 
          ? `${t("pleaseSelect", "Please select")} ${label}` 
          : `${t("pleaseEnter", "Please enter")} ${label}`;
        isValid = false;
      } else if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[name] = t("invalid_email", "Please enter a valid email address.");
        isValid = false;
      } else if (customValidation) {
        const customError = customValidation(value);
        if (customError) {
          newErrors[name] = customError;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  const clearError = (name) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const clearAllErrors = () => setErrors({});

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
  };
}
