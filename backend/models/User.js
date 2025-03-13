const mongoose = require('mongoose');

// Define the updated User schema
const UserSchema = new mongoose.Schema({
  username: { 
    type: String
  },
  email: { 
    type: String
  },
  uid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  dateJoined: { 
    type: Date, 
    default: Date.now 
  },
  clickedStartToday: { 
    type: Boolean, 
    default: false 
  },
  preferredLanguage: { 
    type: String
  },
  preferredSolvingTime: { 
    type: String
  },
  profilePic: { 
    type: String
  }, // Store image URL

  // 🟢 LeetCode Integration
  leetcodeProfileId: { 
    type: String, 
    default: ""
  },
  solvedQuestions: { 
    type: Number, 
    default: 0 
  },
  solvedProblems: { 
    type: [String], 
    default: [] 
  },
  leetcodeLastUpdated: { 
    type: Date, 
    default: null 
  },
  partner: { 
    type: String,
    default: null
  }, // Stores the partner's user ID
  pendingRequest: { 
    type: [String], 
    default: []
  }, // Stores the user ID of the pending request
  streakCount:{
    type:Number,
    default:0
  },
  
});

// Create a User model based on the updated schema
module.exports = mongoose.model('User', UserSchema);
