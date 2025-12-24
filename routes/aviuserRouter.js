import express from "express";
import multer from "multer";
import { createUser, getUser, loginUser, loginWithGoogle, resetPassword, sendOTP ,getAllUsers ,toggleBlockUser} from "../controllers/aviuserController.js";
import { getMe , updateMe} from "../controllers/aviuserController.js";

const userRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.post("/",createUser)
userRouter.post("/login", loginUser)
userRouter.post("/login/google", loginWithGoogle)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/", getUser)
userRouter.get("/all", getAllUsers);
userRouter.get("/me", getMe);
// Only one username + avatar
userRouter.put("/me", upload.single("avatar"), updateMe);

// Add this at the end:
userRouter.put("/block/:userId", toggleBlockUser);

export default userRouter;