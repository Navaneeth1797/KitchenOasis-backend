import mongoose from "mongoose";
import dbProducts from "./data.js";
import Products from "../models/products.js";

const handleProducts = async () => {
  try {
    await mongoose.connect(
      process.env.DB_URI ||
        "mongodb://rnavaneethk1797:navaneeth@ac-o42eblf-shard-00-00.dnthuz8.mongodb.net:27017,ac-o42eblf-shard-00-01.dnthuz8.mongodb.net:27017,ac-o42eblf-shard-00-02.dnthuz8.mongodb.net:27017/?ssl=true&replicaSet=atlas-c7wkf5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=oasis",
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
