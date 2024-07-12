const { response } = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const paymentHelpers = require("../helpers/payment-helpers")

module.exports.homepage = async function (req, res, next) {
  let user = req.session.user;
  let cartcount = null;
  if (req.session.user) {
    cartcount = await userHelpers.getCartcount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", {
      admin: false,
      products,
      user,
      cartcount,
    });
  });
};

module.exports.loginpage = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
};

module.exports.signuppage = (req, res) => {
  res.render("user/signup");
};

module.exports.signuppost = (req, res) => {
  console.log(req.body);
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
};

module.exports.loginpost = (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log(response.status);
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
};

module.exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

module.exports.cart = async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let totalvalue = await userHelpers.getTotalAmount(req.session.user._id);
  res.render("user/cart", { products, user: req.session.user, totalvalue });
};
module.exports.addtocart = (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
};
module.exports.changequantity = (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.session.user._id);

    res.json(response);
  });
};
module.exports.removeCartitem = (req, res, next) => {
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
};
module.exports.placeorder = async (req, res, next) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);

  res.render("user/place-order", { total, user: req.session.user });
};
module.exports.placeorderpost = async (req, res, next) => {
  try {
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    let products = await userHelpers.getCartList(req.body.userId);
    
    let orderId = await userHelpers.placeOrder(req.body, products, totalPrice);

    if (req.body['payment-method'] === 'COD') {
      res.json({ COD_success: true, order: orderId });
    } else {
      paymentHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
      }).catch((err) => {
        res.status(500).json({ error: "Error generating Razorpay order" });
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Error placing order" });
  }
};


module.exports.orderplaced = (req, res, next) => {
  res.render("user/order-placed", { user: req.session.user });
};
module.exports.orders = async (req, res, next) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id);

  res.render("user/orders", { orders, user: req.session.user });
};
module.exports.vieworderproducts = async (req, res, next) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render("user/view-order-products", { products, user: req.session.user });
};
module.exports.verifypayment=(req,res,next)=>{
  console.log(req.body)
  paymentHelpers.verifyPayment(req.body).then(()=>{
    
  })
}
