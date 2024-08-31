const express = require('express');
const app = express();
const connectDB = require('./config/db');
var cors = require('cors')
const userRoutes = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const postroutes = require('./routes/post_route');
const cookieParser= require('cookie-parser');
require('dotenv').config();
connectDB();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoute);
app.use('/api/post', postroutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(3000);