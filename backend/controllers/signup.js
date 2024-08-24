const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const errorhandler = require("../utils/error");

// signup controller
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if(!username || !email || !password) {
    next(errorhandler(400,"All fields are required"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
     next(errorhandler(400,"Invalid email format"));
  }

  if (password.length < 8) {
     next(errorhandler(400,"Password must be at least 8 characters long"));
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ success: true, message: "User created successfully" });
  } 
  catch (error) {
    next(errorhandler(400,"user not created"));
  }
};

module.exports = signup;