import moment from "moment";
import { startAutomation } from "../services/email/automation.js";
import * as listBuilderService from "../services/db/list-builder-service.js"
import * as emailTemplateService from "../services/db/email-template-service.js"
import agenda from "../services/job/agenda.js";


export async function sendCampaign(req, res, next) {
    try {
        const userId = req.user._id;
        const { listId, templateId, scheduledAt } = req.body;

        const list = await listBuilderService.getListByIdAndUserId(listId, userId);

        const template = await emailTemplateService.getEmailTemplateByIdAndUserId(templateId, userId)

        if (scheduledAt) {
            const jobTime = moment(scheduledAt).toDate(); 
            console.log("job time ---  ", jobTime)
            const test = await agenda.schedule(jobTime, "send email campaign", {
                userId,
                list,
                template
            });
            console.log("test ---  ", test)

            return res.status(200).json({ success: true, message: "Campaign Scheduled Successfully"});
        } else {

            const success = await startAutomation(userId, list, template);
    
            if (success) {
                return res.status(200).json({ success: true, message: 'Campaign started successfully' });
            } else {
                return res.status(400).json({ success: false, message: 'Failed to start campaign' });
            }
        }


    } catch (error) {
        console.error('Error in sending campaign:', error);
        res.status(500).json({ success: false, message: 'Something went wrong during send campaign' });
    }
}