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

connectDB();

// Security Best Practices (Improved)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // More specific policy
  crossOriginEmbedderPolicy: false, // May be needed for some resources
  crossOriginOpenerPolicy: false // May be needed for some resources
}));

app.use(express.json());

// Get allowed origins from environment (BEST PRACTICE)
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://linkbase.tech/?',
  'https://linkbase.tech', // Make absolutely sure this is correct
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("CORS blocked request from origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // VERY IMPORTANT for cookies/auth
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Test Route (Keep this for testing)
app.get("/", (req, res) => res.send("Hello from Firebase!"));

// API Routes
app.use('/propertiesDetails', propertyRoutes);
app.use('/userConnect', connectRoutes);
app.use('/connect/external', wifiRoutes);

// Firebase Function export
exports.api = functions.https.onRequest(app);