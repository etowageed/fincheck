const User = require('../models/userModel');

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    // const newUser = await User.create({
    //   name: req.body.name,
    //   email: req.body.email,
    //   password: req.body.password,
    // });

    res.status(201).json({
      status: 'success',
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
