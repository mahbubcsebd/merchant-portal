export const getBankName = (welcomeData, bankId, fallbackName) => {
  if (!bankId) return fallbackName || "N/A";
  if (!welcomeData?.metaData?.SETTLEBANK) return fallbackName || bankId;
  const bank = welcomeData.metaData.SETTLEBANK.find(
    (b) => String(b.id).trim() === String(bankId).trim()
  );
  return bank ? bank.title : (fallbackName || bankId);
};

export const getCurrencyLabel = (welcomeData, currencyId) => {
  if (!currencyId || String(currencyId) === "0") currencyId = "XCG";
  if (!welcomeData?.metaData?.CURRENCY) return currencyId;
  const curr = welcomeData.metaData.CURRENCY.find(
    (c) => String(c.id) === String(currencyId)
  );
  return curr ? curr.title : currencyId;
};
