const { GuestConnect, validateGuestConnect } = require('../models/GuestConnect');
const ExcelJS = require('exceljs');
const { writeToBuffer } = require('@fast-csv/format');
const PDFDocument = require('pdfkit');

// Helper function to check if required fields are present
const validateGuestConnectFields = (req) => {
  const { guestFullName, guestPhoneNo, guestEmailId, propertyLocationId, propertyNetworkId } = req.body;
  if (!guestFullName || !guestPhoneNo || !guestEmailId || !propertyLocationId || !propertyNetworkId) {
    return 'All fields are required';
  }
  return null;
};

// Get all guest connections with filtering, sorting, pagination, and search
exports.getAllGuestConnections = async (req, res) => {
  try {
    // Extract query parameters
    const { page = 1, limit = 10, sort = 'guestFullName', order = 'asc', search = '', ...filters } = req.query;

    // Search and filter logic
    const query = {
      ...filters,
      ...(search && {
        $or: [
          { guestFullName: { $regex: search, $options: 'i' } },
          { guestPhoneNo: { $regex: search, $options: 'i' } },
          { guestEmailId: { $regex: search, $options: 'i' } },
          { propertyLocationId: { $regex: search, $options: 'i' } },
          { propertyNetworkId: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    // Sorting logic
    const sortOrder = order === 'desc' ? -1 : 1;

    // Pagination logic
    const skip = (page - 1) * limit;

    // Execute query with filters, search, sort, and pagination
    const guestConnections = await GuestConnect.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total documents for pagination metadata
    const totalDocuments = await GuestConnect.countDocuments(query);

    res.json({
      data: guestConnections,
      metadata: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalDocuments / limit),
        totalDocuments,
      },
    });
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
    const { error } = validateGuestConnect(req.body);
    if (error) {
      return res.status(400).json({ message: error.details.map((e) => e.message).join(', ') });
    }

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
    const { error } = validateGuestConnect(req.body);
    if (error) {
      return res.status(400).json({ message: error.details.map((e) => e.message).join(', ') });
    }

    const updatedGuestConnection = await GuestConnect.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGuestConnection) {
      return res.status(404).json({ message: 'Guest connection not found' });
    }
    res.json(updatedGuestConnection);
  } catch (err) {
    console.error('Error updating guest connection:', err);
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
    console.error('Error deleting guest connection:', err);
    res.status(500).json({ message: 'Server error, unable to delete guest connection' });
  }
};

// Export guest connections with pagination and search
exports.exportGuestConnectionsExcel = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const regexSearch = new RegExp(search, 'i'); // Case-insensitive search

    // Fetch guest connections with search and pagination
    const guestConnections = await GuestConnect.find({
      $or: [
        { guestFullName: { $regex: regexSearch } },
        { guestPhoneNo: { $regex: regexSearch } },
        { guestEmailId: { $regex: regexSearch } },
        { propertyLocationId: { $regex: regexSearch } },
        { propertyNetworkId: { $regex: regexSearch } },
      ]
    })
    .skip(skip)
    .limit(parseInt(limit))
    .exec();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Guest Connections');

    // Add headers
    worksheet.columns = [
      { header: 'Guest Full Name', key: 'guestFullName', width: 25 },
      { header: 'Phone No', key: 'guestPhoneNo', width: 15 },
      { header: 'Email ID', key: 'guestEmailId', width: 25 },
      { header: 'Property Location ID', key: 'propertyLocationId', width: 20 },
      { header: 'Property Network ID', key: 'propertyNetworkId', width: 20 },
    ];

    // Add rows of data to Excel sheet
    guestConnections.forEach((connection) => {
      worksheet.addRow({
        guestFullName: connection.guestFullName,
        guestPhoneNo: connection.guestPhoneNo,
        guestEmailId: connection.guestEmailId,
        propertyLocationId: connection.propertyLocationId,
        propertyNetworkId: connection.propertyNetworkId,
      });
    });

    // Write the file buffer and send as response
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="guest_connections.xlsx"');
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting guest connections:', error);
    res.status(500).json({ message: 'Error exporting to Excel' });
  }
};

// Export guest connections as CSV
exports.exportGuestConnectionsCSV = async (req, res) => {
  try {
    // Fetch all guest connections
    const guestConnections = await GuestConnect.find().lean(); // Use lean() to return plain objects

    if (!guestConnections || guestConnections.length === 0) {
      return res.status(404).json({ message: 'No guest connections found to export.' });
    }

    // Map the data to the required format
    const csvData = await writeToBuffer(
      guestConnections.map((connection) => ({
        guestFullName: connection.guestFullName,
        guestPhoneNo: connection.guestPhoneNo,
        guestEmailId: connection.guestEmailId,
        propertyLocationId: connection.propertyLocationId,
        propertyNetworkId: connection.propertyNetworkId,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      })),
      { headers: true }
    );

    // Set response headers and send CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="guest_connections.csv"');
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({ message: 'Error exporting to CSV' });
  }
};

// Export guest connections as PDF
exports.exportGuestConnectionsPDF = async (req, res) => {
  try {
    const guestConnections = await GuestConnect.find();

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="guest_connections.pdf"');
    doc.pipe(res);

    // Add a title
    doc.fontSize(16).text('Guest Connections', { align: 'center' });
    doc.moveDown();

    // Add table headers
    doc.fontSize(12).text('Full Name', { continued: true, width: 150 });
    doc.text('Phone No', { continued: true, width: 100 });
    doc.text('Email ID', { continued: true, width: 150 });
    doc.text('Property Location ID', { continued: true, width: 150 });
    doc.text('Property Network ID', { width: 150 });
    doc.moveDown();

    // Add data
    guestConnections.forEach((connection) => {
      doc.fontSize(10)
        .text(connection.guestFullName, { continued: true, width: 150 })
        .text(connection.guestPhoneNo, { continued: true, width: 100 })
        .text(connection.guestEmailId, { continued: true, width: 150 })
        .text(connection.propertyLocationId, { continued: true, width: 150 })
        .text(connection.propertyNetworkId, { width: 150 });
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ message: 'Error exporting to PDF' });
  }
};
