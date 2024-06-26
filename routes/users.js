var express = require("express");
const productHelpers = require("../helpers/product-helpers");
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");
const {
  homepage,
  loginpage,
  signuppage,
  signuppost,
  loginpost,
  logout,
  cart,
} = require("../controllers/user-controller");
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", homepage);

router.get("/login", loginpage);
router.get("/signup", signuppage);
router.post("/signup", signuppost);
router.post("/login", loginpost);
router.get("/logout", logout);
router.get("/cart", verifyLogin, cart);

module.exports = router;
