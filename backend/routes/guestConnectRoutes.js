const express = require('express');
const router = express.Router();
const { validateGuestConnect } = require('../models/GuestConnect');
const guestConnectController = require('../controllers/guestConnectController');

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
router.get('/:id', guestConnectController.getGuestConnectionById);
router.post('/', validateRequestBody, guestConnectController.createGuestConnection);
router.put('/:id', validateRequestBody, guestConnectController.updateGuestConnection);
router.delete('/:id', guestConnectController.deleteGuestConnection);

router.get('/export-excel', guestConnectController.exportGuestConnectionsExcel);
router.get('/export-csv', guestConnectController.exportGuestConnectionsCSV);
router.get('/export-pdf', guestConnectController.exportGuestConnectionsPDF);

module.exports = router;
