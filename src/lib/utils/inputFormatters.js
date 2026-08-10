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
