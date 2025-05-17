/**
 * This file is used to log the requests made to the server
 */
import morgan from "morgan";

import logger from "../logger/winston-logger.js";

morgan.token("protocol", (req, _res) => req.protocol || "-"); // * http or https
morgan.token("user-agent", (req, _res) => req.headers["user-agent"]); // * user-agent
morgan.token("referer", (req, _res) => req.headers["referer"] || "-"); // * referer
morgan.token(
    "remote-addr",
    (req, _res) => req.headers["x-real-ip"] || req.connection?.remoteAddress
); // * remote address

let morganLogger = morgan("dev");

// * in production
if (process.env.NODE_ENV !== "dev") {
    morganLogger = morgan(
        "Date -> :date[iso], IP -> :remote-addr, Protocol -> :protocol, User Agent -> :user-agent,  Referer -> :referer, Method -> :method, URL -> :url, Status -> :status, Content Length -> :res[content-length], - Response Time -> :response-time ms",
        {
            stream: logger.stream,
            skip: (req, _res) => {
                return (
                    req.originalUrl.startsWith("/api/system/resource") ||
                    req.originalUrl.startsWith("/api/metrics") ||
                    req.originalUrl.startsWith("/static")
                );
            },
        }
    );
}

export default morganLogger;
