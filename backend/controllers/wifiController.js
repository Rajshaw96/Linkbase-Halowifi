const axios = require('axios');
const Session = require('../models/Session');
const getHaloWiFiToken = require('../utils/haloWiFiToken');

const triggerLogin = async (req, res) => {
  const {
    location_id,
    network_id,
    session_id,
    session_duration,
    bandwidth,
    login_username,
    login_password,
    first_name,
    last_name,
    email,
  } = req.body;

  const login_app_id = process.env.LOGIN_APP_ID; // Get login_app_id from environment variables

  // Validate request parameters
  if (!location_id || !network_id || !session_id || !login_app_id) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_REQUEST_PARAMETERS',
      message: 'Ensure location_id, network_id, session_id, and login_app_id are provided.',
    });
  }

  // Check if the external API URL is configured
  if (!process.env.EXTERNAL_TRIGGER_API_URL) {
    return res.status(500).json({
      status: 'error',
      code: 'MISSING_API_URL',
      message: 'External API URL is not configured. Please check the environment variables.',
    });
  }

  try {
    // Get the authentication token
    const token = await getHaloWiFiToken();
    if (!token) {
      console.error('Failed to get authentication token');
      return res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_FAILED',
        message: 'Failed to authenticate with HaloWiFi.',
      });
    }

    // Trigger external API login
    console.log('Fetching authentication token...', {login_app_id});
    const response = await axios.post(
      process.env.EXTERNAL_TRIGGER_API_URL,
      {
        location_id,
        network_id,
        session_id,
        login_app_id,
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
        timeout: 10000, // Timeout of 10 seconds
      }
    );

    const { user_id, redirect_url } = response.data;

    // Check for existing session and save if not present
    const existingSession = await Session.findOne({ session_id });
    if (!existingSession) {
      const session = new Session({
        location_id,
        network_id,
        session_id,
        user_id: user_id || null,
      });
      await session.save();
    }

    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Session validated successfully.',
      redirect_url: redirect_url || null,
    });

  } catch (error) {
    console.error('Error triggering login:', error.message);

    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    }

    res.status(500).json({
      status: 'error',
      code: 'LOGIN_FAILED',
      message: 'Failed to trigger login. Please try again later.',
    });
  }
};

module.exports = { triggerLogin };
