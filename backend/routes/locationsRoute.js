const express = require("express");
const router = express.Router();
const axios = require("axios");
const getHaloWiFiToken = require("../utils/haloWiFiToken");

// Get Locations API
router.get("/", async (req, res) => {
  try {
    // Fetch the token using the existing method
    const token = await getHaloWiFiToken();

    // Call the external API to fetch locations
    const response = await axios.get(EXTERNAL_API_URL + "/locations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Return the response data to the client
    return res.status(200).json({
      message: "Locations fetched successfully.",
      status: "success",
      locations: response.data.locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);

    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      return res.status(401).json({
        message: "Invalid API Credentials.",
        status: "error",
      });
    }

    // Handle other errors
    return res.status(500).json({
      message: "An error occurred while fetching locations.",
      status: "error",
      error: error.message,
    });
  }
});

module.exports = router;
