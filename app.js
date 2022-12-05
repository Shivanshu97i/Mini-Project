require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
// app.use(express.static("public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// const CONNECTION_URL = process.env.MONGODB_URI;
const CONNECTION_URL =
  "mongodb+srv://shivanshu-admin:miniproject@miniproject.zb70d20.mongodb.net/userDB";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, {})
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.log(err.message);
  });

const Attendance = new mongoose.Schema({
  id: String,
  name: String,
  attendance: Number,
  totalAttendance: Number
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  enrollmentNumber: String,
  branch: String,
  semester: Number,
  attendance: {
    type: [Attendance],
    default: [],
  },
  todo: Array,
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.post("/register", function (req, res) {

  User.register(
    {
      username: req.body.email || req.query.email,
      firstName: req.body.firstName || req.query.firstName,
      lastName: req.body.lastName || req.query.lastName,
      enrollmentNumber: req.body.enrollment || req.query.enrollment,
      branch: req.body.branch || req.query.branch,
      semester: req.body.semester || req.query.semester,
    },
    req.body.password || req.query.password,
    function (err, user) {
      console.log("Here");
      if (err) {
        console.log("Here1");
        console.log(err);
        res.send("Not Registered Try again");
      } else {
        console.log("Registered");
        res.send(user);
        // passport.authenticate('local', req, res, function () {
        //   console.log("Here3");
        //   res.redirect('/dashboard');
        // });
      }
    }
  );
});

app.post("/login",
  // function (req, res) {
  // const user = new User({
  //   username: req.body.email,
  //   password: req.body.password,
  // });


  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  function (req, res) {
    res.send(req.user);
  });


// req.login(user, function (err) {
//   if (err) {
//     return console.log(err + "error");
//   }

//   return res.send(res);
// });
// });

// app.post("/todoadd", (req, res) => {
//   User.findById(req.user.id, function (err, foundUser) {
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         console.log(req.body.todo);
//         foundUser.todo = req.body.todo;
//         // foundUser.todo.push(req.body.todo);
//         foundUser.save(function () {
//           res.redirect("/login");
//         });
//       }
//     }
//   });
// });

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});

app.post("/postAttendance", async function (req, res) {
  const studentId = req.body.studentId || req.query.studentId;
  const courseId = req.body.courseId || req.query.courseId;
  const attendance = req.body.attendance || req.query.attendance;
  const totalAttendance = req.body.totalAttendance || req.query.totalAttendance;
  const courseName = req.body.courseName || req.query.courseName;
  console.log(studentId);
  console.log(req.query);
  if (!studentId || !courseId || !courseName || !attendance || !totalAttendance) {
    res.status(400).send("Bad Request");
    return;
  }
  try {
    const student = await User.findById(studentId);
    const index = student.attendance.findIndex(
      (att) => att.id === String(courseId)
    );
    if (index === -1) {
      student.attendance.push({ id: courseId, name: courseName, attendance: attendance, totalAttendance: totalAttendance });
    } else {
      student.attendance[index].attendance = attendance;
      student.attendance[index].totalAttendance = totalAttendance;
    }
    await student.save();
    res.status(200).json({ id: courseId, name: courseName, attendance: attendance, totalAttendance: totalAttendance });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getAttendance", async function (req, res) {
  console.log(req.query);
  const { studentId, courseId } = req.query;
  if (!studentId || !courseId) {
    res.status(400).send("Bad Request");
  }
  try {
    const student = await User.findById(studentId);
    const index = student.attendance.findIndex(
      (att) => att.id === String(courseId)
    );
    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }
    res.status(200).send(student.attendance[index]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// {
//   "_id": {
//     "$oid": "cse_1"
//   },
// "MTL1025": "Engineering Mathematics-1",
// "ECL1010": "Basic Electronics",
// "ECP1010": "Basic Electronics Lab",
// "PHL1012": "Engineering Physics",
// "PHP1012": "Engineering Physics Lab",
// "CSL1022": "Intro To C Programming",
// "CSP1022": "C Programming Lab",
// "LNL1411": "Professional Communication",
// "LNP1411": "Professional Communication Lab",
// "MEL1039": "Engineering Graphics with CAD",
// "CSL1001": "Intro to Computer Sc. and Engineering"
// }