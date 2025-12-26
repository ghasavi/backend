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
  updateMe
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
userRouter.put("/me", ...protectedRoute(upload.single("avatar"), updateMe));
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

// ---------------- ADMIN CHECK ROUTE ----------------
userRouter.get("/check-admin", authenticateJWT, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  res.json({ ok: true, user: req.user });
});

export default userRouter;
