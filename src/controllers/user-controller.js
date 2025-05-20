import * as userService from "../services/db/user-service.js"


export async function saveSenderCredentials(req, res, next) {
    try {
      const { email, password } = req.body;
      await userService.saveSenderCredentials(req.user._id, email, password);
      return res.status(200).json({
        success: true,
        message: "User Sender Credentials Saved Successfully"
      })
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ success: false, message: 'Token is not valid' });
    }
}