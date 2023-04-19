import axios from "axios";

export const getFearGreedIndex = async () => {
  try {
    const response = await axios.get("https://api.alternative.me/fng/");
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getFearGreedIndexMessage = async (fearGreedIndexData) => {
  const fearGreedIndexMessage = `🚀 #Bitcoin Fear & Greed Index is ${fearGreedIndexData.data[0].value} - ${fearGreedIndexData.data[0].value_classification}`;
  return fearGreedIndexMessage;
};
