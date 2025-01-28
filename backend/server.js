const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import User model
const User = require('./models/User');

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

// Get users who clicked "Start Today" on the current day
// app.get('/get-users', async (req, res) => {
//   try {
//     // Get the current date range (start and end of the day)
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // Fetch users where `clickedStartToday` is true and `dateJoined` is within today
//     const users = await User.find({
//       clickedStartToday: true,
//       dateJoined: { $gte: startOfDay, $lte: endOfDay },
//     });

//     res.status(200).send({ message: 'Users fetched successfully', users });
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).send({ message: 'Error fetching users', error: err.message });
//   }
// });
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


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export for testing or further modularization
