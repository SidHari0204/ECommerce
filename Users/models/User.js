const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: {
    type: String,
    validate: [validator.isEmail, "Invalid email format"],
  },
  mobileNumber: {
    type: Number,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v.toString());
      },
      message: (props) => `${props.value} is not a valid mobile number!`,
    },
  },
  otp: Number,
  otpExpires: Date,
  googleId: String,
});

module.exports = mongoose.model("User", UserSchema);
