const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const messRoutes = require('./routes/mess_route');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Enable CORS for frontend origin
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/user', userRoutes);
app.use('/api/mess',messRoutes)


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(err); // Log the error for debugging
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