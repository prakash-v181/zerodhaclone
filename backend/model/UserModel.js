// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6
//     }
//   },
//   { timestamps: true }
// );

// // prevent duplicate emails
// UserSchema.index({ email: 1 }, { unique: true });

// const UserModel = mongoose.model("User", UserSchema);

// module.exports = { UserModel };











const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = { UserModel };
