const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/user_route');
const authRoute = require('./routes/auth_route');
const messRoutes = require('./routes/mess_route');
const menuRoutes= require('./routes/menu_route')
const prebookingRoutes = require('./routes/prebooking');
const FeedbackRoute = require('./routes/feedback_route');
const cookieParser = require('cookie-parser');
const subscriptionRoutes = require('./routes/subscription_route');
const forumRoutes = require('./routes/forum_route');
const mealPassRoutes = require('./routes/meal_pass_route');
const checkInRoutes = require('./routes/check_in_route');


require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
connectDB();


app.use(cors({ 
  origin: [
    'https://messbuddy-app.netlify.app', 
    'http://localhost:5173',
    'http://localhost:3000'
  ], 
  credentials: true 
})); 

app.get('/', function(req, res) {
  res.send('Hello World!')
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/user', userRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/prebooking', prebookingRoutes);
app.use('/api/feedback',FeedbackRoute);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/mealpass', mealPassRoutes);
app.use('/api/checkin', checkInRoutes);




app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});