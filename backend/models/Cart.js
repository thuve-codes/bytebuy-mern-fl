const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: String, // you can use session or dummy user ID
  products: [
    {
      productId: String,
      name: String,
      image: String,
      price: Number,
      quantity: Number, // selected quantity
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
