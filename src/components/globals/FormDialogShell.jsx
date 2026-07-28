import React, { useState } from "react";
import { X } from "lucide-react";
import GlobalButton from "./GlobalButton";

export default function FormDialogShell({
  title,
  isView = false,
  submitText = "Save",
  cancelText = "Cancel",
  onSave,
  onClose,
  children,
}) {
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Manual validation
    const errors = {};
    let firstErrorField = null;

    Array.from(form.elements).forEach((el) => {
      if (el.name && (el.required || el.dataset?.required === "true") && !el.value) {
        // Find the closest label text if possible, else fallback to name
        let labelText = el.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const labelEl = form.querySelector(`label[for="${el.id}"]`);
        if (labelEl) {
          labelText = labelEl.innerText.replace('*', '').trim();
        }
        
        errors[el.name] = `${labelText} is required.`;
        if (!firstErrorField) firstErrorField = el;
      } else if (el.name && el.type === "email" && el.value && !/^\S+@\S+\.\S+$/.test(el.value)) {
        errors[el.name] = "Please enter a valid email address.";
        if (!firstErrorField) firstErrorField = el;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      firstErrorField?.focus();
      return;
    }
    
    setFormErrors({});

    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());

    let shouldClose = true;
    if (onSave) {
      shouldClose = onSave(values);
    }
    if (shouldClose !== false) {
      onClose();
    }
  };

  const handleFormChange = (e) => {
    if (e.target.name && formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const clearError = (name) => {
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Inject errors and clearError into children if they accept it
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { errors: formErrors, clearError });
    }
    return child;
  });

  return (
    <form onSubmit={handleSubmit} onChange={handleFormChange} className="flex flex-col max-h-[90vh]" noValidate>
      {/* Header */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-5 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-wider">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-8 overflow-y-auto space-y-6">
        {childrenWithProps}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-6 py-4 flex justify-end gap-3 shrink-0">
        <GlobalButton
          type="button"
          variant="secondary"
          onClick={onClose}
          className="uppercase tracking-wider font-bold h-10 text-xs px-6"
        >
          {isView ? "Close" : cancelText}
        </GlobalButton>
        {!isView && (
          <GlobalButton
            type="submit"
            variant="primary"
            className="uppercase tracking-wider font-bold h-10 text-xs px-6"
          >
            {submitText}
          </GlobalButton>
        )}
      </div>
    </form>
  );
}
