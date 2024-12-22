const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  location_id: String,
  network_id: String,
  session_id: String,
  user_id: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', SessionSchema);
