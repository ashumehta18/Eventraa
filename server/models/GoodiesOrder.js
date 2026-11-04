const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const goodiesOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cartItems: [cartItemSchema],
    amount: Number,
    currency: String,
    shipping: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      zip: String,
      country: String,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: { type: String, default: "paid" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("GoodiesOrder", goodiesOrderSchema);
