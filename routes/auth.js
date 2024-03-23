import express from "express";
import {
  allUsers,
  deleteUsersById,
  forgotPassword,
  getUserProfile,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUsersById,
  usersById,
} from "../controllers/authControllers.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

let router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/password/update").put(isAuthenticated, updatePassword);
router.route("/profile/update").put(isAuthenticated, updateProfile);
router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRoles("admin"), allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizeRoles("admin"), usersById)
  .put(isAuthenticated, authorizeRoles("admin"), updateUsersById)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUsersById);

export default router;
