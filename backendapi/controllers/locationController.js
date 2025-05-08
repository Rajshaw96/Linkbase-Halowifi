const axios = require('axios');
const Location = require('../models/Location');
const getHaloWiFiToken = require('../utils/getHaloWiFiToken');

exports.getAllLocations = async (req, res) => {
  try {
    const token = await getHaloWiFiToken();
    if (!token) return res.status(401).json({ message: "Token fetch failed", status: "error" });

    const response = await axios.get(`${process.env.EXTERNAL_API_URL}/external/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.status(200).json({
      message: "Locations fetched",
      status: "success",
      locations: response.data.locations || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch error", status: "error" });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const token = await getHaloWiFiToken();
    if (!token) return res.status(401).json({ message: "Token fetch failed", status: "error" });

    const { location_id } = req.params;
    const response = await axios.get(`${process.env.EXTERNAL_API_URL}/external/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const location = response.data?.locations?.find(loc => loc.location_id === location_id);
    if (!location) return res.status(404).json({ message: "Location not found", status: "error" });

    res.status(200).json({ message: "Location fetched", status: "success", data: location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch error", status: "error" });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const token = await getHaloWiFiToken();
    if (!token) return res.status(401).json({ message: "Token fetch failed", status: "error" });

    const {
      name, address, category, state,
      postal, country, contact_email, contact_phone_no
    } = req.body;

    if (!name || !address || !category || !contact_email || !contact_phone_no) {
      return res.status(400).json({ message: "Missing required fields", status: "error" });
    }

    const apiResponse = await axios.post(
      `${process.env.EXTERNAL_API_URL}/external/locations/add`,
      { name, address, category, state, postal, country, contact_email, contact_phone_no },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const locationData = apiResponse.data?.location;

    if (!locationData?.location_id) {
      return res.status(500).json({ message: "Invalid API response", status: "error" });
    }

    const newLocation = new Location({
      id: locationData.location_id,
      ...locationData
    });

    await newLocation.save();

    res.status(200).json({
      message: "Location created and saved",
      status: "success",
      location: locationData
    });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({
      message: "Creation failed",
      status: "error",
      error: err.response?.data || err.message
    });
  }
};