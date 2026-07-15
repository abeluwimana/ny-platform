// backend/controllers/commentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Add comment to a post
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide post ID and comment content'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        postId: parseInt(postId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments'
    });
  }
};

// @desc    Update comment (Owner or Admin)
// @route   PUT /api/comments/:id
// @access  Private (Owner/Admin)
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const commentId = parseInt(id);
    const { content } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const isOwner = existingComment.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content }
    });

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating comment'
    });
  }
};

// @desc    Delete comment (Owner or Admin)
// @route   DELETE /api/comments/:id
// @access  Private (Owner/Admin)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const commentId = parseInt(id);

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const isOwner = existingComment.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
};

module.exports = {
  addComment,
  getPostComments,
  updateComment,
  deleteComment
};