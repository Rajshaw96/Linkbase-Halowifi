const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getAllProperties);
router.get('/:_id', propertyController.getPropertyById);
router.post('/', propertyController.createProperty);
router.put('/:_id', propertyController.updateProperty);
router.delete('/:_id', propertyController.deleteProperty);

module.exports = router;
