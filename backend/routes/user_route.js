const express = require('express');
const router = express.Router();
const { test, updateUser } = require('../controllers/user_controller');
const verifytoken = require('../utils/verifyuser');

router.get('/test', test);
router.put('/update/:userId', verifytoken, updateUser);
module.exports = router;
