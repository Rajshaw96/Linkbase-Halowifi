require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const propertyRoutes = require('./routes/propertyRoutes');
const guestConnectRoutes = require('./routes/guestConnectRoutes');
const wifiRoutes = require('./routes/wifiRoutes');
const functions = require("firebase-functions");

const app = express();

// Connect to the database (MongoDB)
connectDB();

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
  'https://linkbase.tech/?',
  'https://linkbase.tech',
];

// CORS Options configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("CORS blocked request from origin:", origin);
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
app.get("/", (req, res) => res.send("Hello from Firebase!")); // You can remove this later if needed

// API Routes (Adding various routes for your app)
app.use('/propertiesDetails', propertyRoutes);  // Route for property details
app.use('/guestConnect', guestConnectRoutes);  // Route for guest connections
app.use('/connect/external', wifiRoutes);      // Route for external Wi-Fi connection

// Firebase Function export (Firebase will use this to handle HTTP requests)
exports.api = functions.https.onRequest(app);
