const express=require('express');
const verifytoken = require('../utils/verifyuser');
const { create } =require('../controllers/post_controller');
const router = express.Router();

router.post('/create', verifytoken, create)

module.exports = router;