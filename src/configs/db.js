import mongoose from "mongoose";

/**
 * Initializes a connection to the database using the provided DB_URL from environment variables.
 * @returns {Promise<boolean>} A promise that resolves to true if the connection is successful, otherwise false.
 * @throws {Error} Throws an error if the connection fails.
 */
const initalizeDatabase = async function() {
    const DB_URL = process.env.DB_URL;
    if (!DB_URL) {
        throw new Error("No database URL provided. Please set the DB_URL environment variable.");
    }
    try {
        const connection = await mongoose.connect(DB_URL);
        return Boolean(connection);
    } catch (error) {
        throw new Error(`An error occurred while connecting to the database: ${error.message}`);
    }
}

export default initalizeDatabase;