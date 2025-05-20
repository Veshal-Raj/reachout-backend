import fs from 'fs'
import { exit } from "process"
import nodemailer from "nodemailer"
import xlsx from "xlsx"

export async function startAutomation(list, template) {
    try {
        const { recipients } = list;
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const sendPromises = recipients.map(async user => {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.receiverEmail, // Assuming contact has email field
                subject: template.subject,
                html: template.body,
                attachments: template.attachments ? [{
                    filename: template.attachments.name,
                    path: template.attachments.url
                }] : []
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${user.receiverEmail}: ${info.messageId}`);
                return true;
            } catch (error) {
                console.error(`Error sending to ${user.receiverEmail}:`, error);
                return false;
            }
        });

        const results = await Promise.all(sendPromises);
        const successfulSends = results.filter(Boolean).length;

        console.log(`Campaign completed. Sent ${successfulSends}/${recipients.length} emails successfully.`);
        
        return successfulSends > 0;
    } catch (error) {
        console.error("Error in start automation: ", error);    
        return false;
    }
  }