const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const postroutes = require('./routes/post_route');
const commentsRoute = require('./routes/comment_route');
const cookieParser = require('cookie-parser');
const path =require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
connectDB();
const ___dirname = path.resolve();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join(___dirname, '/frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(___dirname, 'frontend', 'dist', 'index.html'));
});

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