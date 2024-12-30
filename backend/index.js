require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const propertyRoutes = require('./routes/propertyRoutes');
const guestConnectRoutes = require('./routes/guestConnectRoutes');
const wifiRoutes = require('./routes/wifiRoutes');
const functions = require("firebase-functions");
const logger = require('./logger/logger');  // Import the logger

const app = express();

// Connect to the database (MongoDB)
connectDB()
  .then(() => logger.info('MongoDB connected successfully'))  // Log database connection success
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));  // Log database connection errors

// Security Best Practices (Improved with Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // More specific policy
  crossOriginEmbedderPolicy: false, // May be needed for some resources
  crossOriginOpenerPolicy: false, // May be needed for some resources
}));

// Parse JSON requests
app.use(express.json());

// CORS Configuration - Allow specific origins (environmentally configurable)
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5502',
  'https://linkbase.tech/?',
  'https://linkbase.tech',
];

// CORS Options configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.error(`CORS blocked request from origin: ${origin}`);  // Log blocked CORS requests
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,PUT,POST,DELETE",
  credentials: true, // Allow credentials/cookies
  optionsSuccessStatus: 204, // Success status code for preflight requests
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Test Route (Useful for testing the server is running)
app.get("/", (req, res) => {
  logger.info('Root route accessed');  // Log root route access
  res.send("Hello from Firebase!");
});

// API Routes (Adding various routes for your app)
app.use('/propertiesDetails', propertyRoutes);  // Route for property details
app.use('/guestConnect', guestConnectRoutes);  // Route for guest connections
app.use('/connect/external', wifiRoutes);      // Route for external Wi-Fi connection

// Log when each route is accessed
app.use('/propertiesDetails', (req, res, next) => {
  logger.info(`Request to /propertiesDetails: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/guestConnect', (req, res, next) => {
  logger.info(`Request to /guestConnect: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/connect/external', (req, res, next) => {
  logger.info(`Request to /connect/external: ${req.method} ${req.originalUrl}`);
  next();
});

// Firebase Function export (Firebase will use this to handle HTTP requests)
exports.api = functions.https.onRequest(app);

// Log server startup
// app.listen(process.env.PORT || 5900, () => {
//   logger.info(`Server is running on port ${process.env.PORT || 5000}`);
// });
