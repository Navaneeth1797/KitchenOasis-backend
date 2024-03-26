import AsyncError from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
// import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import SendToken from "../utils/sendToken.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";
import sendToken from "../utils/sendToken.js";
import ErrorHandler from "../utils/errorHandler.js";

// register user => /api/register
export let registerUser = AsyncError(async (req, res, next) => {
  let { name, email, password } = req.body;
  let user = await User.create({ name, email, password });

  SendToken(user, 201, res);
});

export let registerAdminUser = AsyncError(async (req, res, next) => {
  let { name, email, password } = req.body;
  let user = await User.create({ name, email, password, role: "admin" });

  SendToken(user, 201, res);
});

// login user => /api/login
export let loginUser = AsyncError(async (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorHandler("please provide a valid email and password", 404)
    );
  }
  // find user in the database
  let user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("invalid email or password", 404));
  }

  // check if password is correct
  let checkPasswordValid = await user.comparePassword(password);
  if (!checkPasswordValid) {
    return next(new ErrorHandler("invalid email or password", 404));
  }

  SendToken(user, 200, res);
});
// logout user => /api/logout
export let logout = AsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    message: "looged out sucessfully",
  });
});
// forgot password => /api/password/forgot
export let forgotPassword = AsyncError(async (req, res, next) => {
  // find user in the database
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("invalid email or password", 404));
  }

  // get reset password token
  let resetToken = await user.getResetPasswordToken();
  await user.save();
  // create resey url
  let resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  let message = getResetPasswordTemplate(user?.name, resetUrl);
  try {
    await sendEmail({
      email: user.email,
      subject: "Kitchen Oasis password recovery",
      message,
    });
    res.status(200).json({
      message: `email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorHandler(error?.message, 500));
  }
});

// reset password => /api/password/reset/:token
export let resetPassword = AsyncError(async (req, res, next) => {
  //hash the url token
  let resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  let user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "password reset token is invalid or has been expired",
        404
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler(" password does not match", 400));
  }
  // set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});
//get current user profile => api/profile
export let getUserProfile = AsyncError(async (req, res, next) => {
  let user = await User.findById(req?.user?._id);
  res.status(200).json({
    user,
  });
});
//create update password => api/password/update
export let updatePassword = AsyncError(async (req, res, next) => {
  let user = await User.findById(req?.user?._id).select("+password");
  // check the previous user password
  let isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }
  user.password = req.body.password;
  user.save();
  res.status(200).json({
    success: true,
  });
});
//update user profile => api/profile/update
export let updateProfile = AsyncError(async (req, res, next) => {
  let newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  let user = await User.findByIdAndUpdate(req?.user?._id, newUserData, {
    new: true,
  });
  res.status(200).json({
    user,
  });
});
//get all users-admin => api/admin/users
export let allUsers = AsyncError(async (req, res, next) => {
  let users = await User.find();
  res.status(200).json({
    users,
  });
});
//get users details-admin => api/admin/user/:id
export let usersById = AsyncError(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user not found with provided id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    user,
  });
});
//update users details-admin => api/admin/user/:id
export let updateUsersById = AsyncError(async (req, res, next) => {
  let newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  let user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });
  res.status(200).json({
    user,
  });
});
//delete users -admin => api/admin/user/:id
export let deleteUsersById = AsyncError(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user not found with id: ${req.params.id}`, 404)
    );
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
  });
});
