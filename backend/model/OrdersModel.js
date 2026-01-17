const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema(
  {
    name: String,
    qty: Number,
    price: Number,
    mode: String,
  },
  { timestamps: true } //  REQUIRED for Order History
);

module.exports.OrdersModel = mongoose.model("Orders", OrdersSchema);
