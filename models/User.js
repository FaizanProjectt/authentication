const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
  name: String,
  password: String,
});

module.exports = mongoose.model("Authenticate", AuthSchema);
