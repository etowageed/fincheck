const path = require('path');
const express = require('express');

// importing the routers

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const expenseRouter = require('./routes/expenseRoutes');

const app = express();

app.use(express.json({ limit: '10kb' }));
// mounting the routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/expenses', expenseRouter);

module.exports = app;

// TODO: add rate limiting for brute force attacks
// TODO: add https
