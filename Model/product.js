const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Product must have a price"],
    },

    images: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

