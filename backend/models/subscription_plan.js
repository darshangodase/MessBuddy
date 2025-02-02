const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Jain'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema); 