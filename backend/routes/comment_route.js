const express = require('express');
const verifytoken = require('../utils/verifyuser');

const {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
  getcomments,
  likeComment,
} =require('../controllers/comment.controller');

const router = express.Router();

router.post('/create', verifytoken, createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId', verifytoken, likeComment);
router.put('/editComment/:commentId', verifytoken, editComment);
router.delete('/deleteComment/:commentId', verifytoken, deleteComment);
router.get('/getcomments', verifytoken, getcomments);

module.exports = router;