const express = require('express');
const verifytoken = require('../utils/verifyuser');
const { create, getposts, deletepost,updatepost } = require('../controllers/post_controller');
const router = express.Router();

router.post('/create', verifytoken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifytoken, deletepost); 
router.put('/updatepost/:postId/:userId', verifytoken, updatepost); 

module.exports = router;