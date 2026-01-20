const mongoose = require("mongoose");
const { HoldingsSchema } = require("../schemas/HoldingsSchema");

const HoldingsModel = mongoose.model("Holding", HoldingsSchema);

module.exports = { HoldingsModel };



// const { model } = require("mongoose");

// const { HoldingsSchema } = require("../schemas/HoldingsSchema");

// const HoldingsModel = new model("holding", HoldingsSchema);

// module.exports = { HoldingsModel };
