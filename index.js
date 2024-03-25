
import express from "express";

import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
import dotenv from "dotenv";

dotenv.config();

let app = express();



// handle uncaught exceptions

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err}`);
    console.log("server rejected");
    server.close(() => {
        process.exit(1);
    })
})

//connecting to database
connectDatabase()


// Middleware to parse incoming JSON requests
app.use(express.json({limit: '10mb', verify:(req, res, buf)=>{
    req.rawBody = buf.toString()
}}));
app.use(cookieParser());

//import all routes 
import productRoutes from "./routes/product.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";

app.use("/api", productRoutes);
app.use("/api", authRoutes);
//app.use("/api", orderRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

app.use(errorMiddleware);

let server = app.listen(process.env.PORT, () => {
  console.log(
    `server started on port:${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Unhandled promise rejection

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err}`);
    console.log("server rejected");
    server.close(() => {
        process.exit(1);
    })
})