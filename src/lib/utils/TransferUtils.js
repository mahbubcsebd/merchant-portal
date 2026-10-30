export const getBankName = (welcomeData, bankId, fallbackName) => {
  if (!bankId && !fallbackName) return "N/A";

  const rawId = String(bankId || "").trim();
  const rawFallback = String(fallbackName || "").trim();

  const bankList = welcomeData?.metaData?.SETTLEBANK;
  if (Array.isArray(bankList)) {
    const found = bankList.find(
      (b) =>
        (rawId && String(b.id).trim().toUpperCase() === rawId.toUpperCase()) ||
        (rawFallback && String(b.id).trim().toUpperCase() === rawFallback.toUpperCase()) ||
        (rawId && String(b.title || "").trim().toLowerCase() === rawId.toLowerCase()) ||
        (rawFallback && String(b.title || "").trim().toLowerCase() === rawFallback.toLowerCase())
    );
    if (found?.title) return found.title;
  }

  return rawFallback || rawId || "N/A";
};


export const getCurrencyLabel = (welcomeData, currencyId) => {
  if (currencyId === undefined || currencyId === null || currencyId === "") {
    return "XCG";
  }

  const raw = String(currencyId).trim();

  const currencyList = welcomeData?.metaData?.CURRENCY;
  if (Array.isArray(currencyList)) {
    const found = currencyList.find(
      (c) =>
        String(c.id).trim() === raw ||
        String(c.title || "").trim().toUpperCase() === raw.toUpperCase()
    );
    if (found?.title) return found.title;
  }

  if (raw === "0") return "XCG";

  return raw || "XCG";
};

