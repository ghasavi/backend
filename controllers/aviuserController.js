import multer from "multer";
import User from "../models/aviuser.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import transporter from "../utils/mailer.js";
import OTP from "../models/otp.js";

dotenv.config();

// =================== Multer ===================
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// =================== User Creation ===================
export async function createUser(req, res) {
  try {
    // Only admins can create admin users
    if (req.body.role === "admin") {
      if (!req.user) return res.status(403).json({ message: "Login first to create admin accounts" });
      if (req.user.role !== "admin") return res.status(403).json({ message: "You are not authorized to create admin accounts" });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
    });

    await user.save();
    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
}

// =================== Email/Password Login ===================
export async function loginUser(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
  {
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    img: user.img,
    isBlock: user.isBlock, // <-- add this
  },
  process.env.JWT_KEY,
  { expiresIn: "7d" }
);


    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("LOGIN USER ERROR:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// =================== Google Login ===================
export async function loginWithGoogle(req, res) {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ message: "Access token is required" });

    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const gUser = response.data;

    let user = await User.findOne({ email: gUser.email });

    if (!user) {
      const isAdmin = gUser.email === "ghasavindya@gmail.com"; // hardcoded admin email
      user = new User({
        email: gUser.email,
        username: gUser.name,
        password: "googleUser",
        img: gUser.picture,
        role: isAdmin ? "admin" : "customer",
      });
      await user.save();
    } else {
      // Ensure admin email always has admin role
      if (gUser.email === "ghasavindya@gmail.com" && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
    }

    const token = jwt.sign(
  {
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    img: user.img,
    isBlock: user.isBlock, // <-- add this
  },
  process.env.JWT_KEY,
  { expiresIn: "7d" }
);


    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
}

// =================== OTP & Password Reset ===================

export async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await OTP.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await OTP.create({ email, otp });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire soon.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}


export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc) return res.status(400).json({ message: "No OTP request found" });
    if (otp != otpDoc.otp) return res.status(403).json({ message: "Invalid OTP" });

    await OTP.deleteMany({ email });
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password reset failed", error: err.message });
  }
}

// =================== User Info ===================
export async function getUser(req, res) {
  if (!req.user) return res.status(403).json({ message: "Unauthorized" });
  res.json({ ...req.user });
}

export async function getMe(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findOne({ email: req.user.email }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

// =================== Profile Update ===================
export async function updateMe(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { username, avatar } = req.body;
  if (!username) return res.status(400).json({ message: "Username is required" });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { username, img: avatar },
    { new: true }
  ).select("-password");

  res.json({ message: "Profile updated successfully", user: updatedUser });
}


// =================== Admin Helpers ===================
export function isAdmin(req) {
  return req.user?.role === "admin";
}

export async function getAllUsers(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin access only" });
  const users = await User.find().select("-password");
  res.json(users);
}

export async function toggleBlockUser(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin access only" });

  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlock = req.body.block;
  await user.save();
  res.json({ message: `User has been ${req.body.block ? "blocked" : "unblocked"}` });
}

// Get logged-in user's cart
export async function getCart(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(req.user._id).select("cart");
  res.json(user.cart || []);
}

// Update cart (replace whole cart)
export async function updateCart(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { cart } = req.body;
  if (!Array.isArray(cart)) return res.status(400).json({ message: "Invalid cart data" });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { cart },
    { new: true }
  ).select("cart");

  res.json(updatedUser.cart);
}

// Remove purchased items
export async function removePurchasedItems(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { productIds } = req.body; // array of purchased productIds
  if (!Array.isArray(productIds)) return res.status(400).json({ message: "Invalid product IDs" });

  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(item => !productIds.includes(item.productId));
  await user.save();
  res.json(user.cart);
}
