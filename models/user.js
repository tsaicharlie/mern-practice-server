const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: { type: String, minlength: 1, maxlength: 100, required: true },
  email: { type: String, minlength: 1, maxlength: 100, required: true },
  password: { type: String, minlength: 5, maxlength: 100, required: true },
  date: { type: Date, default: Date.now },
  role: { type: String, enum: ["student", "teacher"], required: true },
});

//instant methods
UserSchema.methods.isStudent = function () {
  if (this.role == "student") {
    return true;
  }
};

UserSchema.methods.isTeacher = function () {
  if (this.role == "teacher") {
    return true;
  }
};

UserSchema.methods.comparePassword = async function (password, cb) {
  let result = await bcrypt.compare(password, this.password);
  try {
    return cb(null, result);
  } catch (error) {
    return cb(error, result);
  }
};
//monngoose middlewares

//若使用者為新用戶 或是正在更改密碼 則將密碼進行雜湊處理
UserSchema.pre("save", async function () {
  //this代表mongodb document
  if (this.isNew || this.isModified("password")) {
    const hashedValue = await bcrypt.hash(this.password, 10);
    this.password = hashedValue;
  }
});

module.exports = mongoose.model("User", UserSchema);
