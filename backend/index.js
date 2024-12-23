require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const propertyRoutes = require('./routes/propertyRoutes');
const connectRoutes = require('./routes/connectRoutes');
const wifiRoutes = require('./routes/wifiRoutes');
const functions = require("firebase-functions");
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(express.json());

// Configure CORS with allowed origins
const allowedOrigins = ['http://127.0.0.1:5500', 'https://linkbase.tech'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Route handling
app.get("/", (req, res) => res.send("Hello from Firebase!"));
app.use('/propertiesDetails', propertyRoutes);
app.use('/userConnect', connectRoutes);
app.use('/connect/external', wifiRoutes);

// Uncomment the following for local testing (when not deploying to Firebase)
// const port = process.env.PORT || 8080;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// Firebase Function export
exports.api = functions.https.onRequest(app);