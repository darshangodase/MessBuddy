
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO)
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection error:', err);
  }
};

module.exports = connectDB;