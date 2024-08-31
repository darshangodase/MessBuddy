const errorHandler = require("../utils/error");
const Post = require("../models/post");

const create = async (req, res, next) => {
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    return next(errorHandler(403, "This title has already been saved"));
  }
};

const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(errorHandler(500, "Internal Server error"));
  }
};

const deletepost = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this post"));
  }

  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error); // Log the error details
    next(errorHandler(500, "Internal Server error"));
  }
};

const updatepost = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }

  const postId = req.params.postId;
  if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(errorHandler(400, "Invalid post ID"));
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          slug: req.body.title
            .split(" ")
            .join("-")
            .toLowerCase()
            .replace(/[^a-zA-Z0-9-]/g, ""),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!updatedPost) {
      return next(errorHandler(404, "Post not found"));
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    next(errorHandler(500, "Internal Server error"));
  }
};

module.exports = { create, getposts, deletepost, updatepost };
