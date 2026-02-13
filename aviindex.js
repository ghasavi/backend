import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";

// Routes
import productRouter from "./routes/aviproductRouter.js";
import userRouter from "./routes/aviuserRouter.js";
import orderRouter from "./routes/aviorderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import reviewRouter from "./routes/avireviewRouter.js";

// Models
import User from "./models/aviuser.js";

const app = express();

// ----------------------
// Middleware
// ----------------------

// CORS setup (must be BEFORE routes)
app.use(cors({
  origin: [
    "http://localhost:5173", // local frontend
    "https://56dcb3654f14.ngrok-free.app", // ngrok frontend URL
    "https://frontend-lyart-six-71.vercel.app",
    "https://frontend-six-chi-15.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

// Body parser
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

// ----------------------
// MongoDB Connection
// ----------------------
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection failed:", err));

// ----------------------
// Routes
// ----------------------
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/reviews", reviewRouter);

// ----------------------
// Error handling fallback
// ----------------------
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
