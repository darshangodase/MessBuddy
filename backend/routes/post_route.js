const express = require('express');
const verifytoken = require('../utils/verifyuser');
const { create, getposts, deletepost } = require('../controllers/post_controller'); // Ensure the function name matches
const router = express.Router();

router.post('/create', verifytoken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifytoken, deletepost); // Ensure the function name matches

module.exports = router;