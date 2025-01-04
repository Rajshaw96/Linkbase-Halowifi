const express = require('express');
const { triggerLogin } = require('../controllers/wifiController');

const router = express.Router();

// Route for triggering login
router.post('/trigger-login', triggerLogin);

module.exports = router;
