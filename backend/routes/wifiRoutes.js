const express = require('express');
const { triggerLogin } = require('../controllers/wifiController');

const router = express.Router();

router.post('/trigger-login', triggerLogin);

module.exports = router;
