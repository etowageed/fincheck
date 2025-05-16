const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.post('/create-expense', expenseController.createExpense);

module.exports = router;
