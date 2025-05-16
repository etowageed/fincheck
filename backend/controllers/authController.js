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
