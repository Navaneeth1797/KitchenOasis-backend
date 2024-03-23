import mongoose from "mongoose";

let productsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter product name"],
      maxLength: [200, "product name cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "please enter product price"],
      maxLength: [8, "product price cannot exceed 8 digits"],
    },
    description: {
      type: String,
      required: [true, "please enter product description"],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "please enter product Category"],
      enum: {
        values: [
          "Kitchen Appliances",
          "Cookware",
          "Cutlery",
          "Dinnerware",
          "Kitchen Utensils",
          "Bakeware",
          "Kitchen Gadgets",
          "Serveware",
          "Storage Containers",
          "Linens",
        ],
        message: " please select correct category",
      },
    },

    stock: {
      type: Number,
      required: [true, "please enter product stock"],
    },
    numOFReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("product", productsSchema);
