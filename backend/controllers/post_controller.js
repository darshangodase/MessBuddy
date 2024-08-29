const errorHandler = require('../utils/error'); 
 const Post = require('../models/post');
  const create=async(req,res,next)=>{
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to create a post'));
      }
      if (!req.body.title || !req.body.content) {
        return next(errorHandler(400, 'Please provide all required fields'));
      }
      const slug = req.body.title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '');
      const newPost = new Post({
        ...req.body,
        slug,
        userId: req.user.id,
      });
      try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
      }  catch (error) {
        return next(errorHandler(403,'This title has already been saved'));

      }

  }

module.exports={create};