const mongoose = require("mongoose");

const DetailSchema = new mongoose.Schema({
  name: String,
  designation: String,
  achievements: String,
});

module.exports = mongoose.model("Details", DetailSchema);
