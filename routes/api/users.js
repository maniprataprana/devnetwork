const express = require("express");
const mongoose = require("mongoose");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { secretOrKey } = require("../../config/keys");
const router = express.Router();

// @route GET /api/users/test
// @desc Tests user route
// @access public route
router.get("/test", (req, res) => {
  res.json({ message: "User works!" });
});

// @route POST /api/users/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ email: "Email already exists!" });
  }

  const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
  user = new User({ email, name, avatar, password });

  // bcrypt.getSalt(10, (err, salt) => {
  //   bcrypt.hash(user.password, salt, (err, hash) => {
  //     if (err) {
  //       throw err;
  //     }
  //     user.password = hash;
  //     user.save();
  //   });
  // });
  //user = new User(_.pick(req.body, ["email", "password", "name"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user = await user.save();
  res.send(user);
});

// @route POST /api/users/login
// @desc Register user
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ email: "User email not found!" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const payload = { id: user._id, name: user.name, avatar: user.avatar };
    const token = jwt.sign(payload, secretOrKey, { expiresIn: 3600 });
    return res.json({ success: true, token });
  } else {
    return res.status(400).json({ password: "Password incorrect!" });
  }
});

module.exports = router;
