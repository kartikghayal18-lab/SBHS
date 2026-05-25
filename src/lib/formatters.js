export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatShortDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatMonthLabel = (value) => {
  if (!value) return "-";
  const date = new Date(`${value}-01`);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

export const initialsFromName = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const calculateAverage = (items, selector) => {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + Number(selector(item) || 0), 0);
  return Math.round(total / items.length);
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
