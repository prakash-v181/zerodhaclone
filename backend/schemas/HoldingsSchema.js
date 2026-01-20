const mongoose = require("mongoose");

const HoldingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true
    },
    avg: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = { HoldingsSchema };









// const { Schema } = require("mongoose");

// const HoldingsSchema = new Schema({
//   name: String,
//   qty: Number,
//   avg: Number,
//   price: Number,
//   net: String,
//   day: String,
// });

// module.exports = { HoldingsSchema };
