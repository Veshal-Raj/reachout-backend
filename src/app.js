import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();


import agenda from './services/job/agenda.js';
import "./services/job/emailCampaignJob.js";

import router from './routes/index.js';
import errorHandler from './middlewares/error-handler/index.js';
import authRouter from './routes/auth-router.js';

const app = express();

(async () => {
  await agenda.start();
})();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://reachout-frontend.vercel.app'
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(helmet());
app.use(cookieParser())
// Logging directly here
app.use(morgan('dev')); // or 'combined', 'tiny', etc.

// Routes and Error Handler
// app.use(router);
app.use('/api/v1', router); // This will prefix all routes in the router with '/api/v1'
app.use('/api/v1/auth', authRouter); // This will prefix all routes in the router with '/api/v1/auth'
  
app.use(errorHandler);

export { app };
