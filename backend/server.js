import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
// Enable CORS to allow requests from the frontend
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Configure the PORT
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');

    // Start the Express server once the database is connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  });
