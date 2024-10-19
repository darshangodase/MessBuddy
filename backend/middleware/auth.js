const jwt = require('jsonwebtoken');
const errorhandler = require('../utils/error');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(errorhandler(401, 'Access Denied'));
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    next(errorhandler(400, error.message));
  }
};

const verifyMessOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.Login_Role !== 'Mess Owner') {
      return next(errorhandler(403, 'Access Denied'));
    }
    next();
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

module.exports = { verifyToken, verifyMessOwner };