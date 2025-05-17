import jwt from "jsonwebtoken";
import User from "../../models/user-model.js";

 export const authMiddleware = async (req, res, next) => {
    try {
      // Get token from header
      const token = req.cookies?.token;
      console.log('token --- ', token);
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
  
      req.user = user; // Attach user to request
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ success: false, message: 'Token is not valid' });
    }
  };
