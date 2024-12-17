const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  Mess_ID: {
    type: Number,
    required: true,
    unique: true,
  },
  Mess_Name: {
    type: String,
    required: true,
  },
  Mobile_No: {
    type: String,
    // required: true,
  },
  Capacity: {
    type: Number,
    // required: true,
  },
  Address: {
    type: String,
    // required: true,
  },
  Owner_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Description: {
    type: String,
    default: '',
  },
  Ratings: {
    type: [Number],
    default: [],
  },
  RatedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  UserID: {
    type: Number,
    required: true,
    unique: true,
  },
  Image: {
    type: String,
    default:"http://res.cloudinary.com/dq3ro4o3c/image/upload/v1734445757/gngcgm82wwo5t0desu0w.jpg", 
  },
}, { timestamps: true });

const Mess = mongoose.model('Mess', messSchema);
module.exports = Mess;
