const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Create
router.post("/", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

// Read all
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Read one
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

// Update
router.put("/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(product);
});

module.exports = router;
