const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");

//Load User model
const User = require("../../model/User");

// @route GET api/users/test
// @desc Tests users route
// @access public
router.get("/test", (req, res) => res.json({ msg: "users works" }));

// @route GET api/users/test
// @desc Tests users route
// @access public
router.get("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email alreay exist" });
    } else {
      var unsecureUrl = gravatar.url(
        "emerleite@gmail.com",
        { s: "100", r: "pg", d: "nm" },
        false
      );
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: unsecureUrl,
        password: req.body.password
      });
    }
  });
});
module.exports = router;
