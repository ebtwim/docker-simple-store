const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// =====================
// CONFIG
// =====================
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Email transporter (OTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "yourgmail@gmail.com",
    pass: process.env.EMAIL_PASS || "your_app_password",
  },
});

// =====================
// AUTH MIDDLEWARE
// =====================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

// =====================
// TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("Backend with PostgreSQL running ✅");
});

// =====================
// REGISTER + OTP (DB)
// =====================
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ msg: "Missing fields" });

  try {
    // Check if email exists
    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Insert user
    await pool.query(
      `INSERT INTO users (name, email, password_hash, verified, otp, otp_expires)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, passwordHash, false, otp, otpExpires]
    );

    // Send email
    await transporter.sendMail({
      from: "Simple Store <no-reply@store.com>",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "DB or email error" });
  }
});

// =====================
// VERIFY OTP (DB)
// =====================
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, otp, otp_expires, verified FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ msg: "User not found" });

    const user = result.rows[0];

    if (user.verified)
      return res.status(400).json({ msg: "Already verified" });

    if (user.otp !== otp || new Date() > user.otp_expires) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    await pool.query(
      "UPDATE users SET verified = true, otp = NULL, otp_expires = NULL WHERE id = $1",
      [user.id]
    );

    res.json({ msg: "Account verified ✅" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ msg: "DB error" });
  }
});

// =====================
// LOGIN (DB + JWT)
// =====================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash, verified FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ msg: "Invalid credentials" });

    const user = result.rows[0];

    if (!user.verified)
      return res.status(400).json({ msg: "Please verify email first" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "DB error" });
  }
});

// =====================
// PRODUCTS from DB + Pagination
// =====================
app.get("/api/products", async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      "SELECT id, name, price, description FROM products ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM products");
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      items: result.rows,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("Products error:", err);
    res.status(500).json({ msg: "DB error" });
  }
});

// =====================
// ORDERS (JWT Protected)
// =====================

app.post("/api/orders", auth, async (req, res) => {
  const { items } = req.body; // array of products from cart

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ msg: "No items" });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create order
    const orderResult = await client.query(
      "INSERT INTO orders (user_id) VALUES ($1) RETURNING id",
      [req.user.id]
    );
    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity || 1, item.price]
      );
    }

    await client.query("COMMIT");

    res.json({ msg: "Order created", orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create order error:", err);
    res.status(500).json({ msg: "Order failed" });
  } finally {
    client.release();
  }
});

app.get("/api/orders/my", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.created_at,
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'price_at_order', oi.price_at_order
                )
              ) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id, o.created_at
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({ msg: "DB error" });
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (PostgreSQL enabled)`);
});
