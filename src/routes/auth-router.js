import { Router } from "express";
import * as authController from "../controllers/auth-controller.js"

const authRouter = Router();

// Register route
authRouter.post("/register", authController.registerUser);

// Login route
authRouter.post("/login", authController.loginUser);

// Logout route
authRouter.post("/logout", authController.logoutUser);

// check user valid
authRouter.get("/user-valid", authController.checkUserValid);

 export default authRouter;