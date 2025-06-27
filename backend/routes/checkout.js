const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET);
const Cart = require("../models/Cart");

console.log("✅ Checkout route hit");

router.post("/create-session", async (req, res) => {
  console.log("✅ Checkout route hit");
  const { userId } = req.body;

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  console.log("🛒 Cart found:", cart);

  const lineItems = cart.products.map((item) => {
    const amount = Math.round(item.price * 100);

    console.log(
      `🧾 Item: ${item.name}, price: ${item.price}, amount (in cents): ${amount}`
    );

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: amount, // 👈 this must be a valid integer
      },
      quantity: item.quantity,
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cart",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
