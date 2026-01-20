const mongoose = require("mongoose");

const PositionsSchema = new mongoose.Schema(
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
    },
    product: {
      type: String,
      default: "MIS"
    }
  },
  { timestamps: true }
);

module.exports = { PositionsSchema };




// const { Schema } = require("mongoose");

// const PositionsSchema = new Schema({
//   product: String,
//   name: String,
//   qty: Number,
//   avg: Number,
//   price: Number,
//   net: String,
//   day: String,
//   isLoss: Boolean,
// });

// module.exports = { PositionsSchema };
