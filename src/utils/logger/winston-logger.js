/**
 * This file is used to create a logger with Winston
 */

import * as winston from "winston";
import "winston-daily-rotate-file";

// * Create a logger with Winston
const { createLogger, transports, format } = winston;

// *  Create a logger with both console and file transports
const winstonLoggerConfig = {
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        // * Console transport
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
        // * Daily Rotate File transport
        new transports.DailyRotateFile({
            filename: "logs/%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
        }),
    ],
    exceptionHandlers: [
        // * Console transport
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
        // * Daily Rotate File transport
        new transports.DailyRotateFile({
            filename: "logs/exceptions-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
        }),
    ],
};

const logger = createLogger(winstonLoggerConfig);

// * streamer for morgan
logger.stream = {
    ...logger.stream,
    write: function (message) {
        logger.info(message.substring(0, message.lastIndexOf("\n")));
    },
};

export default logger;
