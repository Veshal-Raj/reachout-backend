import nodemailer from "nodemailer"
import { google } from "googleapis";
import dotenv from 'dotenv';
dotenv.config();

// These id's and secrets should come from .env file.
const CLIENT_ID = process.env.GMAIL_API_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_API_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_API_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GMAIL_API_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'yours authorized email address',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'SENDER NAME <yours authorized email address@gmail.com>',
      to: 'to email address here',
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

sendMail()
  .then((result) => console.log('Email sent...', result))
  .catch((error) => console.log(error.message));