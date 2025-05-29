import * as subscriberService from "../services/db/subscriber-service.js"

export async function createSubscriber(req, res, next) {
    try {
      const { email } = req.body;
      await subscriberService.createSubscriber(email);
      return res.status(200).json({
        success: true,
        message: "Subscribed Successfully"
      })
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ success: false, message: 'Token is not valid' });
    }
}