const Property = require('../models/Property');

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().select('-__v'); // Exclude `__v` field
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch properties', error: err.message });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).select('-__v'); // Exclude `__v` field
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch property', error: err.message });
  }
};

// Create a new property
exports.createProperty = async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty); // `__v` will not exist as it's excluded in the schema transformation
  } catch (err) {
    res.status(400).json({ message: 'Failed to create property', error: err.message });
  }
};

// Update a property by ID
exports.updateProperty = async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v'); // Exclude `__v` field
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(updatedProperty);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update property', error: err.message });
  }
};

// Delete a property by ID
exports.deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete property', error: err.message });
  }
};
