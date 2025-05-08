const express = require('express');
const router = express.Router();
const {
  getAllLocations,
  getLocationById,
  createLocation
} = require('../controllers/locationController');

router.get('/getAllLocations', getAllLocations);
router.get('/getAllLocations/:location_id', getLocationById);
router.post('/createLocation', createLocation);

module.exports = router;
