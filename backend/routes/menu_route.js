const express = require('express');
const router = express.Router();
// const { verifyToken, verifyMessOwner } = require('../middleware/auth');
const { createMenu, getAllMenus, updateMenu, deleteMenu } = require('../controllers/menu_controller');

router.post('/create/:ownerId', createMenu);
router.get('/:ownerId',  getAllMenus);
router.put('/update/:menuId', updateMenu);
router.delete('/delete/:menuId', deleteMenu);

module.exports = router;