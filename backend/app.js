// const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // Add this
require('dotenv').config();

const app = express();

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

// Initialize Passport
const passport = require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

// importing the routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const expenseRouter = require('./routes/expenseRoutes');

app.use(express.json({ limit: '10kb' }));
// mounting the routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/expenses', expenseRouter);

module.exports = app;

// TODO: add rate limiting for brute force attacks
// TODO: add https
