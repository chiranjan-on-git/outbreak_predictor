// src/services/api.js
import axios from 'axios';

// The URL where your Python Flask backend is running
const API_BASE_URL = 'http://127.0.0.1:5000'; 

/**
 * Fetches the global forecast data from the backend API.
 * @returns {Promise<Array>} A promise that resolves to an array of forecast data objects.
 */
export const fetchGlobalForecast = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/global-forecast`);
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    // Return an empty array in case of an error so the app doesn't crash.
    return []; 
  }
};