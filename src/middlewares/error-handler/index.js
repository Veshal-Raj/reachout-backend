/**
 * Error Handler Middleware
 */
import { ZodError } from "zod";
import { MongooseError } from "mongoose";

import CustomError from "../../utils/errors/custom-error.js";
import logger from "../../utils/logger/winston-logger.js";

/**
 * This middleware handles all errors
 * @param {Error} error - The error object
 * @param {Request} _req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} _next - The next function
 * @returns { ok : false, errors: [{ message: string, field?: string }] }
 */
function errorHandler(error, _req, res, _next) {
    logger.error("Error Handler Middleware", error);

    // If the error is a CustomError, return the error with the status code
    if (error instanceof CustomError) {
        return res.status(error.statusCode).send({ ok: false, errors: error.serializeErrors() });
    }

    // If the error is a ZodError, return the error with the status code 400
    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
            message: `${issue.path.join(", ")}: ${issue.message}`,
            path: issue.path.join(", "),
        }));

        return res.status(400).send({
            ok: false,
            errors: formattedErrors,
        });
    }

    // If the error is a MongooseError, return the error with the status code 400
    if (error instanceof MongooseError) {
        const formattedErrors = Object.values(error.errors).map((value) => ({
            message: value.message,
            path: value.path,
        }));

        return res.status(400).send({
            ok: false,
            errors: formattedErrors,
        });
    }

    // If none of the above conditions are met, return a generic error with the status code 500
    return res.status(500).send({
        ok: false,
        errors: [{ message: "Something went wrong" }],
    });
}

export default errorHandler;
