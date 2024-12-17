const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Mess = require('../models/mess');
const errorhandler = require('../utils/error');

const signup = async (req, res, next) => {
  const { username, email, password, login_role } = req.body;

  try {
    if (!username || !email || !password || !login_role || username === '' || email === '' || password === '' || login_role === '') {
      console.log('All fields are required');
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });
    
    if (existingUserByEmail) {
      console.log('Found existing user by email');
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    if (existingUserByUsername) {
      console.log('Found existing user by username');
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      UserID: Date.now(),
      username,
      email,
      password: hashedPassword,
      Login_Role: login_role,
    });

    await newUser.save();

    if (login_role === 'Mess Owner') {
      const randomSuffix = Math.floor(Math.random() * 1000);
      const messName = `Mess${randomSuffix}`; 
      
      const newMess = new Mess({
        Mess_ID: Date.now(),
        Mess_Name: messName,
        Mobile_No: '',
        Capacity: '',
        Address: '',
        Owner_ID: newUser._id, 
        Description: '',
        UserID: Date.now(), 
        Image: "http://res.cloudinary.com/dq3ro4o3c/image/upload/v1734445757/gngcgm82wwo5t0desu0w.jpg",
      });
    
      try {
        await newMess.save();
      } catch (error) {
        console.error('Error creating mess:');
       
      }
    }
    const token = jwt.sign({ id: newUser._id, role: newUser.Login_Role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.status(201)
      .cookie('access_token', token, { httpOnly: true, sameSite: 'None', secure: true })
      .json({ success: true, message: 'User created successfully', user: { username, email, login_role } });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
    console.log(error.message);
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
