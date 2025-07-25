const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const enforce = require('express-sslify'); // Add this for HTTPS enforcement
const session = require('express-session'); // Add this
require('dotenv').config();

const morgan = require('morgan'); // For logging requests in development
const cors = require('cors'); // For handling CORS

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler'); // Import the global error handler

const app = express();

app.set('trust proxy', true);

app.use(helmet()); // Set security headers
// TODO uncomment this code when in production to enforce HTTPS
// Only use this in production where a load balancer/proxy handles SSL termination
// if (process.env.NODE_ENV === 'production') {
//   app.use(enforce.HTTPS({ trustProtoHeader: true })); // Important for Heroku, AWS ELB, etc.
// }

// Morgan for logging requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Use 'dev' format for concise output during development
}

// CORS Configuration
// In development, you might allow all origins or specific development origins.
// In production, always restrict to your frontend's domain(s).
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Replace with your frontend's URL in production
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

//TODO setup proper cors structure with .env for production

app.use(cookieParser());

// Add session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong, unique secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Initialize Passport
const passport = require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

// importing the routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const financesRouter = require('./routes/financesRoutes');

app.use(express.json({ limit: '10kb' }));

// mounting the routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/finances', financesRouter);

// Handle undefined routes
app.all('/{*any}', (req, res, next) => {
  // remenber to use this syntax henceforth due to the new version of express
  // This will catch all undefined routes and pass to the next middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
