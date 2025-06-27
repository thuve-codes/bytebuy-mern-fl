const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  image: String,
  description: String,
  category: String,
  rating: Number,
});

module.exports = mongoose.model("Product", productSchema);
