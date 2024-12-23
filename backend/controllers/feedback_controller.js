const Feedback = require('../models/userFeedback');

const createFeedback = async (req, res) => {
    const { userID, comments, rating } = req.body;
    
    try {
      if (!userID || !comments || !rating) 
        {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const newFeedback = new Feedback({
        userID,
        comments,
        rating,
      });
        await newFeedback.save();
  
      res.status(201).json({
        message: "Feedback submitted successfully",
        feedback: newFeedback,
      });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  };

  // Get All Feedbacks
const getAllFeedbacks = async (req, res) => {
    try {
        
      const feedbacks = await Feedback.find()
        .populate("userID", "username") 
        .sort({ submittedAt: -1 }); 
  
      res.status(200).json({feedbacks:feedbacks});
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      res.status(500).json({ error: "Failed to fetch feedbacks" });
    }
  };
  
  module.exports = {
    createFeedback,
    getAllFeedbacks
  };