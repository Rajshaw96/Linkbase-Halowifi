const axios = require('axios');
const Session = require('../models/Session');
const getHaloWiFiToken = require('../utils/haloWiFiToken');

const triggerLogin = async (req, res) => {
  const {
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
  } = req.body;

  // Validate request parameters
  if (!location_id || !network_id || !session_id || !login_app_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request parameters. Ensure location_id, network_id, session_id, and login_app_id are provided.',
    });
  }

  try {
    // Get the authentication token
    //console.log('Fetching authentication token...');

    const token = await getHaloWiFiToken();
    //console.log('Authentication token:', token);
    if (!token) {
      console.error('Failed to get authentication token');
      return res.status(401).json({
        status: 'error',
        message: 'Failed to authenticate with HaloWiFi',
      });
    }

    // Make the API request
    // console.log('Triggering login with external API...');
    // console.log('External API URL:', process.env.EXTERNAL_TRIGGER_API_URL);
    // console.log('I got my authentication token || ', token);

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
      }
    );

    //console.log('API Response:', response.data);
    const { user_id, redirect_url } = response.data;

    // Save session details to the database
    try {
      const session = new Session({
        location_id,
        network_id,
        session_id,
        user_id: user_id || null,
      });
      await session.save();

    } catch (dbError) {
      console.error('Error saving session data:', dbError.message);
      throw new Error('Database error while saving session');
    }

    res.status(200).json({
      status: 'success',
      message: 'Session validated successfully',
      redirect_url: redirect_url || null,
    });

  } catch (error) {
    console.error('Error triggering login:', error.message);

    // Provide detailed error information only in development
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to trigger login. Please try again later.',
    });
  }
};

module.exports = { triggerLogin };
