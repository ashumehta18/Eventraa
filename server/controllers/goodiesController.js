const razorpay = require("../config/razorpayClient");
const GoodiesOrder = require("../models/GoodiesOrder");

// POST /api/goodies/checkout
// Creates a Razorpay order for the goodies cart
const createGoodiesOrder = async (req, res) => {
  try {
    const { cartItems, shipping } = req.body || {};

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Basic shipping validation
    const required = ["name", "email", "phone", "address", "city", "zip", "country"];
    const missing = required.filter((k) => !shipping?.[k] || !String(shipping[k]).trim());
    if (missing.length) {
      return res.status(400).json({ message: "Please fill all shipping fields" });
    }

    const amountPaise = cartItems.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 0);
      if (price > 0 && qty > 0) {
        return sum + Math.round(price * 100) * qty;
      }
      return sum;
    }, 0);

    if (!amountPaise || amountPaise <= 0) {
      return res.status(400).json({ message: "Invalid cart amount" });
    }

    const receipt = `goodies_${Date.now()}`;
    const notes = {
      shipping_name: shipping.name,
      shipping_email: shipping.email,
      shipping_phone: shipping.phone,
      shipping_address: `${shipping.address}, ${shipping.city} ${shipping.zip}, ${shipping.country}`,
    };

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "",
    });
  } catch (error) {
    console.error("Goodies checkout error:", error);
    let message = "Failed to create order";
    if (error?.message) message = error.message;
    return res.status(500).json({ message });
  }
};

// POST /api/goodies/confirm
// Persists a paid goodies order linked to the authenticated user
const confirmGoodiesOrder = async (req, res) => {
  try {
    const { cartItems, shipping, amount, currency, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Login required to save order" });
    }

    if (!Array.isArray(cartItems) || !cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ message: "Payment details missing" });
    }

    const order = await GoodiesOrder.create({
      user: req.user.id,
      cartItems,
      amount,
      currency,
      shipping,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: "paid",
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Goodies confirm error:", error);
    return res.status(500).json({ message: error?.message || "Failed to save order" });
  }
};

// GET /api/goodies/my
// Returns goodies orders for the logged-in user
const listMyGoodiesOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await GoodiesOrder.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Goodies list error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { createGoodiesOrder, confirmGoodiesOrder, listMyGoodiesOrders };
