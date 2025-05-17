/**
 * This file contains the Mongoose ObjectId Validation.
 */

import { isValidObjectId } from "mongoose";
import BadRequestError from "./bad-request-error.js";

/**
 * Validates if the provided ID is a valid MongoDB ObjectId.
 * @param {ObjectId} id - The ID to validate.
 * @param {String} errorMessage - The error message to throw if the ID is invalid.
 * @throws {BadRequestError} - Throws an error if the ID is invalid.
 */
export function checkValidateObjectId(id, errorMessage) {
    if (!isValidObjectId(id)) {
        throw new BadRequestError(errorMessage);
    }
}
