const express=require('express');
const verifytoken = require('../utils/verifyuser');
const { create,getpost } =require('../controllers/post_controller');
const router = express.Router();


router.post('/create', verifytoken, create)
router.get('/create',getpost);
module.exports = router;