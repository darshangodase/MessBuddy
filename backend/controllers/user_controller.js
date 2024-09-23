const errorHandler = require("../utils/error");
const bcrypt = require('bcryptjs');
const User = require('../models/user');


const signout = (req, res,next) => {
    try
    {
       res.clearCookie('access_token').status(200).json("User has been signed out");
    }
    catch(error) 
    {
        next(error);
    }
}


module.exports = {signout };