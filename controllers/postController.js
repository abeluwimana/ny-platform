// backend/controllers/postController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Admin, Client, Creator, Couple)
const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150),
        coverImage: coverImage || '',
        category: category || 'general',
        userId: req.user.id,
        status: 'PUBLISHED'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
};

// @desc    Get all posts (public)
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    
    const where = { status: 'PUBLISHED' };
    if (category && category !== 'all') {
      where.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.post.count({ where });

    res.json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    // Increment view count
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        },
        comments: {
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
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post'
    });
  }
};

// @desc    Update post (Owner or Admin)
// @route   PUT /api/posts/:id
// @access  Private (Owner/Admin)
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    const { title, content, excerpt, coverImage, category } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const isOwner = existingPost.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title || undefined,
        content: content || undefined,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        category: category || undefined
      }
    });

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating post'
    });
  }
};

// @desc    Delete post (Owner or Admin)
// @route   DELETE /api/posts/:id
// @access  Private (Owner/Admin)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isOwner = existingPost.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete all comments first
    await prisma.comment.deleteMany({
      where: { postId }
    });

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const post = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Post liked',
      likes: post.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error liking post'
    });
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/:id/unlike
// @access  Private
const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const post = await prisma.post.update({
      where: { id: postId },
      data: { likes: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: 'Post unliked',
      likes: post.likes
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unliking post'
    });
  }
};

// @desc    Share a post (increment share count)
// @route   PUT /api/posts/:id/share
// @access  Private
const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const post = await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Post shared',
      shares: post.shares
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sharing post'
    });
  }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);

    const posts = await prisma.post.findMany({
      where: {
        userId: userIdInt,
        status: 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user posts'
    });
  }
};

// @desc    Get my posts (logged in user)
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: req.user.id },
      include: {
        comments: {
          select: {
            id: true,
            content: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your posts'
    });
  }
};

// @desc    Report a post
// @route   POST /api/posts/:id/report
// @access  Private
const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for reporting'
      });
    }

    // Store report in localStorage equivalent or create Report model
    const reports = JSON.parse(localStorage.getItem('post_reports') || '[]');
    reports.push({
      id: Date.now(),
      postId,
      userId: req.user.id,
      reason,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('post_reports', JSON.stringify(reports));

    res.json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting post'
    });
  }
};

module.exports = {
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
};