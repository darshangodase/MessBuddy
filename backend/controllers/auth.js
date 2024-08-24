const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
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




const signin=async (req, res, next) => {
  const { username, password } = req.body;
  
    if(!username || !password || username==="" || password==="") 
      {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
     try 
     {
       const validUser=await User.findOne({ username: username});
       if(!validUser) 
       {
          return res.status(400).json({ success: false, message: "Invalid Credentials" });
       }
       const ValidPassword = await bcryptjs.compare(password, validUser.password);
       if(!ValidPassword)
        {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }
        
        const token = jwt.sign({ id: validUser._id,},process.env.JWT_SECRET_KEY);

        const {password:pass,...rest}=validUser._doc;
        res.status(200).cookie('token', token, { httpOnly: true }).json(rest);
    }
    catch (error) {
      next(errorhandler(500, "Internal Server Error"));
    }
};

module.exports = {signup: signup,signin:signin};