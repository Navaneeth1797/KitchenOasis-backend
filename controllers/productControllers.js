import Products from "../models/products.js";

import AsyncError from "../middlewares/catchAsyncErrors.js";

import Order from "../models/order.js";
import { deleteFile, uploadFile } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/filters.js";

//get products => /api/products
export let getProducts = AsyncError(async (req, res) => {
  let resPerPage = 6;
  let apiFilters = new APIFilters(Products, req.query).serach().filters();

  let products = await apiFilters.query;
  let filterCount = products.length;
  apiFilters.pagination(resPerPage);
  products = await apiFilters.query.clone();
  res.status(200).json({
    resPerPage,
    filterCount,
    products,
  });
});

//Create a new products => /api/admin/products
export let newProducts = AsyncError(async (req, res) => {
  req.body.user = req.user._id;
  console.log(req.body);
  let product = await Products.create(req.body);

  res.status(200).json({ product });
});

//get  products by id => /api/products/:id
export let getProductsById = AsyncError(async (req, res, next) => {
  try {
    let product = await Products.findById(req?.params?.id).populate(
      "reviews.user"
    );

    if (!product) {
      return next(new ErrorHandler("product not fount", 404));
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

//get  products -admin => /api/admin/products/
export let getAdminProducts = AsyncError(async (req, res, next) => {
  let product = await Products.find();

  res.status(200).json({ product });
});

//update  products details by id => /api/products/:id
export let updateProductsById = AsyncError(async (req, res) => {
  let product = await Products.findById(req?.params.id);

  if (!product) {
    return next(new ErrorHandler("product not fount", 404));
  }

  product = await Products.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

  res.status(200).json({ product });
});

//upload  products image  => /api/admin/products/:id/upload_images
export let uploadProductImages = AsyncError(async (req, res) => {
  let product = await Products.findById(req?.params.id);

  if (!product) {
    return next(new ErrorHandler("product not fount", 404));
  }
  let uploader = async (image) => uploadFile(image, "Oasis/products");
  let urls = await Promise.all((req?.body?.images).map(uploader));
  product?.images?.push(...urls);
  await product?.save();
  res.status(200).json({ product });
});

export let deleteProductImages = AsyncError(async (req, res, next) => {
  let product = await Products.findById(req?.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const { imgId } = req.body; // Destructure imgId from request body

  // Find the index of the image with the provided imgId in the uploadedImages state
  const imageIndex = product.images.findIndex((img) => img.public_id === imgId);

  if (imageIndex !== -1) {
    product.images.splice(imageIndex, 1);
    await product.save();
    res.status(200).json({ product });
  } else {
    return next(new ErrorHandler("Image not found", 404));
  }
});

//delete  products details by id => /api/products/:id
export let deleteProductsById = AsyncError(async (req, res, next) => {
  let product = await Products.findById(req?.params.id);

  if (!product) {
    return next(new ErrorHandler("product not fount", 404));
  }
  // delete=ing image associated with product
  for (let i = 0; i < product?.images?.length; i++) {
    await deleteFile(product?.images[i].public_id);
  }

  await Products.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: "product deleted" });
});
//create  products review  => /api/reviews
export let createProductsReview = AsyncError(async (req, res, next) => {
  let { rating, comment, productId } = req.body;
  let review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
  };
  let product = await Products.findById(productId);

  if (!product) {
    return next(new ErrorHandler("product not fount", 404));
  }
  let isReviewed = product?.reviews?.find(
    (rev) => rev.user.toString() === req?.user?._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user?.toString() === req?.user?._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOFReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, items) => items.rating + acc, 0) /
    product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({ success: true });
});
//get products review  => /api/reviews
export let getProductsReview = AsyncError(async (req, res, next) => {
  let product = await Products.findById(req.query.id).populate("reviews.user");
  if (!product) {
    return next(new ErrorHandler("product not fount", 404));
  }
  res.status(200).json({
    reviews: product.reviews,
  });
});
//delete  products review  => /api/admin/reviews
export let deleteProductsReview = AsyncError(async (req, res, next) => {
  let product = await Products.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("product not fount", 404));
  }
  let reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  );
  let numOFReviews = reviews.length;
  let ratings =
    numOFReviews === 0
      ? 0
      : product.reviews.reduce((acc, items) => items.rating + acc, 0) /
        numOFReviews;
  product = await Products.findByIdAndUpdate(
    req.query.productId,
    { reviews, numOFReviews, ratings },
    { new: true }
  );
  res.status(200).json({ success: true, product });
});

//can user review => /api/can_review
export let canUserReview = AsyncError(async (req, res) => {
  let orders = await Order.find({
    user: req.user._id,
    "orderItems.product": req.query.productId,
  });

  if (orders.length === 0) {
    return res.status(200).json({ canReview: false });
  }

  res.status(200).json({ canReview: true });
});
