const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const errorhandler = require("../utils/error");

// signup controller
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try 
  {
    if(!username || !email || !password) 
      {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
    const existingUser = await User.findOne({ email });
    if(existingUser) 
      {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
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
    next(errorhandler(500, "Internal Server Error"));
  }
};

module.exports = signup;