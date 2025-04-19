const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ['owner','employee','society'], default: 'society' },
  requestsMade: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
