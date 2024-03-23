import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrderById,
  getOrderDetailsById,
  getSales,
  myOrders,
  newOrder,
  updateOrderDetailsById,
} from "../controllers/orderControllers.js";

let router = express.Router();

router.route("/orders/new").post(isAuthenticated, newOrder);
router.route("/order/:id").get(isAuthenticated, getOrderDetailsById);
router.route("/me/orders").get(isAuthenticated, myOrders);
router
  .route("/admin/get_sales")
  .get(isAuthenticated, authorizeRoles("admin"), getSales);
router;
router
  .route("/admin/orders")
  .get(isAuthenticated, authorizeRoles("admin"), allOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateOrderDetailsById);
router
  .route("/admin/orders/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteOrderById);

export default router;
