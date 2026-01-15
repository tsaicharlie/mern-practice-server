const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes/index").auth;
const courseRoute = require("./routes/index").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const methodOverride = require("method-override");

const app = express();

//middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(methodOverride("_method"));

app.use("/api/user", authRoute);
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
); //session:false的意思是不要把通過 JWT 驗證的使用者資訊存入 Passport 的 session 機制

mongoose
  .connect(process.env.MONGODBCONNECTION)
  .then(() => {
    console.log("連接資料庫成功");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(8080, () => {
  console.log("伺服器正在聆聽8080");
});
