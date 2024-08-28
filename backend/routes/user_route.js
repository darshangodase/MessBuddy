const express = require('express');
const router = express.Router();
const { test, updateUser,deleteuser } = require('../controllers/user_controller');
const verifytoken = require('../utils/verifyuser');

router.get('/test', test);
router.put('/update/:userId', verifytoken, updateUser);
router.delete('/delete/:userId',verifytoken, deleteuser)
module.exports = router;
