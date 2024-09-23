const express = require('express');
const router = express.Router();
const {signout} = require('../controllers/user_controller');
const verifytoken = require('../utils/verifyuser');

router.post('/signout', signout);


module.exports = router;
