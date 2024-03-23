class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // create stack property
    ErrorHandler.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
