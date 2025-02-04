const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

//socket.io


const app = express();

// Middleware
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);



app.use(cors());
app.use(bodyParser.json());

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
app.get('/get-users', async (req, res) => {
  const { uid } = req.query; // Get UID from query params

  if (!uid) {
    return res.status(400).send({ message: 'Missing UID in request' });
  }

  try {
    // Get the current date range (start and end of the day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch users where `clickedStartToday` is true, `dateJoined` is within today, and exclude the current user
    const users = await User.find({
      clickedStartToday: true,
      dateJoined: { $gte: startOfDay, $lte: endOfDay },
      uid: { $ne: uid }, // Exclude the current user's UID
    });

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





// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export for testing or further modularization
