const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const postroutes = require('./routes/post_route');
const commentsRoute = require('./routes/comment_route');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'https://blogbreeze-app.netlify.app', // Corrected quotation marks
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Corrected quotation marks
    allowedHeaders: [
      'Origin', // Corrected quotation marks
      'Content-Type', // Corrected quotation marks
      'Accept', // Corrected quotation marks
      'Authorization', // Corrected quotation marks
      'X-Requested-With', // Corrected quotation marks
    ],
  })
);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoute);
app.use('/api/post', postroutes);
app.use('/api/comment', commentsRoute);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});