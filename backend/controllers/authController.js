const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// creating the jwt token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1) basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a name, email and password',
      });
    }

    // 2) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with email already exists',
      });
    }
    // 3) Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  4) finally create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      income: req.body.income || 0,
      expenses: [],
    });
    // 5) create and send JWT
    const token = createToken(newUser._id);
    // 6) hide password in response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password are entered

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // 2) find user by email and check if user exists and pwd is correct
    const user = await User.findOne({ email }).select('+password');
    // TODO: hash passwords with bcrypt
    // TODO: implement proper auth with JWT and sessions
    // TODO: add rate limiting for brute force attacks
    // TODO: add https

    if (!user || user.password !== password) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // 3) send user data -- later implement jwt
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
    });
  }
};
