import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analytics', analyticsRoutes); // Member 3

// Routes Placeholders
// app.use('/api/inventory', inventoryRoutes); // Member 1
// app.use('/api/borrowing', borrowingRoutes); // Member 2
// app.use('/api/admin', adminRoutes);         // Member 4

app.get('/', (req, res) => {
  res.send('UNI NEST API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
