import axios from "axios";

export const getFearGreedIndex = async () => {
  try {
    const response = await axios.get("https://api.alternative.me/fng/");

    if (!response.data || !Array.isArray(response.data.data) || !response.data.data[0].value || !response.data.data[0].value_classification) {
      throw new Error("Invalid response structure from Fear & Greed Index API");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Error fetching fear and greed index data: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error("No response received from Fear & Greed Index API");
    } else {
      throw new Error("Error setting up request to Fear & Greed Index API");
    }
  }
};
