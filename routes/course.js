const express = require("express");
const router = express.Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("進到course的route");
  next();
});

router.post("/", async (req, res) => {
  //驗證數據
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { title, description, price } = req.body;
  console.log(req.user);
  if (req.user.isStudent()) {
    return res.status(400).send("只有老師可以創建課程");
  }
  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id,
  });
  try {
    let savedCourse = await newCourse.save();
    return res.send({ msg: "課程創建成功", savedCourse });
  } catch (error) {
    return res.send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    let allCourses = await Course.find({})
      .populate("instructor", ["username", "email", "password"])
      .exec();
    return res.send(allCourses);
  } catch (error) {
    return res.send(error);
  }
});
//用課程id查詢課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let foundCourse = await Course.findOne({ _id })
      .populate("instructor", ["username", "email", "password"])
      .exec();
    return res.send(foundCourse);
  } catch (error) {
    return res.send(error);
  }
});

//用老師id查詢課程
router.get("/teacher/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let foundCourse = await Course.find({ instructor: _id })
      .populate("instructor", ["username", "email", "password"])
      .exec();
    return res.send(foundCourse);
  } catch (error) {
    return res.send(error);
  }
});

//用學生id查詢課程
router.get("/student/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let foundCourse = await Course.find({ students: _id })
      .populate("instructor", ["username", "email", "password"])
      .exec();
    return res.send(foundCourse);
  } catch (error) {
    return res.send(error);
  }
});

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//用課程名稱查詢課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  const keyword = escapeRegex(name);

  try {
    let foundCourse = await Course.find({
      title: { $regex: keyword, $options: "i" },
    })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(foundCourse);
  } catch (error) {
    return res.send(error);
  }
});

//學生註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id });
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊完成");
  } catch (error) {
    return res.send(error);
  }
});

router.patch("/:_id", async (req, res) => {
  // let { error } = courseValidation(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  console.log(req.body);

  let { _id } = req.params;
  //確認課程試試是否存在
  try {
    let foundCourse = await Course.findOne({ _id }).exec();

    if (!foundCourse) {
      return res.send("查無此課程");
    }
    //因為object id 是reference type 所以要使用equals 來比較值
    if (foundCourse.instructor.equals(req.user._id)) {
      let newCourse = await Course.findOneAndUpdate(
        { _id },
        { $set: req.body },
        {
          runValidators: true,
          new: true,
        }
      );
      return res.send({ msg: "課程更新成功", newCourse });
    } else {
      return res.send("只有課程擁有者可以修改");
    }
  } catch (error) {
    return res.send(error);
  }

  //使用者必須是此課程講師
});

router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let foundCourse = await Course.findOne({ _id }).exec();
    if (!foundCourse) {
      return res.send("找不到此課程");
    }
    if (foundCourse.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send({ msg: "課程刪除成功" });
    } else {
      return res.send("只有課程擁有者可以刪除");
    }
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
