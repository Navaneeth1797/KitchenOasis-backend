import mongoose from "mongoose";
import dbProducts from "./data.js";
import Products from "../models/products.js";

const handleProducts = async () => {
  try {
    await mongoose.connect(
      process.env.DB_URI || "mongodb://127.0.0.1:27017/kitchen-oasis-backend",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    await Products.deleteMany();
    console.log("Products are deleted");
    await Products.insertMany(dbProducts);
    console.log("Products are inserted");
    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

handleProducts();
