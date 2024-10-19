const Menu = require('../models/menu');
const errorhandler = require('../utils/error');

const createMenu = async (req, res, next) => {
  const { Menu_Name, Description, Price, Availability, Food_Type } = req.body;
  const Owner_ID = req.params.ownerId;

  try {
    const newMenu = new Menu({
      Menu_Name,
      Description,
      Price,
      Owner_ID,
      Availability,
      Food_Type,
    });

    await newMenu.save();
    res.status(201).json({ success: true, message: 'Menu created successfully', menu: newMenu });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({ Owner_ID: req.params.ownerId });
    res.status(200).json({ success: true, menus });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const updateMenu = async (req, res, next) => {
  const { Menu_Name, Description, Price, Availability, Food_Type } = req.body;

  try {
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.menuId,
      { Menu_Name, Description, Price, Availability, Food_Type },
      { new: true }
    );
    if (!updatedMenu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    res.status(200).json({ success: true, message: 'Menu updated successfully', menu: updatedMenu });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.menuId);
    if (!deletedMenu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    res.status(200).json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

module.exports = {
  createMenu,
  getAllMenus,
  updateMenu,
  deleteMenu,
};