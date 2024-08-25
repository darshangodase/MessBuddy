const express = require('express');
const router=express.Router();
const {signup,signin,google}=require('../controllers/auth');


router.post('/signup',signup); 
router.post('/signin',signin); 
router.post('/google',google); 

module.exports = router;