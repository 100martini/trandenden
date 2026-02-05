const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  creatorId: { 
    type: Number, 
    required: true,
    index: true
  },
  project: {
    slug: { type: String, required: true },
    name: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
    index: true
  },
  members: [{
    id: { type: Number, required: true },
    login: String,
    avatar: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  kanban: {
    todo: [{ type: mongoose.Schema.Types.Mixed }],
    inProgress: [{ type: mongoose.Schema.Types.Mixed }],
    review: [{ type: mongoose.Schema.Types.Mixed }],
    done: [{ type: mongoose.Schema.Types.Mixed }]
  }
}, {
  timestamps: true
});

teamSchema.index({ 'members.id': 1, status: 1 });

module.exports = mongoose.model('Team', teamSchema);