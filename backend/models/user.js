const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: 
  {
    type: String,
    default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ_vCbjnN80sd95r6zxqgEQdy8ZM5Kg3RU0g&s",
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;