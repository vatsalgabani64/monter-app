// VATSAL GABANI [gabanivatsal17@gmail.com]

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  verified: { type: Boolean, default: false },
  location: { type: String },
  age: { type: Number },
  workDetails: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
