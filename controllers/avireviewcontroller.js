import Review from "../models/avireview.js";
import User from "../models/aviuser.js"; // Properly import the User model

/**
 * @desc    Create a new review (USER)
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1–5" });
    }

    // Prevent duplicate review per product per user
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      productId,
      orderId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
};

/**
 * @desc    Get logged-in user's reviews
 * @route   GET /api/reviews/my
 * @access  Private
 */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * @desc    Get all reviews (ADMIN)
 * @route   GET /api/reviews
 * @access  Admin
 */
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("user", "email username"); // fetch email + username of user
    res.json(reviews);
  } catch (error) {
    console.error("Admin get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * @desc    Hide / Unhide a review (ADMIN)
 * @route   PUT /api/reviews/:id/hide
 * @access  Admin
 */
export const toggleHideReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.hidden = !review.hidden;
    await review.save();

    res.json(review);
  } catch (error) {
    console.error("Toggle hide review error:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

/**
 * @desc    Delete a review (ADMIN)
 * @route   DELETE /api/reviews/:id
 * @access  Admin
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
