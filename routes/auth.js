const express = require("express");
const router = express.Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const courseValidation = require("../validation").courseValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.get("/test", (req, res) => {
  return res.send("test");
});

router.post("/regist", async (req, res) => {
  //確認資料格式
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { username, email, password, role } = req.body;
  //確認沒有註冊過
  let existedUser = await User.findOne({ email }).exec();
  console.log(existedUser);

  if (existedUser) return res.status(400).send("信箱已註冊過");

  let newUser = new User({
    username,
    email,
    password,
    role,
  });

  try {
    let savedUser = await newUser.save();
    return res.send({ msg: "已成功註冊", savedUser });
  } catch (error) {
    console.log(error);

    return res.status(500).send({ msg: "無法註冊新用戶", error });
  }
});

router.post("/login", async (req, res) => {
  //確認資料格式
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { email, password } = req.body;
  //確認沒有註冊過
  let foundUser = await User.findOne({ email }).exec();

  if (!foundUser) return res.status(401).send("無法找到使用者");

  foundUser.comparePassword(password, (err, isMatch) => {
    if (err) return res.status(500).send(err);
    if (isMatch) {
      //製作token
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        msg: "成功登入",
        token: "JWT " + token,
        user: foundUser,
      }); //jwt後一定要加空格
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

router.get("/", async (req, res) => {
  try {
    let AllUsers = await User.find({}).exec();
    return res.send(AllUsers);
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
