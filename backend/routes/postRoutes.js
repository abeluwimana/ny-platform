// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  sharePost,
  getPostsByUser,
  getMyPosts,
  reportPost
} = require('../controllers/postController');
const {
  addComment,
  getPostComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============ POST ROUTES ============

// Public routes
router.get('/', getAllPosts);
router.get('/user/:userId', getPostsByUser);
router.get('/:id', getPostById);

// Protected routes (all authenticated users)
router.use(protect);

// Post CRUD
router.post('/', createPost);
router.get('/my-posts', getMyPosts);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Post interactions
router.put('/:id/like', likePost);
router.put('/:id/unlike', unlikePost);
router.put('/:id/share', sharePost);
router.post('/:id/report', reportPost);

// ============ COMMENT ROUTES ============

// Public
router.get('/:postId/comments', getPostComments);

// Protected
router.post('/comments', addComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);

module.exports = router;