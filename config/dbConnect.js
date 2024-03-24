import mongoose from "mongoose";

export const connectDatabase = () => {
  let DB_URI =
    process.env.DB_URI ||
    "mongodb://rnavaneethk1797:navaneeth@ac-k4n25yo-shard-00-00.c5x1ep2.mongodb.net:27017,ac-k4n25yo-shard-00-01.c5x1ep2.mongodb.net:27017,ac-k4n25yo-shard-00-02.c5x1ep2.mongodb.net:27017/?ssl=true&replicaSet=atlas-dbl1tg-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

  mongoose.connect(DB_URI).then((con) => {
    console.log(
      `MongoDb database connected with the HOST ${con.connection.host}`
    );
  });
};
