import mongoose from "mongoose";

export const connectDatabase = () => {
  let DB_URI =
    process.env.DB_URI || "mongodb://127.0.0.1:27017/kitchen-oasis-backend";

  mongoose.connect(DB_URI).then((con) => {
    console.log(
      `MongoDb database connected with the HOST ${con.connection.host}`
    );
  });
};
