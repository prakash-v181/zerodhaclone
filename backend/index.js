require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const authMiddleware = require("./middleware/auth");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");

const app = express();

/* ================= ENV ================= */

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,               // REQUIRED for cookies
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).send("Zerodha backend is running");
});

/* ================= AUTH ================= */

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // change to true when using HTTPS
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

/* ================= PROTECTED DATA ================= */

app.get("/api/allHoldings", authMiddleware, async (req, res) => {
  const data = await HoldingsModel.find({});
  res.json(data);
});

app.get("/api/allPositions", authMiddleware, async (req, res) => {
  const positions = await PositionsModel.find({});

  const enriched = positions.map((p) => {
    const pnl = (p.price - p.avg) * p.qty;

    return {
      ...p.toObject(),
      pnl,
      pnlPercent: ((p.price - p.avg) / p.avg) * 100,
    };
  });

  res.json(enriched);
});

app.get("/api/allOrders", authMiddleware, async (req, res) => {
  const orders = await OrdersModel.find({}).sort({ createdAt: -1 });
  res.json(orders);
});

/* ================= BUY / SELL ================= */

app.post("/api/newOrder", authMiddleware, async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;
    const quantity = Number(qty);

    if (!["BUY", "SELL"].includes(mode)) {
      return res.status(400).json({ message: "Invalid order type" });
    }

    await OrdersModel.create({
      name,
      qty: quantity,
      price,
      mode,
    });

    // BUY
    if (mode === "BUY") {
      const position = await PositionsModel.findOne({ name });

      if (position) {
        const totalQty = position.qty + quantity;
        position.avg =
          (position.avg * position.qty + price * quantity) / totalQty;
        position.qty = totalQty;
        position.price = price;
        await position.save();
      } else {
        await PositionsModel.create({
          product: "CNC",
          name,
          qty: quantity,
          avg: price,
          price,
          net: "0%",
          day: "0%",
          isLoss: false,
        });
      }
    }

    // SELL
    if (mode === "SELL") {
      const position = await PositionsModel.findOne({ name });

      if (!position || position.qty < quantity) {
        return res.status(400).json({ message: "Not enough quantity" });
      }

      position.qty -= quantity;

      if (position.qty === 0) {
        await PositionsModel.deleteOne({ name });
      } else {
        await position.save();
      }

      const holding = await HoldingsModel.findOne({ name });

      if (holding) {
        holding.qty += quantity;
        holding.price = price;
        await holding.save();
      } else {
        await HoldingsModel.create({
          name,
          qty: quantity,
          avg: price,
          price,
          net: "0%",
          day: "0%",
        });
      }
    }

    res.json({ message: `${mode} order processed successfully` });
  } catch (err) {
    res.status(500).json({ message: "Order failed" });
  }
});

/* ================= SAMPLE DATA ================= */

app.get("/api/seed/holdings", async (req, res) => {
  await HoldingsModel.insertMany([
    { name: "TCS", qty: 2, avg: 3200, price: 3300, net: "+3%", day: "+1%" },
    { name: "INFY", qty: 1, avg: 1400, price: 1500, net: "+7%", day: "+2%" },
  ]);

  res.send("Holdings added");
});

app.get("/api/seed/positions", async (req, res) => {
  await PositionsModel.insertMany([
    {
      product: "CNC",
      name: "RELIANCE",
      qty: 2,
      avg: 2500,
      price: 2550,
      net: "+2%",
      day: "+0.5%",
      isLoss: false,
    },
  ]);

  res.send("Positions added");
});

/* ================= SERVER ================= */

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
  });













// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");

// const { HoldingsModel } = require("./model/HoldingsModel");

// const { PositionsModel } = require("./model/PositionsModel");
// const { OrdersModel } = require("./model/OrdersModel");

// const PORT = process.env.PORT || 3002;
// const uri = process.env.MONGO_URL;

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // app.get("/addHoldings", async (req, res) => {
// //   let tempHoldings = [
// //     {
// //       name: "BHARTIARTL",
// //       qty: 2,
// //       avg: 538.05,
// //       price: 541.15,
// //       net: "+0.58%",
// //       day: "+2.99%",
// //     },
// //     {
// //       name: "HDFCBANK",
// //       qty: 2,
// //       avg: 1383.4,
// //       price: 1522.35,
// //       net: "+10.04%",
// //       day: "+0.11%",
// //     },
// //     {
// //       name: "HINDUNILVR",
// //       qty: 1,
// //       avg: 2335.85,
// //       price: 2417.4,
// //       net: "+3.49%",
// //       day: "+0.21%",
// //     },
// //     {
// //       name: "INFY",
// //       qty: 1,
// //       avg: 1350.5,
// //       price: 1555.45,
// //       net: "+15.18%",
// //       day: "-1.60%",
// //       isLoss: true,
// //     },
// //     {
// //       name: "ITC",
// //       qty: 5,
// //       avg: 202.0,
// //       price: 207.9,
// //       net: "+2.92%",
// //       day: "+0.80%",
// //     },
// //     {
// //       name: "KPITTECH",
// //       qty: 5,
// //       avg: 250.3,
// //       price: 266.45,
// //       net: "+6.45%",
// //       day: "+3.54%",
// //     },
// //     {
// //       name: "M&M",
// //       qty: 2,
// //       avg: 809.9,
// //       price: 779.8,
// //       net: "-3.72%",
// //       day: "-0.01%",
// //       isLoss: true,
// //     },
// //     {
// //       name: "RELIANCE",
// //       qty: 1,
// //       avg: 2193.7,
// //       price: 2112.4,
// //       net: "-3.71%",
// //       day: "+1.44%",
// //     },
// //     {
// //       name: "SBIN",
// //       qty: 4,
// //       avg: 324.35,
// //       price: 430.2,
// //       net: "+32.63%",
// //       day: "-0.34%",
// //       isLoss: true,
// //     },
// //     {
// //       name: "SGBMAY29",
// //       qty: 2,
// //       avg: 4727.0,
// //       price: 4719.0,
// //       net: "-0.17%",
// //       day: "+0.15%",
// //     },
// //     {
// //       name: "TATAPOWER",
// //       qty: 5,
// //       avg: 104.2,
// //       price: 124.15,
// //       net: "+19.15%",
// //       day: "-0.24%",
// //       isLoss: true,
// //     },
// //     {
// //       name: "TCS",
// //       qty: 1,
// //       avg: 3041.7,
// //       price: 3194.8,
// //       net: "+5.03%",
// //       day: "-0.25%",
// //       isLoss: true,
// //     },
// //     {
// //       name: "WIPRO",
// //       qty: 4,
// //       avg: 489.3,
// //       price: 577.75,
// //       net: "+18.08%",
// //       day: "+0.32%",
// //     },
// //   ];

// //   tempHoldings.forEach((item) => {
// //     let newHolding = new HoldingsModel({
// //       name: item.name,
// //       qty: item.qty,
// //       avg: item.avg,
// //       price: item.price,
// //       net: item.day,
// //       day: item.day,
// //     });

// //     newHolding.save();
// //   });
// //   res.send("Done!");
// // });

// // app.get("/addPositions", async (req, res) => {
// //   let tempPositions = [
// //     {
// //       product: "CNC",
// //       name: "EVEREADY",
// //       qty: 2,
// //       avg: 316.27,
// //       price: 312.35,
// //       net: "+0.58%",
// //       day: "-1.24%",
// //       isLoss: true,
// //     },
// //     {
// //       product: "CNC",
// //       name: "JUBLFOOD",
// //       qty: 1,
// //       avg: 3124.75,
// //       price: 3082.65,
// //       net: "+10.04%",
// //       day: "-1.35%",
// //       isLoss: true,
// //     },
// //   ];

// //   tempPositions.forEach((item) => {
// //     let newPosition = new PositionsModel({
// //       product: item.product,
// //       name: item.name,
// //       qty: item.qty,
// //       avg: item.avg,
// //       price: item.price,
// //       net: item.net,
// //       day: item.day,
// //       isLoss: item.isLoss,
// //     });

// //     newPosition.save();
// //   });
// //   res.send("Done!");
// // });

// app.get("/allHoldings", async (req, res) => {
//   let allHoldings = await HoldingsModel.find({});
//   res.json(allHoldings);
// });

// app.get("/allPositions", async (req, res) => {
//   let allPositions = await PositionsModel.find({});
//   res.json(allPositions);
// });

// app.post("/newOrder", async (req, res) => {
//   let newOrder = new OrdersModel({
//     name: req.body.name,
//     qty: req.body.qty,
//     price: req.body.price,
//     mode: req.body.mode,
//   });

//   newOrder.save();

//   res.send("Order saved!");
// });

// app.listen(PORT, () => {
//   console.log("App started!");
//   mongoose.connect(uri);
//   console.log("DB started!");
// });
