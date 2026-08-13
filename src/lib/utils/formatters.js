export const formatDate = (dateString) => {
  if (!dateString) return "";
  
  const str = String(dateString);
  
  if (str.length === 8 && !isNaN(str)) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    return `${month}/${day}/${year}`;
  }

  if (!isNaN(dateString)) {
    const date = new Date(Number(dateString));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  
  return str;
};

export const formatAmount = (amt) => {
  if (!amt) return "0.00";
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    parseFloat(amt),
  );
};

export const formatStatus = (status, t) => {
  switch (status) {
    case "P":
      return t ? t("rmSuccess", "Success") : "Success";
    case "R":
      return t ? t("global_failed", "Failed") : "Failed";
    case "C":
      return t ? t("global_pending", "Pending") : "Pending";
    default:
      return status || "-";
  }
};
