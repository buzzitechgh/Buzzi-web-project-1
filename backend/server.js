require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const formRoutes = require('./routes/formRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. Database Connection
connectDB();

// 2. Security & Middleware
app.use(helmet()); // Secure Headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// Rate Limiting for Public APIs (Prevent Abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// 3. Routes
app.use('/api/products', productRoutes); // Store Products
app.use('/api/orders', orderRoutes);     // Checkout/Orders
app.use('/api/forms', formRoutes);       // Contact, Booking, Quote
app.use('/api/auth', authRoutes);        // Admin Login

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));