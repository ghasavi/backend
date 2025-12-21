import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    altNames: [{ type: String }],

    description: {
      type: String,
      required: true,
    },

    displayImage: {
      type: String,
      required: true,
    },

    images: [{ type: String }],

    labelledPrice: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    size: {
      type: String,
      default: "",
    },

    medium: {
      type: String,
      default: "",
    },

    material: {
      type: String,
      default: "",
    },

    year: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
