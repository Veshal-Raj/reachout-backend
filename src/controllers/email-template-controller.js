import * as emailTemplateService from "../services/db/email-template-service.js"


export async function createEmailTemplate(req, res, next) {
    const { templateName, subject, emailBody, attachments={} } = req.body;
  
    if (!templateName || !subject || !emailBody) {
      return res.status(400).json({ success: false, message: 'Invalid data or missing required fields' });
    }

    try {
    // await newTemplate.save();
    await emailTemplateService.createEmailTemplate(templateName, subject, emailBody, attachments, req.user?._id);

    res.status(200).json({
        success: true,
        message: 'List uploaded successfully',
        
      });
      
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({ success: false, message: 'Something went wrong during upload email templates' });
    }
}

export async function getEmailTemplates(req, res, next) {
    try {
            const userId = req.user._id;
    
            const emailTemplates = await emailTemplateService.getEmailTemplateByUserId(userId);
            res.status(200).json({ success: true, message: "User's Email Template", emailTemplates})
        } catch (error) {
            console.error("Error getting email template: ", error);
            res.status(500).json({ success: false, message: "Something went wrong during fetching email templates"})
        }
}