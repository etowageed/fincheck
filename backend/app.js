const path = require('path');
const express = require('express');

// importing the routers

const userRouter = require('./routes/userRoutes');
const expenseRouter = require('./routes/expenseRoutes');

const app = express();

app.use(express.json());
// mounting the routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/expenses', expenseRouter);

module.exports = app;
