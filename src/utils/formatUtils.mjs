export const calculatePercentageChange = (currentValue, previousValue) => {
  return ((currentValue - previousValue) / previousValue) * 100;
};

export const formatCurrency = (value) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const formatDate = (date) => {
  const options = { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" };
  const dateString = new Date(date).toLocaleDateString("en-US", options);
  const dayOfMonth = new Date(date).getDate();
  let daySuffix;

  if (dayOfMonth > 3 && dayOfMonth < 21) daySuffix = "th";
  else if (dayOfMonth % 10 === 1) daySuffix = "st";
  else if (dayOfMonth % 10 === 2) daySuffix = "nd";
  else if (dayOfMonth % 10 === 3) daySuffix = "rd";
  else daySuffix = "th";

  return dateString.replace(new RegExp(" " + dayOfMonth), ` ${dayOfMonth}${daySuffix}`);
};
