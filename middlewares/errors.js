import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || "internal server error",
  };

  //handle Invalid Mongoose id error
  if (err.name === "CastError") {
    let message = `product not found. Invalid: ${err?.path}`;
    error = new ErrorHandler(message, 404);
  }

  //handle validation error
  if (err.name === "ValidationError") {
    let message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorHandler(message, 400);
  }

  //handle  Mongoose dublicate key error
  if (err.code === "11000") {
    let message = `Dublicate ${Object.keys(err.keyValue)}entered.`;
    error = new ErrorHandler(message, 404);
  }
  //handle wrong jwt error
  if (err.name === "jsonWebTokenError") {
    let message = `json web token is invalid`;
    error = new ErrorHandler(message, 400);
  }
  //handle  expired jwt error
  if (err.name === "TokenExpiredError") {
    let message = `json web token is expired`;
    error = new ErrorHandler(message, 400);
  }

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(error.statusCode).json({
      message: error.message,
      error: err,
      stack: err?.stack,
    });
  }

};
