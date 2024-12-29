const express = require('express');
const router = express.Router();
const { validateGuestConnect } = require('../models/GuestConnect');
const guestConnectController = require('../controllers/guestConnectController');

// Middleware to validate ID format (e.g., for MongoDB ObjectId)
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

// Middleware to validate request body for POST and PUT
const validateRequestBody = (req, res, next) => {
  const { error } = validateGuestConnect(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Routes
router.get('/', guestConnectController.getAllGuestConnections);
router.get('/:id', validateId, guestConnectController.getGuestConnectionById);
router.get('/export-excel', guestConnectController.exportGuestConnectionsExcel);
router.get('/export-csv', guestConnectController.exportGuestConnectionsCSV);
router.get('/export-pdf', guestConnectController.exportGuestConnectionsPDF);
router.post('/', validateRequestBody, guestConnectController.createGuestConnection);
router.put('/:id', validateId, validateRequestBody, guestConnectController.updateGuestConnection);
router.delete('/:id', validateId, guestConnectController.deleteGuestConnection);

module.exports = router;
