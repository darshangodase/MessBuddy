const ForumPost = require('../models/forum_post');
const { errorHandler } = require('../utils/error');

// Create a post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, type, messId, pollOptions } = req.body;
    const author = req.params.userId;

    if (!author) {
      return next(errorHandler(401, 'You must be logged in to create a post'));
    }

    const postData = {
      title,
      content,
      author,
      type,
      messId
    };

    if (type === 'poll' && pollOptions) {
      postData.pollOptions = pollOptions.map(option => ({
        text: option,
        votes: []
      }));
    }

    const post = new ForumPost(postData);
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// Get all posts (with filters)
exports.getPosts = async (req, res, next) => {
  try {
    const { messId, type, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (messId) query.messId = messId;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate total posts and pages
    const totalPosts = await ForumPost.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    const skip = (page - 1) * limit;

    const posts = await ForumPost.find(query)
      .populate('author', 'username')
      .populate('messId', 'Mess_Name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.params.userId;

    if (!userId) {
      return next(errorHandler(401, 'You must be logged in to comment'));
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    post.comments.push({ userId, content });
    await post.save();

    // Populate the user information for the new comment
    const populatedPost = await ForumPost.findById(postId)
      .populate('comments.userId', 'username')
      .populate('author', 'username')
      .populate('messId', 'Mess_Name');

    res.status(200).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// Vote on poll
exports.votePoll = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const postId = req.params.postId;
    const userId = req.params.userId;

    if (!userId) {
      return next(errorHandler(401, 'You must be logged in to vote'));
    }

    const post = await ForumPost.findById(postId);
    if (!post || !post.isPollActive) {
      return next(errorHandler(404, 'Poll not found or inactive'));
    }

    // Remove previous vote if exists
    post.pollOptions.forEach(option => {
      option.votes = option.votes.filter(vote => vote.toString() !== userId);
    });

    // Add new vote
    post.pollOptions[optionIndex].votes.push(userId);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Like/Unlike post
exports.likePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    if (!userId) {
      return next(errorHandler(401, 'You must be logged in to like posts'));
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { title, content, type, pollOptions } = req.body;
    const { postId, userId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    if (post.author.toString() !== userId) {
      return next(errorHandler(403, 'You can only edit your own posts'));
    }

    post.title = title;
    post.content = content;
    post.type = type;

    if (type === 'poll' && pollOptions) {
      // Keep existing votes for unchanged options
      const newPollOptions = pollOptions.map(optionText => {
        const existingOption = post.pollOptions.find(opt => opt.text === optionText);
        return existingOption || { text: optionText, votes: [] };
      });
      post.pollOptions = newPollOptions;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const { postId, userId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    if (post.author.toString() !== userId) {
      return next(errorHandler(403, 'You can only delete your own posts'));
    }

    await ForumPost.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Like/Unlike comment
exports.likeComment = async (req, res, next) => {
  try {
    const { postId, commentId, userId } = req.params;

    if (!userId) {
      return next(errorHandler(401, 'You must be logged in to like comments'));
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like the comment
      comment.likes.push(userId);
    } else {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId, userId } = req.params;
  
    const post = await ForumPost.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }
  
    // Find comment index
    const commentIndex = post.comments.findIndex(
      comment => comment._id.toString() === commentId
    );
  
    if (commentIndex === -1) {
      return next(errorHandler(404, 'Comment not found'));
    }
  
    if (post.comments[commentIndex].userId.toString() !== userId) {
      return next(errorHandler(403, 'You can only delete your own comments'));
    }
  
    // Remove comment using pull
    post.comments.pull({ _id: commentId });
    await post.save();
  
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}; 