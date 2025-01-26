const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateJoined: { type: Date, default: Date.now },
  clickedStartToday: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
