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
app.use((err,req,res,next) => {
  const statusCode = res.statusCode||500;
  const message= res.message || "Internal Server Error";
  res.status(statusCode).json({
       success: true,
       statusCode,
       message,    
  });
});


app.listen(3000);



