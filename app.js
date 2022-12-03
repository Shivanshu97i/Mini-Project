
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://shivanshu-admin:miniproject@miniproject.zb70d20.mongodb.net/userDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  enrollmentNumber: String,
  branch: String,
  semester: Number,
  todo: Array
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get("/secret", (req, res) => {
  res.send("Logged In");
});
app.get("/registered", (req, res) => {
  res.send("Registered In");
});
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});
app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/todo", function (req, res) {
  res.sendFile(__dirname + "/todo.html");
});

app.post("/register", function (req, res) {
  User.register({ username: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, enrollmentNumber: req.body.enrollment, branch: req.body.branch, semester: req.body.semester }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    }
    else {
      passport.authenticate("local")(req, res, function () {
        console.log("200");
        res.redirect("/registered");
      }

      )
    }
  })
});


app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.email,
    password: req.body.password
  })

  req.login(user, function (err) {
    if (err) {
      return console.log(err + "error");
    }
    return res.redirect("Logged In");
  });
});

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

app.listen(3000, function () {
  console.log("Server started on port 3000.");
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
// }
