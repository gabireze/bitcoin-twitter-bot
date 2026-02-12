export const createDonationReminderMessage = (onchainAddress, lightningAddress, intervalDays) => {
  return (
    `Support this Bitcoin bot:\n\n` +
    `On-chain: ${onchainAddress}\n` +
    `Lightning: ${lightningAddress}`
  );
};

