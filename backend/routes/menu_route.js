const express = require('express');
const router = express.Router();
const { createMenu, getAllMenus, updateMenu, deleteMenu, searchMenu } = require('../controllers/menu_controller');

router.post('/create/:ownerId', createMenu);
router.get('/:ownerId', getAllMenus);
router.put('/update/:menuId', updateMenu);
router.delete('/delete/:menuId', deleteMenu);
router.get('/search/:ownerId', searchMenu); // Add search route

module.exports = router;