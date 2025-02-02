const express = require('express');
const router = express.Router();
const { 
  createPost,
  getPosts,
  addComment,
  votePoll,
  likePost,
  updatePost,
  deletePost,
  likeComment,
  deleteComment
} = require('../controllers/forum_controller');

router.post('/posts/create/:userId', createPost);
router.get('/posts', getPosts);
router.post('/posts/:postId/comment/:userId', addComment);
router.post('/posts/:postId/vote/:userId', votePoll);
router.post('/posts/:postId/like/:userId', likePost);
router.put('/posts/:postId/:userId', updatePost);
router.delete('/posts/:postId/:userId', deletePost);
router.post('/posts/:postId/comments/:commentId/like/:userId', likeComment);
router.delete('/posts/:postId/comments/:commentId/:userId', deleteComment);

module.exports = router; 