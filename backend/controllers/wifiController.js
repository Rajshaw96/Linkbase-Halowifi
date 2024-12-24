const axios = require('axios');
const Session = require('../models/Session');
const getHaloWiFiToken = require('../utils/haloWiFiToken');

const triggerLogin = async (req, res) => {
  const {
    location_id,
    network_id,
    session_id,
    user_id,
    session_duration,
    bandwidth,
    login_username,
    login_password,
    first_name,
    last_name,
    email,
  } = req.body;

  // Validate request parameters
  if (!location_id || !network_id || !session_id || !user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request parameters',
    });
  }

  try {
    // Get the authentication token
    console.log('Fetching authentication token...');
    const token = await getHaloWiFiToken();

    // Log token for debugging (ensure this is removed in production)
    console.log('Authentication token:', token);

    if (!token) {
      console.error('Failed to get authentication token from getHaloWiFiToken');
      return res.status(401).json({
        status: 'error',
        message: 'Failed to get authentication token',
      });
    }

    // Make the API request
    console.log('Triggering login with external API...');
    const response = await axios.post(
      'https://us-central1-linkbase-halowifi.cloudfunctions.net/api/connect/external/trigger-login',
      {
        location_id,
        network_id,
        session_id,
        user_id,
        session_duration,
        bandwidth,
        login_username,
        login_password,
        first_name,
        last_name,
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save session details to the database
    console.log('Saving session data...');
    const session = new Session({
      location_id,
      network_id,
      session_id,
      user_id: response.data.user_id || null,
    });
    await session.save();

    res.status(200).json({
      status: 'success',
      message: 'Session validated successfully',
      redirect_url: response.data.redirect_url,
    });
  } catch (error) {
    console.error('Error triggering login:', error.message);

    // Detailed error for debugging purposes
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to trigger login',
    });
  }
};

module.exports = { triggerLogin };
