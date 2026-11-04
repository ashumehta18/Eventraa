// // server/index.js
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const path = require("path");

// // Routes
// const authRoutes = require("./routes/authRoutes");
// const eventRoutes = require("./routes/eventRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");
// const venueRoutes = require("./routes/venueRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const goodiesRoutes = require("./routes/goodiesRoutes");

// const app = express();

// /* -------------------- Middleware -------------------- */
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );
// app.use(express.json());

// /* -------------------- MongoDB Connection -------------------- */
// async function connectDB() {
//   try {
//     if (!process.env.MONGO_URI) {
//       throw new Error("MONGO_URI is not defined");
//     }

//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB connected");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error.message);
//     process.exit(1);
//   }
// }

// connectDB();

// /* -------------------- API Routes -------------------- */
// app.use("/api/auth", authRoutes);
// app.use("/api/events", eventRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/venues", venueRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/goodies", goodiesRoutes);

// /* -------------------- Health Check -------------------- */
// app.get("/", (req, res) => {
//   res.send("✅ Eventra API running");
// });

// /* -------------------- Production Static Files (Optional) -------------------- */
// /*
// If you ever decide to serve frontend from backend:
// (make sure client/build exists)

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/build/index.html"));
//   });
// }
// */

// /* -------------------- Start Server -------------------- */
// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// server.on("error", (err) => {
//   console.error("Server error:", err);
//   process.exit(1);
// });



// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

/* -------------------- Routes -------------------- */
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const venueRoutes = require("./routes/venueRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const goodiesRoutes = require("./routes/goodiesRoutes");
const supportRoutes = require("./routes/supportRoutes"); // ✅ ADD THIS
const chatRoutes = require("./routes/chatRoutes");

const app = express();

/* -------------------- Middleware -------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json()); // ✅ REQUIRED for req.body

/* -------------------- MongoDB Connection -------------------- */
async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

connectDB();

/* -------------------- API Routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/goodies", goodiesRoutes);
app.use("/api/support", supportRoutes); // ✅ ADD THIS LINE
app.use("/api/chat", chatRoutes);

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("✅ Eventra API running");
});

/* -------------------- Production Static Files (Optional) -------------------- */
/*
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}
*/

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
