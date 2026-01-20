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

// app.post("/api/newOrder", authMiddleware, async (req, res) => {
//   try {
//     const { name, qty, price, mode } = req.body;
//     const userId = req.user.userId;

//     const quantity = Number(qty);
//     const orderPrice = Number(price);

//     if (!name || !mode || quantity <= 0 || orderPrice <= 0) {
//       return res.status(400).json({ success: false });
//     }

//     if (mode === "SELL") {
//       const holding = await HoldingsModel.findOne({ userId, name });
//       if (!holding || holding.qty < quantity) {
//         return res.status(400).json({ success: false });
//       }
//     }

//     await OrdersModel.create({
//       userId,
//       name,
//       qty: quantity,
//       price: orderPrice,
//       mode
//     });

//     // if (mode === "BUY") {
//     //   let holding = await HoldingsModel.findOne({ userId, name });

//     //   if (holding) {
//     //     const totalQty = holding.qty + quantity;
//     //     holding.avg =
//     //       (holding.avg * holding.qty + orderPrice * quantity) / totalQty;
//     //     holding.qty = totalQty;
//     //     holding.price = orderPrice;
//     //     await holding.save();
//     //   } else {
//     //     await HoldingsModel.create({
//     //       userId,
//     //       name,
//     //       qty: quantity,
//     //       avg: orderPrice,
//     //       price: orderPrice
//     //     });
//     //   }

//     //   let position = await PositionsModel.findOne({ userId, name });

//     //   if (position) {
//     //     position.qty += quantity;
//     //     position.price = orderPrice;
//     //     await position.save();
//     //   } else {
//     //     await PositionsModel.create({
//     //       userId,
//     //       name,
//     //       qty: quantity,
//     //       avg: orderPrice,
//     //       price: orderPrice,
//     //       product: "MIS"
//     //     });
//     //   }
//     // }


//     if (mode === "BUY") {
//   const quantity = Number(qty);
//   const orderPrice = Number(price);

//   let holding = await HoldingsModel.findOne({ userId, name });

//   if (holding) {
//     const totalQty = holding.qty + quantity;
//     holding.avg =
//       (holding.avg * holding.qty + orderPrice * quantity) / totalQty;
//     holding.qty = totalQty;
//     holding.price = orderPrice;
//     await holding.save();
//   } else {
//     await HoldingsModel.create({
//       userId,
//       name,
//       qty: quantity,
//       avg: orderPrice,
//       price: orderPrice
//     });
//   }

//   let position = await PositionsModel.findOne({ userId, name });

//   if (position) {
//     position.qty += quantity;
//     position.price = orderPrice;
//     await position.save();
//   } else {
//     await PositionsModel.create({
//       userId,
//       name,
//       qty: quantity,
//       avg: orderPrice,
//       price: orderPrice,
//       product: "MIS"
//     });
//   }
// }


//     if (mode === "SELL") {
//       await HoldingsModel.updateOne(
//         { userId, name },
//         { $inc: { qty: -quantity } }
//       );

//       await PositionsModel.updateOne(
//         { userId, name },
//         { $inc: { qty: -quantity } }
//       );
//     }

//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// });



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
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const cookieParser = require("cookie-parser");

// const { UserModel } = require("./model/UserModel");
// const { OrdersModel } = require("./model/OrdersModel");
// const { HoldingsModel } = require("./model/HoldingsModel");
// const { PositionsModel } = require("./model/PositionsModel");

// const app = express();

// /* =======================
//    ENV
// ======================= */
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!MONGO_URI || !JWT_SECRET) {
//   console.error("Missing environment variables");
//   process.exit(1);
// }

// /* =======================
//    MIDDLEWARE
// ======================= */
// app.use(express.json());
// app.use(cookieParser());

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     credentials: true
//   })
// );

// /* =======================
//    AUTH MIDDLEWARE
// ======================= */
// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, JWT_SECRET);

//     req.user = decoded; // { userId, email }
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// /* =======================
//    HEALTH
// ======================= */
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// /* =======================
//    SIGNUP
// ======================= */
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     const existingUser = await UserModel.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await UserModel.create({
//       name,
//       email: email.toLowerCase().trim(),
//       password: hashedPassword
//     });

//     res.json({
//       success: true,
//       message: "Signup successful"
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });

// /* =======================
//    LOGIN
// ======================= */
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password required"
//       });
//     }

//     const user = await UserModel.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.json({
//       success: true,
//       token
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });

// /* =======================
//    NEW ORDER
// ======================= */
// app.post("/api/newOrder", authMiddleware, async (req, res) => {
//   try {
//     const { name, qty, price, mode } = req.body;
//     const userId = req.user.userId;

//     if (!name || !qty || !price || !mode) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields"
//       });
//     }

//     await OrdersModel.create({
//       userId,
//       name,
//       qty,
//       price,
//       mode
//     });

//     if (mode === "BUY") {
//       let holding = await HoldingsModel.findOne({ userId, name });

//       if (holding) {
//         const totalQty = holding.qty + qty;
//         holding.avg =
//           (holding.avg * holding.qty + price * qty) / totalQty;
//         holding.qty = totalQty;
//         holding.price = price;
//         await holding.save();
//       } else {
//         await HoldingsModel.create({
//           userId,
//           name,
//           qty,
//           avg: price,
//           price
//         });
//       }

//       let position = await PositionsModel.findOne({ userId, name });

//       if (position) {
//         position.qty += qty;
//         position.price = price;
//         await position.save();
//       } else {
//         await PositionsModel.create({
//           userId,
//           name,
//           qty,
//           avg: price,
//           price,
//           product: "MIS"
//         });
//       }
//     }

//     if (mode === "SELL") {
//       await PositionsModel.updateOne(
//         { userId, name },
//         { $inc: { qty: -qty } }
//       );

//       await HoldingsModel.updateOne(
//         { userId, name },
//         { $inc: { qty: -qty } }
//       );
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Order error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Order failed"
//     });
//   }
// });

// /* =======================
//    FETCH DATA
// ======================= */
// app.get("/api/allOrders", authMiddleware, async (req, res) => {
//   const orders = await OrdersModel.find({
//     userId: req.user.userId
//   }).sort({ createdAt: -1 });

//   res.json(orders);
// });

// app.get("/api/allHoldings", authMiddleware, async (req, res) => {
//   const holdings = await HoldingsModel.find({
//     userId: req.user.userId
//   });
//   res.json(holdings);
// });

// app.get("/api/allPositions", authMiddleware, async (req, res) => {
//   const positions = await PositionsModel.find({
//     userId: req.user.userId
//   });
//   res.json(positions);
// });

// /* =======================
//    DATABASE
// ======================= */
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(PORT, () => {
//       console.log("Server running on port", PORT);
//     });
//   })
//   .catch((error) => {
//     console.error("MongoDB error:", error);
//     process.exit(1);
//   });


















// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const { UserModel } = require("./model/UserModel");
// const { OrdersModel } = require("./model/OrdersModel");
// const { HoldingsModel } = require("./model/HoldingsModel");
// const { PositionsModel } = require("./model/PositionsModel");

// const app = express();

// /* =======================
//    ENV VARIABLES
// ======================= */
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!MONGO_URI || !JWT_SECRET) {
//   console.error(" Missing environment variables");
//   process.exit(1);
// }

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());


// /* =======================
//    MIDDLEWARE
// ======================= */
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     credentials: true,
//   })
// );

// app.use(express.json());

// /* =======================
//    AUTH MIDDLEWARE
// ======================= */
// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, JWT_SECRET);

//     req.user = decoded; // { userId, email }
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// /* =======================
//    HEALTH CHECK
// ======================= */
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// /* =======================
//    SIGNUP
// ======================= */
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const existingUser = await UserModel.findOne({
//       email: email.toLowerCase().trim(),
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await UserModel.create({
//       name,
//       email: email.toLowerCase().trim(),
//       password: hashedPassword,
//     });

//     res.json({
//       success: true,
//       message: "Signup successful",
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// /* =======================
//    LOGIN
// ======================= */
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password required",
//       });
//     }

//     const user = await UserModel.findOne({
//       email: email.toLowerCase().trim(),
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// /* =======================
//    NEW ORDER
// ======================= */
// app.post("/api/newOrder", authMiddleware, async (req, res) => {
//   try {
//     const { name, qty, price, mode } = req.body;
//     const userId = req.user.userId;

//     await OrdersModel.create({
//       userId,
//       name,
//       qty,
//       price,
//       mode,
//     });

//     /* BUY LOGIC */
//     if (mode === "BUY") {
//       let holding = await HoldingsModel.findOne({ name, userId });

//       if (holding) {
//         const totalQty = holding.qty + qty;
//         holding.avg =
//           (holding.avg * holding.qty + price * qty) / totalQty;
//         holding.qty = totalQty;
//         holding.price = price;
//         await holding.save();
//       } else {
//         await HoldingsModel.create({
//           userId,
//           name,
//           qty,
//           avg: price,
//           price,
//         });
//       }

//       let position = await PositionsModel.findOne({ name, userId });
//       if (position) {
//         position.qty += qty;
//         position.price = price;
//         await position.save();
//       } else {
//         await PositionsModel.create({
//           userId,
//           name,
//           qty,
//           avg: price,
//           price,
//           product: "MIS",
//         });
//       }
//     }

//     /* SELL LOGIC */
//     if (mode === "SELL") {
//       await PositionsModel.updateOne(
//         { name, userId },
//         { $inc: { qty: -qty } }
//       );

//       await HoldingsModel.updateOne(
//         { name, userId },
//         { $inc: { qty: -qty } }
//       );
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Order error:", error);
//     res.status(500).json({ success: false });
//   }
// });

// /* =======================
//    FETCH DATA
// ======================= */
// app.get("/api/allOrders", authMiddleware, async (req, res) => {
//   const orders = await OrdersModel.find({ userId: req.user.userId }).sort({
//     createdAt: -1,
//   });
//   res.json(orders);
// });

// app.get("/api/allHoldings", authMiddleware, async (req, res) => {
//   const holdings = await HoldingsModel.find({ userId: req.user.userId });
//   res.json(holdings);
// });

// app.get("/api/allPositions", authMiddleware, async (req, res) => {
//   const positions = await PositionsModel.find({ userId: req.user.userId });
//   res.json(positions);
// });

// /* =======================
//    DATABASE & SERVER
// ======================= */
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log(" MongoDB connected");
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("MongoDB error:", err);
//     process.exit(1);
//   });









// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const { UserModel } = require("./model/UserModel");
// const { OrdersModel } = require("./model/OrdersModel");
// const { HoldingsModel } = require("./model/HoldingsModel");
// const { PositionsModel } = require("./model/PositionsModel");

// const app = express();

// /* =======================
//    ENV VARIABLES
// ======================= */
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!MONGO_URI || !JWT_SECRET) {
//   console.error("Missing environment variables");
//   process.exit(1);
// }

// /* =======================
//    MIDDLEWARE
// ======================= */
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     credentials: true
//   })
// );

// app.use(express.json());

// /* =======================
//    AUTH MIDDLEWARE
// ======================= */
// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, JWT_SECRET);

//     req.user = decoded; // userId, email
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// /* =======================
//    HEALTH CHECK
// ======================= */
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// /* =======================
//    SIGNUP
// ======================= */
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     const existingUser = await UserModel.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await UserModel.create({
//       name,
//       email: email.toLowerCase().trim(),
//       password: hashedPassword
//     });

//     return res.json({
//       success: true,
//       message: "Signup successful"
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });

// /* =======================
//    LOGIN  (FIXED & ENABLED)
// ======================= */
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password required"
//       });
//     }

//     const user = await UserModel.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     return res.json({
//       success: true,
//       token
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });

// /* =======================
//    NEW ORDER
// ======================= */
// app.post("/api/newOrder", authMiddleware, async (req, res) => {
//   try {
//     const { name, qty, price, mode } = req.body;
//     const userId = req.user.userId;

//     await OrdersModel.create({
//       userId,
//       name,
//       qty,
//       price,
//       mode
//     });

//     if (mode === "BUY") {
//       let holding = await HoldingsModel.findOne({ name, userId });

//       if (holding) {
//         const totalQty = holding.qty + qty;
//         holding.avg =
//           (holding.avg * holding.qty + price * qty) / totalQty;
//         holding.qty = totalQty;
//         holding.price = price;
//         await holding.save();
//       } else {
//         await HoldingsModel.create({
//           userId,
//           name,
//           qty,
//           avg: price,
//           price
//         });
//       }

//       let position = await PositionsModel.findOne({ name, userId });
//       if (position) {
//         position.qty += qty;
//         position.price = price;
//         await position.save();
//       } else {
//         await PositionsModel.create({
//           userId,
//           name,
//           qty,
//           avg: price,
//           price,
//           product: "MIS"
//         });
//       }
//     }

//     if (mode === "SELL") {
//       await PositionsModel.updateOne(
//         { name, userId },
//         { $inc: { qty: -qty } }
//       );

//       await HoldingsModel.updateOne(
//         { name, userId },
//         { $inc: { qty: -qty } }
//       );
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Order error:", error);
//     res.status(500).json({ success: false });
//   }
// });

// /* =======================
//    FETCH DATA
// ======================= */
// app.get("/api/allOrders", authMiddleware, async (req, res) => {
//   const orders = await OrdersModel.find({ userId: req.user.userId });
//   res.json(orders);
// });

// app.get("/api/allHoldings", authMiddleware, async (req, res) => {
//   const holdings = await HoldingsModel.find({ userId: req.user.userId });
//   res.json(holdings);
// });

// app.get("/api/allPositions", authMiddleware, async (req, res) => {
//   const positions = await PositionsModel.find({ userId: req.user.userId });
//   res.json(positions);
// });

// /* =======================
//    DATABASE AND SERVER
// ======================= */
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(PORT, () => {
//       console.log("Server running on port " + PORT);
//     });
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });












// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const { UserModel } = require("./model/UserModel");
// const { OrdersModel } = require("./model/OrdersModel");
// const { HoldingsModel } = require("./model/HoldingsModel");
// const { PositionsModel } = require("./model/PositionsModel");

// const app = express();

// /* =======================
//    ENV VARIABLES
// ======================= */
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!MONGO_URI || !JWT_SECRET) {
//   console.error("Missing environment variables");
//   process.exit(1);
// }

// /* =======================
//    MIDDLEWARE
// ======================= */
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     credentials: true
//   })
// );

// app.use(express.json({ limit: "10kb" }));

// /* =======================
//    HEALTH CHECK
// ======================= */
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// /* =======================
//    LOGIN
// ======================= */
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await UserModel.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (!user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid credentials" });
//     }

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// /* =======================
//    NEW ORDER (BUY / SELL)
// ======================= */
// app.post("/api/newOrder", async (req, res) => {
//   try {
//     const { name, qty, price, mode } = req.body;

//     // 1. Save order
//     await OrdersModel.create({ name, qty, price, mode });

//     // 2. BUY logic
//     if (mode === "BUY") {
//       // Holdings
//       let holding = await HoldingsModel.findOne({ name });

//       if (holding) {
//         const totalQty = holding.qty + qty;
//         const newAvg =
//           (holding.avg * holding.qty + price * qty) / totalQty;

//         holding.qty = totalQty;
//         holding.avg = newAvg;
//         holding.price = price;
//         await holding.save();
//       } else {
//         await HoldingsModel.create({
//           name,
//           qty,
//           avg: price,
//           price
//         });
//       }

//       // Positions
//       let position = await PositionsModel.findOne({ name });

//       if (position) {
//         position.qty += qty;
//         position.price = price;
//         await position.save();
//       } else {
//         await PositionsModel.create({
//           name,
//           qty,
//           avg: price,
//           price,
//           product: "MIS"
//         });
//       }
//     }

//     // 3. SELL logic
//     if (mode === "SELL") {
//       // Positions
//       let position = await PositionsModel.findOne({ name });

//       if (position) {
//         position.qty -= qty;

//         if (position.qty <= 0) {
//           await PositionsModel.deleteOne({ name });
//         } else {
//           await position.save();
//         }
//       }

//       // Holdings
//       let holding = await HoldingsModel.findOne({ name });

//       if (holding) {
//         holding.qty -= qty;

//         if (holding.qty <= 0) {
//           await HoldingsModel.deleteOne({ name });
//         } else {
//           await holding.save();
//         }
//       }
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Order error:", error);
//     res.status(500).json({ success: false });
//   }
// });

// /* =======================
//    FETCH DATA
// ======================= */
// app.get("/api/allOrders", async (req, res) => {
//   const orders = await OrdersModel.find({});
//   res.json(orders);
// });

// app.get("/api/allHoldings", async (req, res) => {
//   const holdings = await HoldingsModel.find({});
//   res.json(holdings);
// });

// app.get("/api/allPositions", async (req, res) => {
//   const positions = await PositionsModel.find({});
//   res.json(positions);
// });

// /* =======================
//    DATABASE + SERVER
// ======================= */
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(PORT, () =>
//       console.log("Server running on port " + PORT)
//     );
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });





















// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const { UserModel } = require("./model/UserModel");
// const { OrdersModel } = require("./model/OrdersModel");
// const { HoldingsModel } = require("./model/HoldingsModel");
// const { PositionsModel } = require("./model/PositionsModel");

// const app = express();

// /* =======================
//    ENV VARIABLES
// ======================= */
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!MONGO_URI || !JWT_SECRET) {
//   console.error("Missing environment variables");
//   process.exit(1);
// }

// /* =======================
//    MIDDLEWARE
// ======================= */
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     credentials: true
//   })
// );

// app.use(express.json({ limit: "10kb" }));

// /* =======================
//    HEALTH CHECK
// ======================= */
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// /* =======================
//    LOGIN
// ======================= */
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await UserModel.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (!user) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// /* =======================
//    ORDERS (NO AUTH – DEV)
// ======================= */
// app.post("/api/newOrder", async (req, res) => {
//   try {
//     const { name, qty, price, mode } = req.body;

//     const order = new OrdersModel({
//       name,
//       qty,
//       price,
//       mode
//     });

//     await order.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// app.get("/api/allOrders", async (req, res) => {
//   const orders = await OrdersModel.find({});
//   res.json(orders);
// });

// /* =======================
//    HOLDINGS
// ======================= */
// app.get("/api/allHoldings", async (req, res) => {
//   const holdings = await HoldingsModel.find({});
//   res.json(holdings);
// });

// /* =======================
//    POSITIONS
// ======================= */
// app.get("/api/allPositions", async (req, res) => {
//   const positions = await PositionsModel.find({});
//   res.json(positions);
// });

// /* =======================
//    DATABASE + SERVER
// ======================= */
// mongoose.connect(MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(PORT, () =>
//       console.log("Server running on port " + PORT)
//     );
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });






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
