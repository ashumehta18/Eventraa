const express = require("express");
const router = express.Router();
const { createGoodiesOrder, confirmGoodiesOrder, listMyGoodiesOrders } = require("../controllers/goodiesController");
const protect = require("../middleware/authMiddleware");

// Public checkout endpoint for goodies (creates Razorpay order)
router.post("/checkout", createGoodiesOrder);

// Save paid goodies order for logged-in user
router.post("/confirm", protect, confirmGoodiesOrder);

// List logged-in user's goodies orders
router.get("/my", protect, listMyGoodiesOrders);

module.exports = router;
