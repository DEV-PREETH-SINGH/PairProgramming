const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error: ', err));

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Save the user's data when they press 'Start Today'
app.post('/start-today', async (req, res) => {
  const { username } = req.body;
  console.log(username)
  try {
    const newUser = new User({ username });
    console.log(newUser)
    await newUser.save();
    res.status(200).send({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error adding user', error: err });
  }
});

// Get the list of users who pressed "Start Today" on the same day
app.get('/get-users', async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const users = await User.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    res.status(200).send({ users });
  } catch (err) {
    res.status(500).send({ message: 'Error fetching users', error: err });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
