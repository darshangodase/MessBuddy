const express = require('express');
const app = express();
const connectDB = require('./config/db');

const userRoutes=require('./routes/user_route');
const authRoute=require('./routes/auth_route');
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/api/user',userRoutes);
app.use('/api/auth',authRoute);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


