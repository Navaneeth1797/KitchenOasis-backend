import mongoose from "mongoose";
import dbProducts from "./data.js";
import Products from "../models/products.js";

const handleProducts = async () => {
  try {
    await mongoose.connect(
      process.env.DB_URI ||
        "mongodb+srv://rnavaneethk1797:navaneeth@cluster0.c5x1ep2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
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
