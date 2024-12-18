const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const messRoutes = require('./routes/mess_route');
const menuRoutes= require('./routes/menu_route')
const prebookingRoutes = require('./routes/prebooking');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true })); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/user', userRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/prebooking', prebookingRoutes);





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