const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled', 'Pending', 'Plan Removed'],
    default: 'Pending'
  },
  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  cancellationReason: {
    type: String
  }
}, { timestamps: true });

// Add compound index for faster queries and ensuring uniqueness
userSubscriptionSchema.index({ userId: 1, planId: 1, status: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema); 