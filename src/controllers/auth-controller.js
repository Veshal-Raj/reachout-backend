import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken, validateEmail } from "../utils/helper.js";
import * as userService from "../services/db/user-service.js"



export async function registerUser(req, res, next) {
    try {
          // More detailed validation
          const { firstName, lastName, email, password } = req.body;
          
          if (!firstName?.trim() || !lastName?.trim()) {
            return res.status(400).json({ 
              success: false,
              message: "Name is required" 
            });
          }
      
          if (!validateEmail(email)) {
            return res.status(400).json({
              success: false,
              message: "Please provide a valid email"
            });
          }
      
          if (password.length < 8) {
            return res.status(400).json({
              success: false,
              message: "Password must be at least 8 characters"
            });
          }
      
          // Check for existing user
        const existingUser = await userService.getUserByEmail(email);
          if (existingUser) {
            return res.status(409).json({
              success: false,
              message: "Email already in use"
            });
          }
      
          // Create user
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await userService.createUser(firstName, lastName, email, hashedPassword);
      
          // Generate token
          const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
          );
      
          // Omit password in response
          const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          };
      
          res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
              user: userResponse,
              token
            }
          });
      
        } catch (error) {
          next(error); // Pass to error handler
        }
}

export async function loginUser(req, res, next) {
    try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check if user exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,      // must be false on localhost unless using HTTPS
      sameSite: "lax",    // or "none" if cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
}

export async function logoutUser(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      });

      return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
}

export async function checkUserValid(req, res, next) {
    try {
      const token = req.cookies.token;

      console.log("token --- ", token)
  
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userService.getUserById(decoded?.id, "-metaData -password");
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return res.status(200).json({ success: true, user})
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ success: false, message: 'Token is not valid' });
    }
}