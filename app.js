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
let cse_1;
let cse_2;
let cse_3;
let cse_4;
let ece_1;
let ece_2;
let ece_3;
let ece_4;


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
  courseId: String,
  courseName: String,
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
        const ok2 = req.body.branch || req.query.branch;
        const branch1 = ok2.toLowerCase();
        const sem1 = user.semester;
        const ok1 = branch1 + "_" + sem1;
        console.log(ok1);
        switch (ok1.toString()) {
          case "cse_1":
            const cse1 = cse_1.length;
            for (let i = 0; i < cse1; i++) {
              user.attendance.push(cse_1[i]);
            }
            break;
          case "cse_2":
            const cse2 = cse_2.length;
            for (let i = 0; i < cse2; i++) {
              user.attendance.push(cse_2[i]);
            }
            break;
          case "cse_3":
            const cse3 = cse_3.length;
            for (let i = 0; i < cse3; i++) {
              user.attendance.push(cse_3[i]);
            }
            break;
          case "cse_4":
            const cse4 = cse_4.length;
            for (let i = 0; i < cse4; i++) {
              user.attendance.push(cse_4[i]);
            }
            break;
          case "ece_1":
            const ece1 = ece_1.length;
            for (let i = 0; i < ece1; i++) {
              user.attendance.push(ece_1[i]);
            }
            break;
          case "ece_2":
            const ece2 = ece_2.length;
            for (let i = 0; i < ece2; i++) {
              user.attendance.push(ece_2[i]);
            }
            break;
          case "ece_3":
            const ece3 = ece_3.length;
            for (let i = 0; i < ece3; i++) {
              user.attendance.push(ece_3[i]);
            }
            break;
          case "ece_4":
            const ece4 = ece_4.length;
            for (let i = 0; i < ece4; i++) {
              user.attendance.push(ece_4[i]);
            }
            break;
          default:
            const ok3 = [];
        }
        res.send(user);

      }
    }
  );
});

app.post("/login",



  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  function (req, res) {
    res.send(req.user);
  });



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
      student.attendance.push({ courseId: courseId, courseName: courseName, attendance: attendance, totalAttendance: totalAttendance });
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
      (att) => att.courseId === String(courseId)
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

app.get("/getAllAttendance", async (req, res) => {
  console.log(req.query);
  const { studentId } = req.query;
  if (!studentId) {
    res.status(400).send("Bad Request");
  }
  try {
    const student = await User.findById(studentId);
    console.log(student);
    if (!student) {
      res.status(404).send("Not Found");
      return;
    }
    res.status(200).send(student.attendance);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

cse_1 = [{
  courseId: "MTL1025",
  courseName: "Engineering Mathematics-1",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL1010",
  courseName: "Basic Electronics",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECP1010",
  courseName: "Basic Electronics Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "PHL1012",
  courseName: "Engineering Physics",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "PHP1012",
  courseName: "Engineering Physics Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL1001",
  courseName: "Introduction to Coputer Science",
  attendance: 0,
  totalAttendance: 0
},]
  ;
cse_2 = [{
  courseId: "CSL2031",
  courseName: "Data Structures",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSP2031",
  courseName: "Data Structures Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL1028",
  courseName: "Python Programming",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSP1028",
  courseName: "Python Programming Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "MTL1026",
  courseName: "Engineering Mathematics-2",
  attendance: 0,
  totalAttendance: 0
}]
  ;
cse_3 = [{
  courseId: "PCL2042",
  courseName: "Intro to Logic",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL2041",
  courseName: "Theory Of Computation",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL2061",
  courseName: "COA",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL2051",
  courseName: "Operating Systems",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSP2051",
  courseName: "Operating Systems Lab",
  attendance: 0,
  totalAttendance: 0
}]
  ;
cse_4 = [{
  courseId: "CSL3071",
  courseName: "DBMS",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSP3071",
  courseName: "DBMS Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL3032",
  courseName: "Design and Algorithm Analysis",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSP3032",
  courseName: "Design and Algorithm Analysis Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2060",
  courseName: "Microprocessing and Interfacing",
  attendance: 0,
  totalAttendance: 0
}]
  ;
ece_1 = [{
  courseId: "MTL1025",
  courseName: "Engineering Mathematics-1",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL1010",
  courseName: "Basic Electronics",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECP1010",
  courseName: "Basic Electronics Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "PHL1012",
  courseName: "Engineering Physics",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "PHP1012",
  courseName: "Engineering Physics Lab",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "CSL1001",
  courseName: "Introduction to Electronics",
  attendance: 0,
  totalAttendance: 0
},
]
  ;

ece_2 = [{
  courseId: "MTL1026",
  courseName: "Engineering Mathematics-2",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECP1200",
  courseName: "Engineering Graphics",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL1030",
  courseName: "Electronics Circuits and Simulation",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL1022",
  courseName: "Network Analysis and Synthesis",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "PCL1067",
  courseName: "Discourse of Human Virtue",
  attendance: 0,
  totalAttendance: 0
}]
  ;
ece_3 = [{
  courseId: "PCL2042",
  courseName: "Intro to logic",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2040",
  courseName: "Electromagnetic Field Theory",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2151",
  courseName: "Analog Communication Engineering",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2070",
  courseName: "Digital Electronics",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECP2201",
  courseName: "Electronics Workshop Lab",
  attendance: 0,
  totalAttendance: 0
}]
  ;
ece_4 = [{
  courseId: "ECL2030",
  courseName: "LIC and Applications",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2152",
  courseName: "Digital Communication Enginnering",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2041",
  courseName: "Antenna and wave propagation",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECL2060",
  courseName: "Microprocessor Systems",
  attendance: 0,
  totalAttendance: 0
},
{
  courseId: "ECP1200",
  courseName: "MATLAB Programming",
  attendance: 0,
  totalAttendance: 0
}]
  ;