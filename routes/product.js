import express from "express";
import {
  canUserReview,
  createProductsReview,
  deleteProductImages,
  deleteProductsById,
  deleteProductsReview,
  getAdminProducts,
  getProducts,
  getProductsById,
  getProductsReview,
  updateProductsById,
  uploadProductImages,
} from "../controllers/productControllers.js";
import { newProducts } from "../controllers/productControllers.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

let router = express.Router();

router.route("/products").get(getProducts);
router
  .route("/admin/products")
  .post(isAuthenticated, authorizeRoles("admin"), newProducts);
router
  .route("/admin/products")
  .get(isAuthenticated, authorizeRoles("admin"), getAdminProducts);
router.route("/products/:id").get(getProductsById);
router
  .route("/admin/products/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateProductsById);
router
  .route("/admin/products/:id/upload_images")
  .put(isAuthenticated, authorizeRoles("admin"), uploadProductImages);
router
  .route("/admin/products/:id/delete_images")
  .put(isAuthenticated, authorizeRoles("admin"), deleteProductImages);
router
  .route("/admin/products/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProductsById);
router
  .route("/reviews")
  .get(isAuthenticated, getProductsReview)
  .put(isAuthenticated, createProductsReview);
router
  .route("/admin/reviews")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProductsReview);

router.route("/can_review").get(isAuthenticated, canUserReview);
export default router;
