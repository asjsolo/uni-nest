import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
// Enable CORS to allow requests from the frontend
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// User routes mapping
app.use('/api/auth', userRoutes);

// Scaffolded module routes mapping
app.use('/api/inventory', inventoryRoutes);
app.use('/api/bookings', bookingRoutes);
import adminRoutes from './routes/adminRoutes.js';
app.use('/api/admin', adminRoutes);

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
