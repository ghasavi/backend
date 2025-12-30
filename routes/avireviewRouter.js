import express from "express";
import {
  createReview,
  getMyReviews,
  getAllReviews,
  toggleHideReview,
  deleteReview,
} from "../controllers/avireviewcontroller.js";

import { authenticateJWT, admin } from "../middlewares/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", authenticateJWT, createReview);
reviewRouter.get("/my", authenticateJWT, getMyReviews);
reviewRouter.get("/", authenticateJWT, admin, getAllReviews);
reviewRouter.put("/:id/hide", authenticateJWT, admin, toggleHideReview);
reviewRouter.delete("/:id", authenticateJWT, admin, deleteReview);

export default reviewRouter;
