// import { Router } from "express";
// import { google } from "googleapis";
// import * as authController from "../controllers/auth-controller.js"

// const authRouter = Router();

// // Initialize OAuth2 client
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// // Logout route
// // authRouter.post("/logout", authController.logoutUser);

// // check user valid
// // authRouter.get("/user-valid", authController.checkUserValid);

// // Generate Google OAuth URL
// // authRouter.get('/google', (req, res) => {
// //   const authUrl = oauth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: [
// //       'https://www.googleapis.com/auth/gmail.send',
// //       'https://www.googleapis.com/auth/userinfo.email'
// //     ], // Use the correct Gmail API scope
// //     prompt: 'consent',
// //     include_granted_scopes: true
// //   });

// //   res.json({ url: authUrl });
// // });

//  export default authRouter;