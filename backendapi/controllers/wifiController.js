const axios = require('axios');
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
      process.env.EXTERNAL_API_URL + '/connect/external/trigger-login',
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
        }
      }
    );

    // Respond with success and redirect URL
    res.status(200).json({
      status: 'success',
      message: 'Session validated successfully!!!',
      redirect_url: response.data.redirect_url,
  });

  } catch (error) {
    console.error('Error triggering login:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
        status: 'error',
        message: error.response?.data?.message || 'Internal server error',
    });
  }
};

module.exports = { triggerLogin };
