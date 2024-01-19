export const createBitcoinMonthlyReturnsMessage = async () => {
  const currentMonth = new Date();
  currentMonth.setMonth(currentMonth.getMonth() - 1);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const prevMonthName = monthNames[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  const tweetMessage = `#Bitcoin Monthly Returns Heatmap (%) from Aug 2010 - ${prevMonthName} ${currentYear} by @newhedge_io`;

  return tweetMessage;
};
