const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const errorhandler = require("../utils/error");

// signup controller
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if(!username || !email || !password) {
    return next(errorhandler(400,"All fields are required"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(errorhandler(400,"Invalid email format"));
  }

  if (password.length < 6) {
    return next(errorhandler(400,"Password must be at least 6 characters long"));
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    re.send("Signup successful");
  } 
  catch (error) {
    next(error);
  }
};

module.exports = signup;