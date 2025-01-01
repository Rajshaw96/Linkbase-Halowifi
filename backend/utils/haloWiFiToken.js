const axios = require('axios');

const getHaloWiFiToken = async () => {
  try {
    // Validate environment variables
    if (!process.env.API_KEY || !process.env.API_SECRET) {
      console.error('API_KEY or API_SECRET is missing. Please check your environment variables.');
      return null;
    }

    //console.log('Fetching HaloWiFi token...');
    const response = await axios.post(
      process.env.EXTERNAL_API_URL + '/external/token',
      {
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.data && response.data.token) {
      //console.log('HaloWiFi token fetched successfully. ||', response.data.token );
      return response.data.token;
    } else {
      console.error('Unexpected response format:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching HaloWiFi token:', error.message);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received from HaloWiFi:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }

    return null;
  }
};

module.exports = getHaloWiFiToken;
