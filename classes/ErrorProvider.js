// * Class that inherits JS Error class for custom error messages
module.exports = class ErrorProvider extends Error {
  constructor(statusCode, status, message) {
    super(message);

    this.statusCode = statusCode;
    this.status = status;

    Error.captureStackTrace(this, this.constructor);
  }
};
