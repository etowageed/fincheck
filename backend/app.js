const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression'); // Compress responses
const enforce = require('express-sslify'); // Add this for HTTPS enforcement
const session = require('express-session'); // Add this
require('dotenv').config();
const MongoStore = require('connect-mongo').default;
const paymentController = require('./controllers/paymentController');
const morgan = require('morgan'); // For logging requests in development
const cors = require('cors'); // For handling CORS
const sanitize = require('mongo-sanitize'); // NoSQL injection protection (Express 5 compatible)

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler'); // Import the global error handler

const app = express();

app.set('trust proxy', 1);

app.use(helmet()); // Set security headers
app.use(compression()); // Compress text/json payloads

// TODO uncomment this code when in production to enforce HTTPS
// Only use this in production where a load balancer/proxy handles SSL termination
// Only use this in production where a load balancer/proxy handles SSL termination
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true })); // Important for Heroku, AWS ELB, etc.
}

// Morgan for logging requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Use 'dev' format for concise output during development
}

// CORS Configuration
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL, // e.g. https://app.pletefinance.com
        'https://app.pletefinance.com', // Explicitly allow the app subdomain
        'https://pletefinance.com', // Main landing page
        'https://www.pletefinance.com', // WWW version
      ]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));

app.use(cookieParser());

// Fail fast in production if SESSION_SECRET is not configured
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error(
    'FATAL: SESSION_SECRET must be set in production environment variables.',
  );
}

// Add session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE,
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  }),
);

// Health Check Endpoint for Render deployment
app.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.status(200).json({ status: 'ok', database: 'connected' });
  } else {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
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
const categoryRouter = require('./routes/categoryRoutes');
const paymentRouter = require('./routes/paymentRoutes');

// 4.1 Webhook Body Parser: Must run BEFORE express.json()
// This middleware processes the raw body for the Polar webhook route only.
app.post(
  '/api/v1/payment/webhook',
  bodyParser.raw({ type: 'application/json' }),
  paymentController.handleWebhook,
);

app.use(express.json({ limit: '10kb' }));

// Custom Mongo Sanitize for Express 5 compatibility
// Express 5 makes req.query a read-only getter, so we must mutate it in-place
app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) {
    const sanitizedQuery = sanitize(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }
  next();
});

// mounting the routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/finances', financesRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/payment', paymentRouter);

// Handle undefined routes
app.all('/{*any}', (req, res, next) => {
  // remenber to use this syntax henceforth due to the new version of express
  // This will catch all undefined routes and pass to the next middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
