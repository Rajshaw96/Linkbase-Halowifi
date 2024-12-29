const { Connect, validateConnect } = require('../models/Connect');

// Helper function to check if required fields are present
const validateConnectionFields = (req) => {
  const { UserFullName, UserPhoneNo, UserEmailId, LocationId } = req.body;
  if (!UserFullName || !UserPhoneNo || !UserEmailId || !LocationId) {
    return 'All fields are required: UserFullName, UserPhoneNo, UserEmailId, LocationId';
  }
  return null;
};

// Get all connections
exports.getAllConnections = async (req, res) => {
  try {
    const connections = await Connect.find(); // Find all records
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Error fetching connections' });
  }
};

// Get connection by ID
exports.getConnectionById = async (req, res) => {
  try {
    const connection = await Connect.findById(req.params.id).select('-__v'); // Exclude the __v field
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json(connection);
  } catch (err) {
    console.error(`Error fetching connection with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error, unable to fetch connection' });
  }
};

// Create a new connection
exports.createConnection = async (req, res) => {
  const validationError = validateConnectionFields(req);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Validate using Joi if you're using it
    const { error } = validateConnect(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if email is already used
    const existingConnection = await Connect.findOne({ UserEmailId: req.body.UserEmailId });
    if (existingConnection) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const newConnection = new Connect(req.body);
    const savedConnection = await newConnection.save();
    const connectionWithoutVersion = savedConnection.toObject(); // Convert to plain object
    delete connectionWithoutVersion.__v; // Remove the __v field manually

    res.status(201).json(connectionWithoutVersion);
  } catch (err) {
    console.error('Error creating connection:', err);
    res.status(400).json({ message: 'Invalid data provided' });
  }
};

// Update a connection by ID
exports.updateConnection = async (req, res) => {
  const validationError = validateConnectionFields(req);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Validate using Joi if you're using it
    const { error } = validateConnect(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedConnection = await Connect.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-__v'); // Exclude the __v field
    if (!updatedConnection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json(updatedConnection);
  } catch (err) {
    console.error(`Error updating connection with ID ${req.params.id}:`, err);
    res.status(400).json({ message: 'Invalid data provided' });
  }
};

// Delete a connection by ID
exports.deleteConnection = async (req, res) => {
  try {
    const deletedConnection = await Connect.findByIdAndDelete(req.params.id);
    if (!deletedConnection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json({ message: 'Connection deleted successfully' });
  } catch (err) {
    console.error(`Error deleting connection with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error, unable to delete connection' });
  }
};
