const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
require('dotenv').config();
const router = express.Router();
//socket.io


const app = express();

// Middleware
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);



app.use(cors());
app.use(bodyParser.json());



app.use('/uploads', express.static('uploads')); // Serve images from 'uploads' folder

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: './uploads/', // Save uploaded files in 'uploads' folder
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });




// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import User model
const User = require('./models/User');

// Import Message model
const Message = require('./models/message'); // Assuming you have created this in the models folder

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send({ message: 'Server is running' });
});

// Signup Endpoint: Save user info to MongoDB after Firebase Authentication
app.post('/signup', async (req, res) => {
  const { username, email, uid } = req.body;

  if (!username || !email || !uid) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    console.log("1")
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists' });
    }

    const newUser = new User({
      username,
      email,
      uid,
      clickedStartToday: false, // Initialize as false
      dateJoined: null,         // No timestamp until "Start Today" is clicked
      preferredLanguage:"",
      preferredSolvingTime:"",
    });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send({ message: 'Error registering user', error: err.message });
  }
});

// "Start Today" Endpoint: Update user status
app.post('/start-today', async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).send({ message: 'Missing UID' });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Update `clickedStartToday` and `dateJoined`
    user.clickedStartToday = true;
    user.dateJoined = new Date(); // Current timestamp
    await user.save();

    res.status(200).send({ message: 'Start Today status updated successfully', user });
  } catch (err) {
    console.error('Error updating Start Today status:', err);
    res.status(500).send({ message: 'Error updating Start Today status', error: err.message });
  }
});

// Get users who clicked "Start Today" on the current day, excluding the current user
// server.js (Backend)
app.get('/get-users', async (req, res) => {
  const { uid } = req.query; // Get UID from query params

  if (!uid) {
    return res.status(400).send({ message: 'Missing UID in request' });
  }

  try {
    // Get the current user's profile preferences
    const currentUser = await User.findOne({ uid });
    if (!currentUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Get the current date range (start and end of the day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch users with profilePicUrl included
    const users = await User.find(
      {
        clickedStartToday: true,
        dateJoined: { $gte: startOfDay, $lte: endOfDay },
        preferredLanguage: currentUser.preferredLanguage,
        preferredSolvingTime: currentUser.preferredSolvingTime,
        uid: { $ne: uid }, // Exclude current user's UID
      },
      'uid username profilePic' // Include profilePicUrl in response
    );
    

    res.status(200).send({ message: 'Users fetched successfully', users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send({ message: 'Error fetching users', error: err.message });
  }
});



// =====================
// Messaging Endpoints
// =====================

// Endpoint to get messages between two users
app.get('/api/messages/get-messages', async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).send({ message: 'Missing user1 or user2 in request' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderUID: user1, receiverUID: user2 },
        { senderUID: user2, receiverUID: user1 },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp (oldest first)

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send({ message: 'Error fetching messages', error: err.message });
  }
});
// WebSocket connection event
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle receiving message
  socket.on('sendMessage', async (messageData) => {
    console.log('Message received:', messageData);

    try {
      const { senderUID, receiverUID, message } = messageData;

      const newMessage = new Message({
        senderUID,
        receiverUID,
        message,
        timestamp: new Date(),
      });

      const savedMessage = await newMessage.save();

      // Emit the new message to the receiver
      io.emit('newMessage', savedMessage);

      socket.emit('messageSent', savedMessage); // Emit back to sender for confirmation
    } catch (err) {
      console.error('Error handling sendMessage:', err);
      socket.emit('error', { message: 'Error sending message', error: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Your existing express server and message endpoint...
// Endpoint to send a new message
app.post('/api/messages/send-message', async (req, res) => {
  const { senderUID, receiverUID, message } = req.body;

  if (!senderUID || !receiverUID || !message) {
    return res.status(400).send({ message: 'Missing required fields: senderUID, receiverUID, or message' });
  }

  try {
    const newMessage = new Message({
      senderUID,
      receiverUID,
      message,
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();
    res.status(201).send({
      message: 'Message sent successfully',
      savedMessage,
    });

    // Emit the message via WebSocket
    io.emit('newMessage', savedMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).send({
      message: 'Error sending message',
      error: err.message,
    });
  }
});

// Route to get distinct chat users
app.get('/get-chat-users', async (req, res) => {
  const { uid } = req.query; // Current user UID from the frontend

  if (!uid) {
    return res.status(400).send('User UID is required');
  }

  try {
    const chatUsers = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderUID: uid },
            { receiverUID: uid }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderUID", uid] },
              then: "$receiverUID",
              else: "$senderUID"
            }
          }
        }
      },
      {
        $project: { _id: 1 } // Project only the user IDs
      }
    ]);

    if (chatUsers.length === 0) {
      return res.status(404).send('No chat users found');
    }

    res.json(chatUsers); // Send the list of users to the frontend
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).send('Server error');
  }
});

// app.post('/create-profile', async (req, res) => {
//   const { uid, preferredLanguage, preferredSolvingTime } = req.body;

//   if (!uid || !preferredLanguage || !preferredSolvingTime) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   try {
//     const existingUser = await User.findOne({ uid });

//     if (existingUser) {
//       existingUser.preferredLanguage = preferredLanguage;
//       existingUser.preferredSolvingTime = preferredSolvingTime;
//       await existingUser.save();
//       return res.status(200).json({ message: 'Profile updated successfully', user: existingUser });
//     }

//     const newUser = new User({ uid, preferredLanguage, preferredSolvingTime });
//     await newUser.save();
//     res.status(201).json({ message: 'Profile created successfully', user: newUser });
//   } catch (err) {
//     console.error('Error saving profile:', err);
//     res.status(500).json({ message: 'Error saving profile', error: err.message });
//   }
// });
// Profile Creation API

app.post('/create-profile', upload.single('profilePic'), async (req, res) => {
  const { uid, username, email, preferredLanguage, preferredSolvingTime } = req.body;
  console.log("username",username)
  if (!username || !uid || !email || !preferredLanguage || !preferredSolvingTime || !req.file) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const profilePicUrl = `http://192.168.68.78:5000/uploads/${req.file.filename}`;
  
    const newUser = new User({
      uid,
      username,
      email,
      preferredLanguage,
      preferredSolvingTime,
      profilePic: profilePicUrl,
    });
    //console.log(existingUser)
    //console.log("newuser:",newUser)
    
    await newUser.save();
    res.status(200).json({ message: 'Profile created successfully', user: newUser });
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ message: 'Error creating profile', error: err.message });
  }
});

app.put('/update-profile', upload.single('profilePic'), async (req, res) => {
  const { uid, username, preferredLanguage, preferredSolvingTime } = req.body;

  if (!uid || !username || !preferredLanguage || !preferredSolvingTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const updatedFields = {
      username,
      preferredLanguage,
      preferredSolvingTime,
    };

    if (req.file) {
      const profilePicUrl = `http://192.168.68.78:5000/uploads/${req.file.filename}`;
      updatedFields.profilePic = profilePicUrl;
    }

    const existingUser = await User.findOne({ uid });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile with new values
    existingUser.username = username;
    existingUser.preferredLanguage = preferredLanguage;
    existingUser.preferredSolvingTime = preferredSolvingTime;

    // Only update profile picture if it's provided
    if (updatedFields.profilePic) {
      existingUser.profilePic = updatedFields.profilePic;
    }

    await existingUser.save();

    res.status(200).json({ message: 'Profile updated successfully', user: existingUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});



// app.put('/update-profile', async (req, res) => {
//   const { uid, username, preferredLanguage, preferredSolvingTime } = req.body;

//   if (!uid || !username || !preferredLanguage || !preferredSolvingTime) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   try {
//     const updatedUser = await User.findOneAndUpdate(
//       { uid }, // Find user by UID
//       { username, preferredLanguage, preferredSolvingTime },
//       { new: true, upsert: false } // Do not create a new user if not found
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
//   } catch (err) {
//     console.error('Error updating profile:', err);
//     res.status(500).json({ message: 'Error updating profile', error: err.message });
//   }
// });

// API endpoint to fetch user details by UID


// router.put('/update-profile', upload.single('profilePic'), async (req, res) => {
//   const { uid, username, preferredLanguage, preferredSolvingTime } = req.body;
//   const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save the profile picture URL
//   console.log("cameinside")
//   if (!uid || !username || !preferredLanguage || !preferredSolvingTime) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   try {
//     const updateFields = { username, preferredLanguage, preferredSolvingTime };
//     if (profilePicUrl) updateFields.profilePic = profilePicUrl; // Update profilePic if new image is uploaded

//     const updatedUser = await User.findOneAndUpdate({ uid }, updateFields, { new: true });

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
//   } catch (err) {
//     console.error('Error updating profile:', err);
//     res.status(500).json({ message: 'Error updating profile', error: err.message });
//   }
// });

app.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ message: 'Error fetching user data', error: err.message });
  }
});

//update profile pic
// router.put('/update-profile-pic', upload.single('profilePic'), async (req, res) => {
//   const { uid } = req.body;
//   console.log(uid)

//   if (!uid || !req.file) {
//     return res.status(400).send({ message: 'Missing UID or file' });
//   }

//   try {
//     const imageUrl = `http://192.168.68.78:5000/uploads/${req.file.filename}`;
//     //console.log(imageUrl)

//     const updatedUser = await User.findOneAndUpdate(
//       { uid },
//       { profilePic: imageUrl },
//       // { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     res.status(200).send({ message: 'Profile picture updated', profilePic: updatedUser.profilePic });
//   } catch (err) {
//     console.error('Error updating profile picture:', err);
//     res.status(500).send({ message: 'Error updating profile picture', error: err.message });
//   }
// });






// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export for testing or further modularization
