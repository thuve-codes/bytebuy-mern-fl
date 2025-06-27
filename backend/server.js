const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://Thuverakan:ABC123@polymart-db.lmcioxb.mongodb.net/futurecode"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

const checkoutRoutes = require("./routes/checkout");
app.use("/api/checkout", checkoutRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
