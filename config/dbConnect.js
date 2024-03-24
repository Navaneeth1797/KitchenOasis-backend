import mongoose from "mongoose";

export const connectDatabase = () => {
  let DB_URI =
    process.env.DB_URI ||
    "mongodb://rnavaneethk1797:navaneeth@ac-o42eblf-shard-00-00.dnthuz8.mongodb.net:27017,ac-o42eblf-shard-00-01.dnthuz8.mongodb.net:27017,ac-o42eblf-shard-00-02.dnthuz8.mongodb.net:27017/?ssl=true&replicaSet=atlas-c7wkf5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=oasis";

  mongoose.connect(DB_URI).then((con) => {
    console.log(
      `MongoDb database connected with the HOST ${con.connection.host}`
    );
  });
};
