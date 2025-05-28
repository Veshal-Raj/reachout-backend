// controllers/campaign-controller.js
import moment from "moment";
import { startAutomation } from "../services/email/automation.js";
import * as listBuilderService from "../services/db/list-builder-service.js"
import * as emailTemplateService from "../services/db/email-template-service.js"
import agenda from "../services/job/agenda.js";

export async function sendCampaign(req, res, next) {
    try {
        const userId = req.user._id;
        const { listId, templateId, scheduledAt } = req.body;

        // Validate required fields
        if (!listId || !templateId) {
            return res.status(400).json({ 
                success: false, 
                message: 'List ID and Template ID are required' 
            });
        }

        // Get list and template data
        const list = await listBuilderService.getListByIdAndUserId(listId, userId);
        if (!list) {
            return res.status(404).json({ 
                success: false, 
                message: 'List not found or access denied' 
            });
        }

        const template = await emailTemplateService.getEmailTemplateByIdAndUserId(templateId, userId);
        if (!template) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email template not found or access denied' 
            });
        }

        // Validate that list has recipients
        if (!list.recipients || list.recipients.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'List has no recipients' 
            });
        }

        // Check if user has valid OAuth credentials
        if (!req.user.refreshToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please connect your Gmail account first' 
            });
        }

        if (scheduledAt) {
            // Schedule the campaign
            const jobTime = moment(scheduledAt).toDate(); 
            
            // Validate scheduled time is in the future
            if (jobTime <= new Date()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Scheduled time must be in the future' 
                });
            }

            console.log("Scheduling campaign for:", jobTime);
            
            const job = await agenda.schedule(jobTime, "send email campaign", {
                userId,
                list,
                template
            });
            
            console.log("Campaign scheduled successfully:", job.attrs._id);

            return res.status(200).json({ 
                success: true, 
                message: "Campaign scheduled successfully",
                scheduledAt: jobTime,
                jobId: job.attrs._id,
                recipientCount: list.recipients.length
            });

        } else {
            // Send immediately
            console.log(`Starting immediate campaign for ${list.recipients.length} recipients`);
            
            const success = await startAutomation(userId, list, template);
    
            if (success) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Campaign started successfully',
                    recipientCount: list.recipients.length
                });
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Failed to start campaign. Please check your Gmail connection and try again.' 
                });
            }
        }

    } catch (error) {
        console.error('Error in sending campaign:', error);
        
        // Handle specific error types
        let errorMessage = 'Something went wrong during campaign execution';
        
        if (error.message?.includes('OAuth') || error.message?.includes('credentials')) {
            errorMessage = 'Gmail authentication error. Please reconnect your Gmail account.';
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            errorMessage = 'Gmail API quota exceeded. Please try again later.';
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage 
        });
    }
}

// New endpoint to get campaign status/preview
export async function previewCampaign(req, res) {
    try {
        const userId = req.user._id;
        const { listId, templateId } = req.body;

        const list = await listBuilderService.getListByIdAndUserId(listId, userId);
        const template = await emailTemplateService.getEmailTemplateByIdAndUserId(templateId, userId);

        if (!list || !template) {
            return res.status(404).json({ 
                success: false, 
                message: 'List or template not found' 
            });
        }

        // Generate preview with sample data
        const sampleRecipient = list.recipients[0] || { 
            receiverEmail: 'sample@example.com', 
            name: 'Sample User' 
        };

        let previewSubject = template.subject;
        let previewBody = template.body;

        // Replace placeholders with sample data
        previewSubject = previewSubject.replace(/\{\{name\}\}/g, sampleRecipient.name || 'Sample User');
        previewSubject = previewSubject.replace(/\{\{email\}\}/g, sampleRecipient.receiverEmail);
        
        previewBody = previewBody.replace(/\{\{name\}\}/g, sampleRecipient.name || 'Sample User');
        previewBody = previewBody.replace(/\{\{email\}\}/g, sampleRecipient.receiverEmail);

        res.json({
            success: true,
            preview: {
                subject: previewSubject,
                body: previewBody,
                attachments: template.attachments || [],
                recipientCount: list.recipients.length,
                listName: list.name,
                templateName: template.name
            }
        });

    } catch (error) {
        console.error('Error generating campaign preview:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate campaign preview' 
        });
    }
}

// Endpoint to test single email send
export async function testEmail(req, res) {
    try {
        const userId = req.user._id;
        const { templateId, testEmail } = req.body;

        if (!testEmail || !templateId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Template ID and test email are required' 
            });
        }

        const template = await emailTemplateService.getEmailTemplateByIdAndUserId(templateId, userId);
        if (!template) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email template not found' 
            });
        }

        // Create a test list with single recipient
        const testList = {
            recipients: [{
                receiverEmail: testEmail,
                name: 'Test User'
            }]
        };

        const success = await startAutomation(userId, testList, template);

        if (success) {
            res.json({ 
                success: true, 
                message: `Test email sent successfully to ${testEmail}` 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Failed to send test email' 
            });
        }

    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email' 
        });
    }
}