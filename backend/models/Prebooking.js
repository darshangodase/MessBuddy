const mongoose = require('mongoose');

const prebookingSchema = new mongoose.Schema(
  {
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
    },
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mess',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, 
      default: 1,
    },
  },
  { timestamps: true }
);

prebookingSchema.index({ userId: 1 });
prebookingSchema.index({ messId: 1 });

module.exports = mongoose.model('Prebooking', prebookingSchema);
