
export const API_CONFIG = {
  // Base URL for your backend API (e.g., Python/Flask server)
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Toggle this to false to use real API calls
  // defaults to true if environment variable is not explicitly set to 'false'
  USE_MOCK: process.env.REACT_APP_USE_MOCK === 'false' ? false : true,
  
  // Simulate network latency for mock data (ms)
  MOCK_LATENCY: 400,
};
