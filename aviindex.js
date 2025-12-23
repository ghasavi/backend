import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Routes
import productRouter from "./routes/aviproductRouter.js";
import userRouter from "./routes/aviuserRouter.js";
import orderRouter from "./routes/aviorderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";

// Models
import User from "./models/aviuser.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT Middleware: attach full user to req.user
app.use(async (req, res, next) => {
  const tokenString = req.header("Authorization");
  if (!tokenString) return next();

  const token = tokenString.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user; // attach full user including _id
    next();
  } catch (err) {
    console.error("Invalid token", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection failed:", err));

// Routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
