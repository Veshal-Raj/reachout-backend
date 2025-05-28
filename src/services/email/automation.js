// services/email/automation.js
import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { getUserById } from "../db/user-service.js"
import { changeUserSenderCredentialsStatus } from "../db/user-service.js"
import https from 'https'
import http from 'http'

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Helper function to create email message with attachments
async function createEmailMessage(to, from, subject, htmlBody, attachments = []) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  let message = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    htmlBody,
    ''
  ];

  // Add attachments if they exist
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      try {
        let fileContent;
        let mimeType = 'application/octet-stream';
        
        // Handle different attachment sources
        if (attachment.path && fs.existsSync(attachment.path)) {
          // Local file path
          fileContent = fs.readFileSync(attachment.path);
          mimeType = getMimeTypeFromUrl(attachment.path);
        } else if (attachment.url) {
          // Download file from URL
          console.log(`Downloading attachment from: ${attachment.url}`);
          fileContent = await downloadFileFromUrl(attachment.url);
          mimeType = getMimeTypeFromUrl(attachment.url);
        } else if (attachment.content) {
          // Direct content
          fileContent = Buffer.isBuffer(attachment.content) ? attachment.content : Buffer.from(attachment.content);
        } else {
          console.warn('Invalid attachment format:', attachment);
          continue;
        }

        const base64Content = fileContent.toString('base64');
        const filename = attachment.filename || attachment.name || 'attachment';
        
        message.push(
          `--${boundary}`,
          `Content-Type: ${mimeType}; name="${filename}"`,
          `Content-Disposition: attachment; filename="${filename}"`,
          'Content-Transfer-Encoding: base64',
          '',
          base64Content,
          ''
        );
      } catch (error) {
        console.error('Error processing attachment:', error);
      }
    }
  }

  message.push(`--${boundary}--`);
  
  const rawMessage = message.join('\r\n');
  return Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper function to download file from URL
async function downloadFileFromUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      response.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to get MIME type from URL
function getMimeTypeFromUrl(url) {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.zip': 'application/zip'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Function to send email using Gmail API
async function sendEmailViaGmailAPI(userCredentials, to, subject, htmlBody, attachments = []) {
  try {
    // Set up OAuth2 credentials
    oauth2Client.setCredentials({
      refresh_token: userCredentials.refreshToken
    });

    // Get fresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Initialize Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create the email message with attachments
    const rawMessage = await createEmailMessage(
      to, 
      userCredentials.email, 
      subject, 
      htmlBody, 
      attachments
    );

    // Send email using Gmail API
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage
      }
    });

    return {
      success: true,
      messageId: result.data.id
    };

  } catch (error) {
    console.error('Gmail API error:', error);
    throw error;
  }
}

// Process template data and replace placeholders
function processTemplateData(template, recipientData = {}) {
  let processedSubject = template.subject;
  let processedBody = template.body;

  // Replace placeholders in subject
  Object.keys(recipientData).forEach(key => {
    const placeholder = `{{${key}}}`;
    processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), recipientData[key] || '');
  });

  // Replace placeholders in body
  Object.keys(recipientData).forEach(key => {
    const placeholder = `{{${key}}}`;
    processedBody = processedBody.replace(new RegExp(placeholder, 'g'), recipientData[key] || '');
  });

  return {
    subject: processedSubject,
    body: processedBody,
    attachments: template.attachments || []
  };
}

export async function startAutomation(userId, list, template) {
  try {
    const { recipients } = list;

    // Get user credentials (now expecting OAuth tokens instead of email/password)
    const user = await getUserById(userId);
    if (!user || !user.refreshToken) {
      console.error('User not found or missing OAuth credentials');
      return false;
    }

    const userCredentials = {
      email: user.email,
      refreshToken: user.refreshToken
    };

    console.log(`Starting email campaign for ${recipients.length} recipients`);

    const sendPromises = recipients.map(async (recipient, index) => {
      try {
        // Add delay between emails to avoid rate limiting
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        // Process template data with recipient-specific information
        const processedTemplate = processTemplateData(template, {
          name: recipient.name || recipient.receiverEmail,
          email: recipient.receiverEmail,
          ...recipient // Include any other recipient data
        });

        // Prepare attachments based on your template schema
        let attachments = [];
        if (processedTemplate.attachments && processedTemplate.attachments.url) {
          attachments = [{
            filename: processedTemplate.attachments.name || 'attachment',
            url: processedTemplate.attachments.url,
            size: processedTemplate.attachments.size
          }];
        }

        // Send email via Gmail API
        const result = await sendEmailViaGmailAPI(
          userCredentials,
          recipient.receiverEmail,
          processedTemplate.subject,
          processedTemplate.body,
          attachments
        );

        console.log(`Email sent to ${recipient.receiverEmail}: ${result.messageId}`);
        return true;

      } catch (error) {
        console.error(`Error sending to ${recipient.receiverEmail}:`, error);
        
        // Handle specific OAuth errors
        if (error.code === 401 || error.message?.includes('invalid_grant')) {
          console.error('OAuth token expired or invalid');
          await changeUserSenderCredentialsStatus(userId, false);
        }
        
        return false;
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(sendPromises);
    const successfulSends = results.filter(Boolean).length;
    const failedSends = results.length - successfulSends;

    console.log(`Campaign completed. Sent ${successfulSends}/${recipients.length} emails successfully.`);
    
    if (failedSends > 0) {
      console.log(`${failedSends} emails failed to send.`);
    }

    return successfulSends > 0;

  } catch (error) {
    console.error("Error in start automation: ", error);
    await changeUserSenderCredentialsStatus(userId, false);
    return false;
  }
}

// Alternative function for immediate sending (non-scheduled)
export async function sendSingleEmail(userId, recipientEmail, template, recipientData = {}) {
  try {
    const user = await getUserById(userId);
    if (!user || !user.refreshToken) {
      throw new Error('User not found or missing OAuth credentials');
    }

    const userCredentials = {
      email: user.email,
      refreshToken: user.refreshToken
    };

    // Process template
    const processedTemplate = processTemplateData(template, {
      name: recipientData.name || recipientEmail,
      email: recipientEmail,
      ...recipientData
    });

    // Prepare attachments
    let attachments = [];
    if (processedTemplate.attachments && processedTemplate.attachments.url) {
      attachments = [{
        filename: processedTemplate.attachments.name || 'attachment',
        url: processedTemplate.attachments.url,
        size: processedTemplate.attachments.size
      }];
    }

    // Send email
    const result = await sendEmailViaGmailAPI(
      userCredentials,
      recipientEmail,
      processedTemplate.subject,
      processedTemplate.body,
      attachments
    );

    return result;

  } catch (error) {
    console.error('Error sending single email:', error);
    throw error;
  }
}