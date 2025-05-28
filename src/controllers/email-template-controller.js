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
      res.status(200).json({ success: true, message: "User's Email Templates", emailTemplates});
  } catch (error) {
      console.error("Error getting email template: ", error);
      res.status(500).json({ success: false, message: "Something went wrong during fetching email templates"})
  }
}

export async function getEmailTemplateById(req, res, next) {
  try {
      const userId = req.user._id;
      const { templateId } = req.params;
      const emailTemplate = await emailTemplateService.getEmailTemplateByIdAndUserId(templateId, userId);
      res.status(200).json({ success: true, message: "Email Template fetched successfully ", emailTemplate});
  } catch (error) {
      console.error("Error getting email template by Id: ", error);
      res.status(500).json({ success: false, message: "Something went wrong during fetching email template by Id"})
  }
}

export async function getPaginatedTemplates(req, res, next) {
  try {
      const userId = req.user._id;
      const searchQuery = req.query.searchQuery || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const skip = (page - 1) * limit;

      const templatesData = await emailTemplateService.getPaginatedTemplates(userId, searchQuery, page, limit, skip);

      res.status(200).json({ success: true, message: "Template Data fetched successfully ", templatesData});
  } catch (error) {
      console.error("Error getting email template in pagination: ", error);
      res.status(500).json({ success: false, message: "Something went wrong during fetching email template in pagination"})
  }
}

export async function deleteTemplateById(req, res, next) {
  try {
      const { templateId } = req.params;
      await emailTemplateService.deleteTemplateById(templateId);
      res.status(200).json({ success: true, message: "Template deleted successfully "});
  } catch (error) {
    console.error("Error getting deleting email template: ", error);
    res.status(500).json({ success: false, message: "Something went wrong during deleting email template"})
  }
}