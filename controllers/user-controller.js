module.exports.homepage = function (req, res, next) {
  let user = req.session.user;

  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { admin: false, products, user });
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
module.exports.cart = (req, res) => {
  res.render("user/cart");
};
