import { useState } from 'react';

export function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validate = (fields) => {
    const newErrors = {};
    let isValid = true;
    
    fields.forEach(({ name, value, label, type = 'input', required = false, customValidation = null }) => {
      if (required && (value === null || value === undefined || String(value).trim() === '')) {
        newErrors[name] = type === 'select' ? `Please select ${label}.` : `Please enter ${label}.`;
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
    return isValid;
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
