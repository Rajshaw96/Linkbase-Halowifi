const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  id: String,
  name: String,
  address: String,
  category: String,
  state: String,
  postal: String,
  country: String,
  contact_email: String,
  contact_phone_no: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
