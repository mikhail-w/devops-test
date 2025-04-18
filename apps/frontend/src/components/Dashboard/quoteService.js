import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get random quote with retry logic
const getRandomQuote = async (retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      };

      const response = await axios.get(`${API_URL}/quotes/random/`, config);
      return {
        content: response.data.content,
        author: response.data.author,
        tags: response.data.tags || []
      };
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        // If this was the last attempt, throw the error
        const message =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to fetch quote';
        throw new Error(message);
      }
      
      // Wait before retrying
      await wait(delay);
    }
  }
};

const quoteService = {
  getRandomQuote,
};

export default quoteService;
