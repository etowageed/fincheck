const EmailService = require('./utils/emails'); // Adjust the path as necessary
const User = require('./models/userModel'); // Adjust the path as necessary
const mongoose = require('mongoose');
require('dotenv').config();
require('./utils/weeklySummaryJob');

const app = require('./app');

const PORT = process.env.PORT || 5000;

let server; // Reference to the server instance

// Handle uncaught exceptions (synchronous errors)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// MongoDB connection
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('DB connection successful');
    server = app.listen(PORT, () => {
      console.log(`...Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

// Handle unhandled promise rejections (async errors)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    console.log('🛑 HTTP server closed.');

    try {
      await mongoose.connection.close(false); // false = do not force close
      console.log('🧹 MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error closing DB connection:', err);
      process.exit(1); // force exit on error
    }
  });
});
