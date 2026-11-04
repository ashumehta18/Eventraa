// server/config/razorpayClient.js
// Safe wrapper for Razorpay client. If the 'razorpay' package is installed and
// environment variables are configured, it will return a Razorpay instance.
// Otherwise, it exposes stub methods that throw helpful errors when used.

let client = null;
try {
  // Try to require the official razorpay package
  const Razorpay = require('razorpay');
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || '';

  if (!key_id || !key_secret) {
    console.warn('Razorpay keys not provided in environment (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). Razorpay calls will fail until configured.');
  }

  client = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  // If require failed (package not installed), export a shim that throws helpful errors
  console.warn("Razorpay package not installed or failed to load. Install 'razorpay' to enable payment features.");
  client = {
    paymentLink: {
      create: async () => {
        throw new Error("Razorpay client not available. Install the 'razorpay' package and set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
      }
    },
    payments: {
      fetch: async () => {
        throw new Error("Razorpay client not available. Install the 'razorpay' package and set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
      }
    },
    orders: {
      create: async () => {
        throw new Error("Razorpay client not available. Install the 'razorpay' package and set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
      }
    }
  };
}

module.exports = client;
