const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    googleId: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      default: 'local',
      enum: ['local', 'google'],
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

