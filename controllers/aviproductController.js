import Product from "../models/aviproduct.js";
import { isAdmin } from "./aviuserController.js";

/* =========================
   GET ALL PRODUCTS
========================= */
export async function getProducts(req, res) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get products",
      error: err,
    });
  }
}

/* =========================
   SAVE PRODUCT (FIXED)
========================= */
export async function saveProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to add a product",
    });
  }

  try {
    const {
      productId,
      name,
      altNames,
      description,
      images,
      labelledPrice,
      price,
      stock,
      size,
      medium,
      material,
      year,
    } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const product = new Product({
      productId,
      name,
      altNames,
      description,
      displayImage: images[0], // ⭐ FIRST IMAGE = DISPLAY IMAGE
      images,
      labelledPrice,
      price,
      stock,
      size,
      medium,
      material,
      year,
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add product",
      error: err.message,
    });
  }
}

/* =========================
   DELETE PRODUCT
========================= */
export async function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to delete a product",
    });
  }

  try {
    await Product.deleteOne({ productId: req.params.productId });
    res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product",
      error: err,
    });
  }
}

/* =========================
   UPDATE PRODUCT
========================= */
export async function updateProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to update a product",
    });
  }

  const productId = req.params.productId;
  const updatingData = req.body;

  try {
    await Product.updateOne(
      { productId },
      { $set: updatingData }
    );

    res.json({
      message: "Product updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}


/* =========================
   GET PRODUCT BY ID
========================= */
export async function getProductById(req, res) {
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!product.isAvailable && !isAdmin(req)) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
}

/* =========================
   SEARCH PRODUCTS
========================= */
export async function searchProducts(req, res) {
  const searchQuery = req.params.query;

  try {
    const products = await Product.find({
      isAvailable: true,
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { altNames: { $elemMatch: { $regex: searchQuery, $options: "i" } } },
      ],
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
}
