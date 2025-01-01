const express = require("express");
const router = express.Router();
const axios = require("axios");
const getHaloWiFiToken = require("../utils/haloWiFiToken");

// Get Locations API
router.get("/getAllLocations", async (req, res) => {
  try {
    // Fetch the token using the existing method
    const token = await getHaloWiFiToken();

    if (!token) {
      return res.status(401).json({
        message: "Failed to fetch authentication token.",
        status: "error",
      });
    }

    // Call the external API to fetch locations
    const response = await axios.get(`${process.env.EXTERNAL_API_URL}/api/locations`, {
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

    // Return the response data to the client
    return res.status(200).json({
      message: "Locations fetched successfully.",
      status: "success",
      locations: response.data.locations || [],
    });
  } catch (error) {
    console.error("Error fetching locations:", error);

    // Handle specific Axios errors
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

    // Handle other errors
    return res.status(500).json({
      message: "An internal server error occurred while fetching locations.",
      status: "error",
      error: error.message,
    });
  }
});

module.exports = router;
