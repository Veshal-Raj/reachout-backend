import CustomError from "./custom-error.js";

class InternalServerError extends CustomError {
    statusCode = 500;

    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}

export default InternalServerError;
