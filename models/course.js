const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const CourseSchema = new Schema({
  title: { type: String, minlength: 1, maxlength: 100, required: true },
  description: { type: String, minlength: 1, maxlength: 300, required: true },
  price: { type: Number, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId, //primary key
    ref: "User",
  },
  students: { type: [String], default: [] },
});

module.exports = mongoose.model("Course", CourseSchema);
