import jwt from "jsonwebtoken";
import User from "../models/user.js";
import AsyncError from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
//checks if user is authenticated or not
export let isAuthenticated = AsyncError(async (req, res, next) => {
  let { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler("authentication is denied,login first to access", 401)
    );
  }
  console.log(token);
  let decoded = jwt.verify(token, process.env.JWT_SCERET);
  req.user = await User.findById(decoded.id);
  next();
});

//authorize user roles
export let authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role ${req.user.role} is not allowed to access ,403`)
      );
    }
    next();
  };
};
