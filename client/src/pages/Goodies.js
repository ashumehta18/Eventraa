import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Simple goodies catalog for merch
const GOODS = [
  {
    id: "tee",
    name: "Eventra Classic Tee",
    price: 19.99,
    description: "Soft cotton, unisex fit with Eventra wordmark.",
    badge: "Best Seller",
    image:
      "https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_ChocolateBrown_01_1.jpg?v=1726511324&width=1946",
  },
  {
    id: "cap",
    name: "Eventra Dad Cap",
    price: 16.0,
    description: "Low-profile cap with embroidered logo.",
    badge: "New",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB0sfjyDinOiFnTi6x5ulttXLxEdxABJ5ogg&s",
  },
  {
    id: "bag",
    name: "Eventra Tote Bag",
    price: 14.5,
    description: "Durable canvas tote for events and daily use.",
    badge: "Eco",
    image:
      "https://m.media-amazon.com/images/I/61rorcTqRLL._AC_UY1100_.jpg",
  },
  {
    id: "hoodie",
    name: "Eventra Cozy Hoodie",
    price: 32.0,
    description: "Mid-weight hoodie with front pocket.",
    badge: "Limited",
    image:
      "https://m.media-amazon.com/images/I/71y-AWQfJ0L._AC_UY1100_.jpg",
  },
  {
    id: "stickers",
    name: "Eventra Sticker Pack",
    price: 4.99,
    description: "Die-cut stickers set of 6 designs.",
    badge: "Popular",
    image:
      "https://i.etsystatic.com/24636413/r/il/70244a/3164639890/il_570xN.3164639890_k4ct.jpg",
  },
];

function Goodies() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const addToCart = (item) => {
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) next[itemId] -= 1;
      else delete next[itemId];
      return next;
    });
  };

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const product = GOODS.find((g) => g.id === id);
      return product ? { ...product, qty } : null;
    }).filter(Boolean);
  }, [cart]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const loadRazorpay = () => {
    if (window.Razorpay) return Promise.resolve(true);
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!cartItems.length) return;
    if (!auth.token) {
      alert("Please login to checkout.");
      navigate("/login");
      return;
    }
    const required = ["name", "email", "phone", "address", "city", "zip", "country"];
    const missing = required.filter((k) => !shipping[k]?.trim());
    if (missing.length) {
      alert("Please fill all shipping fields before checkout.");
      return;
    }

    setError("");
    setStatus("Creating order...");
    setLoading(true);

    try {
      await loadRazorpay();

      const res = await fetch("/api/goodies/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map((item) => ({ id: item.id, name: item.name, price: item.price, qty: item.qty })),
          shipping,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to create order");
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Eventra Goodies",
        description: "Merch order",
        order_id: data.orderId,
        prefill: {
          name: shipping.name,
          email: shipping.email,
          contact: shipping.phone,
        },
        notes: {
          shipping_address: `${shipping.address}, ${shipping.city} ${shipping.zip}, ${shipping.country}`,
        },
        handler: (response) => {
          setStatus("Payment successful. Saving order...");
          fetch("/api/goodies/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({
              cartItems: cartItems.map((item) => ({ id: item.id, name: item.name, price: item.price, qty: item.qty })),
              shipping,
              amount: data.amount,
              currency: data.currency,
              razorpayOrderId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
            .then((r) => r.json())
            .then(() => {
              setStatus("Payment successful. Order saved!");
              setCart({});
              setShipping({
                name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                zip: "",
                country: "",
              });
            })
            .catch(() => {
              setError("Payment done but failed to save order");
            });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description || "Payment failed");
      });
      rzp.open();
      setStatus("Razorpay ready — complete payment in the popup.");
    } catch (err) {
      setError(err?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goodies-page">
      <header style={{ marginBottom: "1rem" }}>
        <p className="goodies-kicker">Merch Store</p>
        <h1 className="goodies-title">Eventra Goodies</h1>
        <p className="goodies-subtitle">
          Grab limited Eventra tees, caps, bags, stickers, and more. Add items to your bag and proceed to checkout. We collect your delivery details and will wire Razorpay checkout next.
        </p>
      </header>

      <div className="goodies-layout">
        {/* Products grid */}
        <div className="goodies-grid">
          {GOODS.map((item) => (
            <div key={item.id} className="goodies-card">
              <div className="goodies-img-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="goodies-img"
                />
                {item.badge && (
                  <span className="goodies-badge">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="goodies-card-body">
                <h3 className="goodies-name">{item.name}</h3>
                <p className="goodies-desc">{item.description}</p>
                <div className="goodies-price-row">
                  <span className="goodies-price">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="goodies-add-btn"
                  >
                    Add to bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart + shipping summary */}
        <div className="goodies-summary">
          <h3>Your bag</h3>
          {cartItems.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Add goodies to see them here.</p>
          ) : (
            <ul className="goodies-cart-list">
              {cartItems.map((item) => (
                <li key={item.id} className="goodies-cart-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                      ${item.price.toFixed(2)} × {item.qty}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="goodies-qty-btn"
                    >
                      −
                    </button>
                    <button
                      onClick={() => addToCart(item)}
                      className="goodies-qty-btn"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="goodies-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {error && <p style={{ color: "#dc2626", margin: "0.35rem 0" }}>{error}</p>}
          {status && <p style={{ color: "#16a34a", margin: "0.35rem 0" }}>{status}</p>}

          <div style={{ margin: "1rem 0 0.5rem", fontWeight: 600 }}>Delivery address</div>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            <input
              placeholder="Full name"
              value={shipping.name}
              onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
              className="goodies-input"
            />
            <input
              placeholder="Email"
              value={shipping.email}
              onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
              className="goodies-input"
            />
            <input
              placeholder="Phone"
              value={shipping.phone}
              onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
              className="goodies-input"
            />
            <input
              placeholder="Street address"
              value={shipping.address}
              onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              className="goodies-input"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              <input
                placeholder="City"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                className="goodies-input"
              />
              <input
                placeholder="ZIP / Postal"
                value={shipping.zip}
                onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                className="goodies-input"
              />
            </div>
            <input
              placeholder="Country"
              value={shipping.country}
              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
              className="goodies-input"
            />
          </div>

          <button
            className="goodies-checkout"
            disabled={!cartItems.length || loading}
            onClick={handleCheckout}
          >
            {loading ? "Processing..." : "Proceed to checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Goodies;
