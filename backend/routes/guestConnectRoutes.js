const express = require('express');
const router = express.Router();
const guestConnectController = require('../controllers/guestConnectController');

// Routes
router.get('/', guestConnectController.getAllGuestConnections);
router.get('/:id', guestConnectController.getGuestConnectionById);
router.get('/export-excel', guestConnectController.exportGuestConnectionsExcel);
router.get('/export-csv', guestConnectController.exportGuestConnectionsCSV);
router.get('/export-pdf', guestConnectController.exportGuestConnectionsPDF);
router.post('/', guestConnectController.createGuestConnection);
router.put('/:id', guestConnectController.updateGuestConnection);
router.delete('/:id', guestConnectController.deleteGuestConnection);

module.exports = router;
