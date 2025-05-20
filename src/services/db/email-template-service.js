import Template from "../../models/template-model.js";


export async function createEmailTemplate(templateName, subject, body, attachments, createdBy) {
    try {
        const newTemplate = new Template({
        templateName,
        subject,
        body,
        attachments,
        createdBy,
    });

    await newTemplate.save();
    return newTemplate;
    } catch (error) {
        console.error("Error in emailTemplateService.createEmailTemplate ", error);
        throw error;
    }
}


export async function getEmailTemplateByUserId(createdBy) {
    try {
        const emailTemplates = await Template.find({ createdBy });
        return emailTemplates;
    } catch (error) {
        console.error("Error in emailTemplateService.getEmailTemplateByUserId ", error);
        throw error;
    }
}


export async function getEmailTemplateByIdAndUserId(templateId, userId) {
    try {
        const template = await Template.findOne({
            _id: templateId,
            createdBy: userId
        })

        if (!template) throw new Error("Template Not Found");
        return template;
    } catch (error) {
        console.error("Error in emailTemplateService.getEmailTemplateByIdAndUserId ", error);
        throw error;
    }
}

export async function getPaginatedTemplates(userId, searchQuery, page, limit, skip) {
    try {
        const filter = {
            createdBy: userId,
            templateName: { $regex: searchQuery, $options: "i" }
        }

        const [templates, total] = await Promise.all([
            Template.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            Template.countDocuments(filter)
        ])

        const totalPages = Math.ceil(total/limit);

        return {
            currentPage: page,
            totalPages,
            totalItems: total,
            items: templates
        }

    } catch (error) {
        console.error("Error in emailTemplateService.getPaginatedTemplates ", error);
        throw error;
    }
}