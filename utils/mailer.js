import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // load .env variables immediately

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

console.log("EMAIL:", process.env.EMAIL);
console.log("PASS:", process.env.EMAIL_APP_PASSWORD ? "LOADED" : "MISSING");

transporter.verify((err) => {
  if (err) {
    console.log("❌ Email auth failed:", err.message);
  } else {
    console.log("✅ Email server ready");
  }
});

export default transporter;
