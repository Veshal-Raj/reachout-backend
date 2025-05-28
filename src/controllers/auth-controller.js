import jwt from "jsonwebtoken";
import { google } from "googleapis";
import * as userService from "../services/db/user-service.js"
import dotenv from 'dotenv';
import { generateToken } from "../utils/helper.js";
import User from "../models/user-model.js";
dotenv.config();


// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function generateGoogleAuthUrl(req, res, next) {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email'
      ], // Use the correct Gmail API scope
      prompt: 'consent',
      include_granted_scopes: true
    });

  res.json({ url: authUrl });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Generate google auth url failed" });
  }
}

export async function handleOAuthCallback(req, res, next) {
  try {
      const { code, error } = req.query;
  
      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/error?message=${encodeURIComponent('OAuth authorization was denied or failed')}`);
      }
      
      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/error?message=${encodeURIComponent('No authorization code received')}`);
      }

      // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;
    
     console.log('Tokens received:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token
    });

    if (!refresh_token) {
      console.error('No refresh token received');
      return res.redirect(`${process.env.FRONTEND_URL}/error?message=${encodeURIComponent('No refresh token received. Please revoke app access in your Google Account settings and try again.')}`);
    }
    
    // Use access token to get user info
    oauth2Client.setCredentials({ access_token });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();
    
    console.log('Google user info:', googleUser.email);
    
    // Save/update user in database
    let user = await User.findOne({ email: googleUser.email });
    
    if (user) {
      // Update existing user's refresh token and last login
      user.refreshToken = refresh_token;
      user.lastLogin = new Date();
      if (!user.metaData) {
        user.metaData = {};
      }
      user.metaData.senderEmail = googleUser.email;
      
      await user.save();
      console.log('Updated existing user:', user.email);
    } else {
      user = await userService.createUser(
        googleUser.given_name || 'User',
        googleUser.family_name || 'Name',
        googleUser.email,
        'oauth-user',
        true,
        refresh_token,
        googleUser.email
      )
    }

    const token = generateToken(user);
      res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false: true,      // must be false on localhost unless using HTTPS
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",    // or "none" if cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    console.log('Created new user:', user.email);
    
    console.log(`User authenticated: ${googleUser.email}`);
    
    // Redirect to frontend with user ID
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    let errorMessage = 'Authentication failed';
    if (error.message.includes('invalid_grant')) {
      errorMessage = 'Invalid authorization code. Please try again.';
    } else if (error.message.includes('access_denied')) {
      errorMessage = 'Access denied. Please grant the necessary permissions.';
    }
    
    res.redirect(`${process.env.FRONTEND_URL}/error?message=${encodeURIComponent(errorMessage)}`);
  }
}

export async function logoutUser(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false: true,      // must be false on localhost unless using HTTPS
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",    // or "none" if cross-origin
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