const mongoose = require("mongoose");
const { PositionsSchema } = require("../schemas/PositionsSchema");

// Correct way to create model
const PositionsModel = mongoose.model(
  "Position",
  PositionsSchema,
  "positions"   // force collection name
);

module.exports = { PositionsModel };



// const { model } = require("mongoose");

// const { PositionsSchema } = require("../schemas/PositionsSchema");

// const PositionsModel = new model("position", PositionsSchema);

// module.exports = { PositionsModel };
