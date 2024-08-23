const User = require("../models/user");
const bcryptjs = require("bcryptjs");

// signup controller
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    email === "" ||
    password === "" ||
    username === ""
  ) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  const hashedpasswords =bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedpasswords,
  });
  await newUser.save();
  res.send("User registered successfully");
};

module.exports = signup;
