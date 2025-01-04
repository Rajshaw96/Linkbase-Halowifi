const express = require("express");
const router = express.Router();
const axios = require("axios");
const getHaloWiFiToken = require("../utils/haloWiFiToken");

// Get All Locations API
router.get("/getAllLocations", async (req, res) => {
  try {
    const token = await getHaloWiFiToken();

    if (!token) {
      return res.status(401).json({
        message: "Failed to fetch authentication token.",
        status: "error",
      });
    }

    const response = await axios.get(`${process.env.EXTERNAL_API_URL}/external/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      return res.status(response.status).json({
        message: "Failed to fetch locations from external API.",
        status: "error",
      });
    }

    return res.status(200).json({
      message: "Locations fetched successfully.",
      status: "success",
      locations: response.data.locations || [],
    });
  } catch (error) {
    console.error("Error fetching locations:", error);

    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        return res.status(401).json({
          message: "Invalid API Credentials.",
          status: "error",
        });
      }

      return res.status(status).json({
        message: data.message || "An error occurred with the external API.",
        status: "error",
      });
    }

    return res.status(500).json({
      message: "An internal server error occurred while fetching locations.",
      status: "error",
      error: error.message,
    });
  }
});

// Get Location by ID API
router.get("/getAllLocations/:location_id", async (req, res) => {
  try {
    const { location_id } = req.params;

    // Validate location_id
    if (!location_id) {
      return res.status(400).json({
        message: "Location ID is required.",
        status: "error",
      });
    }

    const token = await getHaloWiFiToken();

    if (!token) {
      return res.status(401).json({
        message: "Failed to fetch authentication token.",
        status: "error",
      });
    }

    // Fetch all locations from the external API
    const response = await axios.get(`${process.env.EXTERNAL_API_URL}/external/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      return res.status(response.status).json({
        message: "Failed to fetch locations from external API.",
        status: "error",
      });
    }

    const locations = response.data?.locations || [];

    // Find the location by `location_id`
    const location = locations.find((loc) => loc.location_id === location_id);

    if (!location) {
      return res.status(404).json({
        message: `Location with ID ${location_id} not found.`,
        status: "error",
      });
    }

    // Return the found location
    return res.status(200).json({
      message: "Location fetched successfully.",
      status: "success",
      location,
    });
  } catch (error) {
    console.error("Error fetching location by ID:", error);

    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      return res.status(status).json({
        message: data.message || "An error occurred with the external API.",
        status: "error",
      });
    }

    return res.status(500).json({
      message: "An internal server error occurred while fetching the location.",
      status: "error",
      error: error.message,
    });
  }
});

module.exports = router;
