// routes/auth.js
import express from "express";
import * as authController from "../controllers/auth-controller.js"
const authRouter = express.Router();

// Generate Google OAuth URL
authRouter.get('/google', authController.generateGoogleAuthUrl);

// Handle OAuth callback
authRouter.get('/google/callback', authController.handleOAuthCallback);

// check user valid
authRouter.get("/user-valid", authController.checkUserValid);

authRouter.post("/logout", authController.logoutUser)

export default authRouter;