/**
 * Input formatters to enforce character restrictions on form fields.
 * Used as `onInput` handlers to clean the input on-the-fly.
 */

export const enforceNumeric = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
};

export const enforceAlphabetic = (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
};

export const enforceAlphanumeric = (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
};

export const enforceNumericSpace = (e) => {
  e.target.value = e.target.value.replace(/[^0-9 ]/g, "");
};

export const enforceAlphanumericSpace = (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
};

export const enforceEmail = (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, "");
};

/**
 * Format string as a clean decimal amount with up to 2 decimal places.
 * Handles multiple decimal points, leading zeros, and invalid characters.
 */
export const formatAmountInput = (val) => {
  if (val == null) return "";
  let str = String(val).replace(/[^0-9.]/g, "");

  // Prevent multiple dots
  const parts = str.split(".");
  if (parts.length > 2) {
    str = parts[0] + "." + parts.slice(1).join("");
  }

  // Cap decimals at 2 digits
  if (str.includes(".")) {
    const [integerPart, decimalPart] = str.split(".");
    str = `${integerPart}.${(decimalPart || "").slice(0, 2)}`;
  }

  return str;
};

/**
 * Enforce decimal amount format on input events (max 2 decimal places).
 */
export const enforceDecimal = (e) => {
  if (!e?.target) return;
  const cursor = e.target.selectionStart;
  const original = e.target.value;
  const formatted = formatAmountInput(original);

  if (original !== formatted) {
    e.target.value = formatted;
    // Attempt to maintain cursor position gracefully
    if (cursor != null && cursor <= formatted.length) {
      e.target.setSelectionRange(cursor, cursor);
    }
  }
};

