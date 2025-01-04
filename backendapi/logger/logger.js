const winston = require('winston');
require('winston-daily-rotate-file');

// Define daily log rotation options
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%-log.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',  // Keeps logs for 14 days
  level: 'info',    // Set the minimum level for logging
});

// Define the logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // Log to console
    dailyRotateFileTransport, // Log to daily rotated file
  ],
});

module.exports = logger;
