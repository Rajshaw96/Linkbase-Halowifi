const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Middleware to validate ID format (e.g., for MongoDB ObjectId)
const validateId = (req, res, next) => {
const { id } = req.params;
if (!id.match(/^[0-9a-fA-F]{24}$/)) {
return res.status(400).json({ message: 'Invalid ID format' });
}
next();
};

router.get('/', propertyController.getAllProperties);
router.get('/:id', validateId, propertyController.getPropertyById); // GET by ID
router.post('/', propertyController.createProperty);
router.put('/:id', validateId, propertyController.updateProperty); // PUT (Update)
router.delete('/:id', validateId, propertyController.deleteProperty); // DELETE

module.exports = router;
