const mongoose = require('mongoose');

// Define the updated User schema
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    //required: true 
  },
  email: { 
    type: String, 
    //required: true, 
    //unique: true 
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
    type: String, 
    
  },
  preferredSolvingTime: { 
    type: String, 
    
  },
  profilePic: { 
    type: String, 
    
  
  }, // Store image URL
});

// Create a User model based on the updated schema
module.exports = mongoose.model('User', UserSchema);
