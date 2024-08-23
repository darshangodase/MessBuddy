const express = require('express');
const router = express.Router();
const test =require('../controllers/user_controller');

router.get('/test',test);

module.exports = router;