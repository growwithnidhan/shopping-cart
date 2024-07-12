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
  addtocart,
  changequantity,
  removeCartitem,
  placeorder,
  placeorderpost,
  orderplaced,
  orders,
  vieworderproducts,
  verifypayment
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
router.get('/add-to-cart/:id',verifyLogin,addtocart);
router.post('/change-product-quantity',changequantity);
router.post('/remove-cart-product',removeCartitem)
router.get('/place-order',verifyLogin,placeorder)
router.post('/place-order',placeorderpost)
router.get('/order-placed',orderplaced)
router.get('/orders',verifyLogin,orders)
router.get('/view-order-products/:id',vieworderproducts)
router.post('/verify-payment',verifypayment)



module.exports = router;
