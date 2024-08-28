const errorHandler = require("../utils/error");
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const test = (req, res) => {
    res.json({ message: 'Welcome to the BlogBreeze API!' });
};

const updateUser = async (req, res, next) => {
    if (req.user.id != req.params.userId) {
        return next(errorHandler(400, "You are not authorized to update this user"));
    }

    if (req.body.password) {
        if (req.body.password.length < 8) {
            return next(errorHandler(400, "Please enter a password of at least 8 characters"));
        }
        req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    if (req.body.username) {
        if (req.body.username.length < 7 || req.body.username.length > 20) {
            return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
        }
        if (req.body.username.includes(' ')) {
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if (req.body.username !== req.body.username.toLowerCase()) {
            return next(errorHandler(400, 'Username must be lowercase'));
        }
        if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, 'Username can only contain letters and numbers'));
        }
    }

    if (req.body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return next(errorHandler(400, 'Please enter a valid email address'));
        }
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    profilePicture: req.body.profilePicture,
                    password: req.body.password,
                },
            },
            { new: true }
        );
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}

const deleteuser = async (req, res, next) => {
      if(req.user.id != req.params.userId){
        return next(errorHandler(400, "You are not authorized to delete this user"));
      }
      try{
      await User.findByIdAndDelete(req.params.userId);
      res.status(200).json('User has been deleted');
      
      }
      catch(error)
      {
        res.status(400).json('Could not delete the user');
      }
}
module.exports = { test, updateUser,deleteuser };