const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  intraId: { 
    type: Number, 
    unique: true, 
    required: true,
    index: true
  },
  login: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  displayName: String,
  avatar: {
    small: String,
    medium: String,
    large: String
  },
  campus: String,
  cursus: [String],
  wallet: {
    type: Number,
    default: 0
  },
  correctionPoints: {
    type: Number,
    default: 0
  },
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Date,
  lastLogin: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.accessToken;
  delete user.refreshToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);