const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
//Load User model
const User = require("../../model/User");

// @route GET api/users/test
// @desc Tests users route
// @access public
router.get("/test", (req, res) => res.json({ msg: "users works" }));

// @route GET api/users/test
// @desc Tests users route
// @access public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email alreay exist" });
    } else {
      var avatarUrl = gravatar.url(req.body.email, {
        s: "100", //size
        r: "pg", //rating
        d: "mn" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatarUrl,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc TLogin users/ returns JWT token
// @access public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "user not found" });
    }

    //check for password
    bcrypt
      .compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          //user Matched
          const payload = { id: user.id, name: user.name }; //created payload

          //Sign Token
          jwt.sign(payload, keys.secert, { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          });
        } else {
          return res.status(400).json({ password: "Password is not correct" });
        }
      })
      .catch(err => {
        console.log("Failed to process");
        return res.status(500).json({ msg: "Internal server error" });
      });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);
module.exports = router;
