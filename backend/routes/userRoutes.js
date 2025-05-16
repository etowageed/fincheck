const express = require('express');
const User = require('../models/userModel');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

module.exports = router;
