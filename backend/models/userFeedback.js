const mongoose = require('mongoose');

const userFeedbackSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  comments: {
    type: String,
    required: true, 
    maxLength: 500, 
  },
  rating: {
    type: Number,
    required: true, 
    min: 1,
    max: 5, 
  },
  submittedAt: {
    type: Date,
    default: Date.now, 
  },
});

const UserFeedback = mongoose.model('UserFeedback', userFeedbackSchema);

module.exports = UserFeedback;
