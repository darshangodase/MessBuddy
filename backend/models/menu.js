const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  Menu_Name: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  Owner_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Availability: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes',
  },
  Food_Type: {
    type: String,
    enum: ['Veg', 'Non-Veg'],
    default: 'Veg',
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Menu', menuSchema);