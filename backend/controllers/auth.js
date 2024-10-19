const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const errorhandler = require('../utils/error');

const signup = async (req, res, next) => {
  const { username, email, password, login_role } = req.body;

  try {
    if (!username || !email || !password || !login_role || username === '' || email === '' || password === '' || login_role === '') {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      UserID: Date.now(), // Generate a unique UserID
      username,
      email,
      password: hashedPassword,
      Login_Role: login_role,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.Login_Role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.status(201)
      .cookie('access_token', token, { httpOnly: true, sameSite: 'None', secure: true })
      .json({ success: true, message: 'User created successfully', user: { username, email, login_role } });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const signin = async (req, res, next) => {
  const { username, password, login_role } = req.body;

  if (!username || !password || !login_role || username === '' || password === '' || login_role === '') {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    const validUser = await User.findOne({ username, Login_Role: login_role });
    if (!validUser) {
      return res.status(400).json({ success: false, message: 'Invalid Credentials' });
    }
    const validPassword = await bcryptjs.compare(password, validUser.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: validUser._id, role: validUser.Login_Role }, process.env.JWT_SECRET_KEY);

    const { password: pass, ...rest } = validUser._doc;
    res
      .status(200)
      .cookie('access_token', token, { httpOnly: true, sameSite: 'None', secure: true })
      .json({ success: true, user: rest, token });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

module.exports = { signup, signin };

