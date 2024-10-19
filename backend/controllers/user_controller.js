
const Menu = require('../models/menu');
const Mess = require('../models/mess');
const User = require('../models/user');
const errorhandler = require('../utils/error');

const signout = (req, res, next) => {
    try {
      res.clearCookie('access_token', { httpOnly: true, sameSite: 'None', secure: true })
        .status(200)
        .json({ success: true, message: "User has been signed out" });
    } catch (error) {
      next(error);
    }
  };
  
const deleteUserAccount = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const firstMenu = await Menu.findOneAndDelete({ Owner_ID: userId });
   
    const allMenus = await Menu.deleteMany({ Owner_ID: userId });

    const mess = await Mess.findOneAndDelete({ Owner_ID: userId });
    

    const user = await User.findByIdAndDelete(userId);
  

    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

  module.exports = { signout ,deleteUserAccount};