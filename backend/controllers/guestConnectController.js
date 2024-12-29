const { GuestConnect, validateGuestConnect } = require('../models/GuestConnect');

// Helper function to check if required fields are present
const validateGuestConnectFields = (req) => {
  const { guestFullName, guestPhoneNo, guestEmailId, propertyLocationId, propertyNetworkId } = req.body;
  if (!guestFullName || !guestPhoneNo || !guestEmailId || !propertyLocationId || !propertyNetworkId) {
    return 'All fields are required';
  }
  return null;
};

// Get all guest connections
exports.getAllGuestConnections = async (req, res) => {
  try {
    const guestConnections = await GuestConnect.find(); // Find all records
    res.json(guestConnections);
  } catch (error) {
    console.error('Error fetching guest connections:', error);
    res.status(500).json({ message: 'Error fetching guest connections' });
  }
};

// Get guest connection by ID
exports.getGuestConnectionById = async (req, res) => {
  try {
    const guestConnection = await GuestConnect.findById(req.params.id).select('-__v'); // Exclude the __v field
    if (!guestConnection) {
      return res.status(404).json({ message: 'Guest connection not found' });
    }
    res.json(guestConnection);
  } catch (err) {
    console.error(`Error fetching guest connection with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error, unable to fetch guest connection' });
  }
};

// Create a new guest connection
exports.createGuestConnection = async (req, res) => {
  const validationError = validateGuestConnectFields(req);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Validate using Joi
    const { error } = validateGuestConnect(req.body);
    if (error) {
      return res.status(400).json({ message: error.details.map((e) => e.message).join(', ') });
    }

    // Check if email is already used
    const existingGuestConnection = await GuestConnect.findOne({ guestEmailId: req.body.guestEmailId });
    if (existingGuestConnection) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const newGuestConnection = new GuestConnect(req.body);
    const savedGuestConnection = await newGuestConnection.save();
    res.status(201).json(savedGuestConnection);
  } catch (err) {
    console.error('Error creating guest connection:', err);
    res.status(500).json({ message: 'Server error, unable to create guest connection' });
  }
};

// Update a guest connection by ID
exports.updateGuestConnection = async (req, res) => {
  const validationError = validateGuestConnectFields(req);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Validate using Joi
    const { error } = validateGuestConnect(req.body);
    if (error) {
      return res.status(400).json({ message: error.details.map((e) => e.message).join(', ') });
    }

    const updatedGuestConnection = await GuestConnect.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select('-__v'); // Exclude the __v field
    if (!updatedGuestConnection) {
      return res.status(404).json({ message: 'Guest connection not found' });
    }

    res.json(updatedGuestConnection);
  } catch (err) {
    console.error(`Error updating guest connection with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error, unable to update guest connection' });
  }
};

// Delete a guest connection by ID
exports.deleteGuestConnection = async (req, res) => {
  try {
    const deletedGuestConnection = await GuestConnect.findByIdAndDelete(req.params.id);
    if (!deletedGuestConnection) {
      return res.status(404).json({ message: 'Guest connection not found' });
    }
    res.json({ message: 'Guest connection deleted successfully' });
  } catch (err) {
    console.error(`Error deleting guest connection with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error, unable to delete guest connection' });
  }
};
