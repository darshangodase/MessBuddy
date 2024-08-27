const jwt=require('jsonwebtoken');
const errorhandler=require('./error');

const verifytoken =(req,res,next) => {
      const token =req.cookies.access_token;
      
      if(!token) 
        {
        return res.status(401).json({ success: false, message: 'No token provided.' });
        }
        
      jwt.verify(token,process.env.JWT_SECRET_KEY,(err,user)=>{
             if(err) 
                {
                   return res.status(403).json({ success: false, message: 'Invalid user.' });
                }
             req.user=user;
             next();
      });
}

module.exports = verifytoken;