require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const { UserModel } = require("./model/UserModel");
const { OrdersModel } = require("./model/OrdersModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("Missing environment variables");
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());

// app.use(
//   cors({
//     origin: [
//       "http://13.233.33.54:3000",
//       "http://13.233.33.54:3001"
//     ],
//     credentials: true
//   })
// );


app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
  })
);

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await UserModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({ success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});



app.post("/api/newOrder", authMiddleware, async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;
    const userId = req.user.userId;

    const quantity = Number(qty);
    const orderPrice = Number(price);

    if (!name || !mode || quantity <= 0 || orderPrice <= 0) {
      return res.status(400).json({ success: false });
    }

    if (mode === "SELL") {
      const holding = await HoldingsModel.findOne({ userId, name });
      if (!holding || holding.qty < quantity) {
        return res.status(400).json({ success: false });
      }
    }

    await OrdersModel.create({
      userId,
      name,
      qty: quantity,
      price: orderPrice,
      mode
    });

    if (mode === "BUY") {
      let holding = await HoldingsModel.findOne({ userId, name });

      if (holding) {
        const totalQty = holding.qty + quantity;
        holding.avg =
          (holding.avg * holding.qty + orderPrice * quantity) / totalQty;
        holding.qty = totalQty;
        holding.price = orderPrice;
        await holding.save();
      } else {
        await HoldingsModel.create({
          userId,
          name,
          qty: quantity,
          avg: orderPrice,
          price: orderPrice
        });
      }

      let position = await PositionsModel.findOne({ userId, name });

      if (position) {
        position.qty += quantity;
        position.price = orderPrice;
        await position.save();
      } else {
        await PositionsModel.create({
          userId,
          name,
          qty: quantity,
          avg: orderPrice,
          price: orderPrice,
          product: "MIS"
        });
      }
    }

    if (mode === "SELL") {
      await HoldingsModel.updateOne(
        { userId, name },
        { $inc: { qty: -quantity } }
      );

      await PositionsModel.updateOne(
        { userId, name },
        { $inc: { qty: -quantity } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ success: false });
  }
});


app.get("/api/allOrders", authMiddleware, async (req, res) => {
  const orders = await OrdersModel.find({
    userId: req.user.userId
  }).sort({ createdAt: -1 });

  res.json(orders);
});

app.get("/api/allHoldings", authMiddleware, async (req, res) => {
  const holdings = await HoldingsModel.find({
    userId: req.user.userId
  });
  res.json(holdings);
});

app.get("/api/allPositions", authMiddleware, async (req, res) => {
  const positions = await PositionsModel.find({
    userId: req.user.userId
  });
  res.json(positions);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT);
  })
  .catch(() => {
    process.exit(1);
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
