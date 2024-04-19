// VATSAL GABANI [gabanivatsal17@gmail.com]

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const { database } = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the MongoDB database
mongoose.connect(database, {
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware for parsing JSON
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
