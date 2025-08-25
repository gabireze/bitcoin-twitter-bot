export const createFearGreedMessage = fearGreedIndexData => {
  const indexValue = fearGreedIndexData.data[0].value;
  const classification = fearGreedIndexData.data[0].value_classification;
  return `#Bitcoin Fear & Greed Index is ${indexValue} - ${classification}`;
};
