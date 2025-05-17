import z from "zod";
import bcrypt from 'bcrypt';

import logger from "../../utils/logger/winston-logger.js";
import { checkValidateObjectId } from "../../utils/errors/invalid-objectid-error.js";
import { emailSchema, createUserSchema } from "../../utils/zod-validators/zod-user-validator.js";
import User from "../../models/user-model.js";


/**
 * Checks if a mentor with the specified email already exists in the database.
 * Validates the email format before querying the database.
 * 
 * @param {string} email - The email address to check for existence.
 * @returns {Promise<boolean>} - A promise that resolves to true if a mentor
 * with the given email exists, or false otherwise.
 * @throws {Error} - Throws an error if the email validation fails or if there is
 * an issue querying the database.
 */
export async function checkUserAlreadyExist(email) {
    try {
        emailSchema.parse(email);

        const user = await User.findOne({ "email": email });
        
        return !!user;
    } catch (error) {
        logger.error("Error in mentor-service.checkMentorAlreadyExist", error);
        throw error;
    }
}


export async function getUserByEmail(email) {
    try {
        emailSchema.parse(email);
        
        const user = await User.findOne({ "email": email });

        return user;
    } catch (error) {
        logger.error("Error in user-service.getUserByEmail", error);
        throw error;
    }
}


export async function getUserById(id) {
    try {
        checkValidateObjectId(id, "Invalid user ID");
        
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    } catch (error) {
        logger.error("Error in user-service.getUserById", error);
        throw error;
    }
}


export async function registerUser(userData) {
    try {
        const validatedUserData = createUserSchema.parse(userData);

        if (validatedUserData.password !== validatedUserData.confirmPassword) {
            throw new Error("Passwords do not match");
        }

        //* checking whether user already exists
        const userExists = await checkUserAlreadyExist(validatedUserData.email);
        if (userExists) {
            throw new Error("User already exists");
        }

        if (!validatedUserData || !validatedUserData.email || !validatedUserData.name || !validatedUserData.password) {
            throw new Error("Missing required fields");
        }

        const hashedPassword = await bcrypt.hash(validatedUserData.password, 10);

        const user = new User({
            name: validatedUserData.name,
            email: validatedUserData.email,
            password: hashedPassword    
        });

        await user.save();

        return user;
    } catch (error) {
        logger.error("Error in user-service.registerUser", error);
        throw error;
    }
}


export const loginUser = async (email, password) => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.password) {
            throw new Error('User document is corrupted');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }        

        return user;
    } catch (error) {
        logger.error('Error in user-service.loginUser', error);
        throw error;
    }
}

