const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: String,
    qty: Number,
    price: Number,
    mode: String
  },
  { timestamps: true }
);

const OrdersModel = mongoose.model("Order", OrdersSchema);

module.exports = { OrdersModel };










// const mongoose = require("mongoose");

// const OrdersSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     name: String,
//     qty: Number,
//     price: Number,
//     mode: String,
//     realisedPnl: {
//       type: Number,
//       default: 0
//     }
//   },
//   { timestamps: true }
// );

// module.exports.OrdersModel = mongoose.model("Orders", OrdersSchema);










// const mongoose = require("mongoose");

// const OrdersSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     name: String,
//     qty: Number,
//     price: Number,
//     mode: String,
//     realisedPnl: {
//       type: Number,
//       default: 0
//     }
//   },
//   { timestamps: true }
// );

// module.exports.OrdersModel = mongoose.model("Orders", OrdersSchema);
