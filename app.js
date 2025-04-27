require("dotenv").config();

const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
// const mongoose = require("mongoose");
const app = express();

const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const user = require("./models/user");
const post = require("./models/post");
const connectToMongoDB = require("./models/config/db");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: "Batman",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(flash());

connectToMongoDB();

app.get("/", (req, res) => {
  res.render("register", { errors: req.flash("errors") });
});

app.post("/register", async (req, res) => {
  let { name, username, email, password, age } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        const createdUser = await userModel.create({
          name,
          username,
          email,
          password: hash,
          age,
          post,
        });
        const token = jwt.sign(
          { email: email, userid: createdUser._id },
          process.env.JWT_SECRET_KEY
        );
        res.cookie("token", token);
        res.redirect("/profile");
      });
    });
  } else {
    req.flash("errors", "User Already Registered, Please Login");
    return res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { errors: req.flash("login-error") });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  const loginUser = await userModel.findOne({ email: email });
  if (!loginUser) {
    req.flash("login-error", "Invalid Email or Password");
    return res.redirect("/login");
  }

  bcrypt.compare(password, loginUser.password, (err, result) => {
    if (!result) {
      console.log(
        "password : ",
        password,
        "loginUser.password : ",
        loginUser.password
      );
      req.flash("login-error", "Invalid Email or Password");
      return res.redirect("/login");
    } else {
      const token = jwt.sign(
        { email: loginUser.email, userid: loginUser._id },
        process.env.JWT_SECRET_KEY
      );
      res.cookie("token", token);
      res.redirect("/profile");
    }
  });
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");

  res.render("profile", { user });
});

app.post("/create/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  const posts = await postModel.create({
    user: user._id,
    content,
    // like: user._id,
  });

  user.posts.push(posts._id);
  await user.save();

  res.redirect("/profile");
});

app.get("/allposts", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let allposts = await postModel.find().populate("user");
  res.render("allposts", { allposts, user });
});

app.get("/myposts", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");

  res.render("myposts", { user });
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  await post.save();

  res.redirect(req.get("Referer"));
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  res.render("edit", { post, user });
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
  // console.log(req.params.id);
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/profile");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    res.send("Please Log in before you move to Profile Page ");
  } else {
    const cookieData = jwt.verify(
      req.cookies.token,
      process.env.JWT_SECRET_KEY
    );
    req.user = cookieData;
  }
  next();
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running at port", process.env.PORT || 3000);
});
