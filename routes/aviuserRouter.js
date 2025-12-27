import express from "express";
import multer from "multer";
import {
  createUser,
  getUser,
  loginUser,
  loginWithGoogle,
  resetPassword,
  sendOTP,
  getAllUsers,
  toggleBlockUser,
  getMe,
  updateMe,
  getCart,
  updateCart,
  removePurchasedItems
} from "../controllers/aviuserController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- PUBLIC ROUTES ----------------
userRouter.post("/", authenticateJWT, async (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access only" });
  next();
}, createUser);

userRouter.post("/login", loginUser);
userRouter.post("/login/google", loginWithGoogle);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/reset-password", resetPassword);

// ---------------- PROTECTED ROUTES ----------------
const protectedRoute = (handler) => [
  authenticateJWT,
  (req, res, next) => {
    if (req.user.isBlock) return res.status(403).json({ message: "Your account is blocked" });
    next();
  },
  handler
];

userRouter.get("/me", ...protectedRoute(getMe));

userRouter.put("/me", authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.isBlock) return res.status(403).json({ message: "Your account is blocked" });

    await updateMe(req, res);
  } catch (err) {
    console.error("UPDATE ME ERROR:", err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});


userRouter.get("/", ...protectedRoute(getUser));

// ---------------- ADMIN ROUTES ----------------
const adminRoute = (handler) => [
  authenticateJWT,
  (req, res, next) => {
    if (req.user.isBlock) return res.status(403).json({ message: "Your account is blocked" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access only" });
    next();
  },
  handler
];

userRouter.get("/all", ...adminRoute(getAllUsers));
userRouter.put("/block/:userId", ...adminRoute(toggleBlockUser));
userRouter.get("/cart", authenticateJWT, getCart);
userRouter.put("/cart", authenticateJWT, updateCart);
userRouter.put("/cart/remove-purchased", authenticateJWT, removePurchasedItems);

// ---------------- ADMIN CHECK ROUTE ----------------
userRouter.get("/check-admin", authenticateJWT, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  res.json({ ok: true, user: req.user });
});



export default userRouter;
