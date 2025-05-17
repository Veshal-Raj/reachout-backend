import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 5000;

import initalizeDatabase from "./src/configs/db.js";

import { app } from "./src/app.js";

async function startServer() {
    try {
        const connection = await initalizeDatabase();
        if (!connection) throw new Error("Database connection failed");
        console.log("Database connected successfully");
        
        app.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    } catch (error) {
        console.error("Error starting server 😢 -->", error);
        process.exit(1);
    }
}

startServer();