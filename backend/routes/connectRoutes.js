const express = require('express');
const router = express.Router();
const { validateConnect } = require('../models/Connect');
const connectController = require('../controllers/connectController');

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
  const { error } = validateConnect(req.body); // Using the Joi validation function from model
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Routes
router.get('/', connectController.getAllConnections); // GET all connections
router.get('/:id', validateId, connectController.getConnectionById); // GET connection by ID
router.post('/', validateRequestBody, connectController.createConnection); // POST (Create) - Token required
router.put('/:id', validateId, validateRequestBody, connectController.updateConnection); // PUT (Update) - Token required
router.delete('/:id', validateId, connectController.deleteConnection); // DELETE (Delete) - Token required

module.exports = router;
