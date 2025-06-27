const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add or update item in cart
router.post("/add", async (req, res) => {
  try {
    const { userId, product } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [product] });
    } else {
      const index = cart.products.findIndex(
        (p) => p.productId === product.productId
      );

      if (index !== -1) {
        cart.products[index].quantity += product.quantity;
        if (product.stock && cart.products[index].quantity > product.stock) {
          cart.products[index].quantity = product.stock;
        }
      } else {
        cart.products.push(product);
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, products: [] });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Clear entire cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.json({ userId: req.params.userId, products: [] });
    }

    cart.products = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Delete single item from cart
router.delete("/:userId/:productId", async (req, res) => {
  try {
    console.log("Delete item called:", req.params);
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.productId !== req.params.productId
    );
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update quantity of a product with stock check
router.put("/:userId/:productId", async (req, res) => {
  try {
    console.log("Update qty called:", req.params, req.body);
    const { quantity } = req.body;

    if (quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(
      (p) => p.productId === req.params.productId
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    const product = await Product.findById(req.params.productId);
    const stock = product ? product.stock : null;

    if (stock !== null && quantity > stock) {
      item.quantity = stock;
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Update qty error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
