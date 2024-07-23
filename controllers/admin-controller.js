const productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const collections = require("../config/collections");
const userHelpers = require("../helpers/user-helpers");
const { orders } = require("./user-controller");

module.exports.viewproduct = function (req, res, next) {
  productHelpers
    .getAllProducts()
    .then((products) => {
      res.render("admin/view-products", { admin: true, products });
    })
    .catch(next); // Handle errors
};

module.exports.addproduct = function (req, res) {
  res.render("admin/add-product", { admin: true });
};

module.exports.addproductpost = function (req, res, next) {
  console.log("Received POST request to add a product");
  console.log("Request body:", req.body);

  if (req.files) {
    console.log("Request files:", req.files);
  } else {
    console.log("No files found in the request");
  }

  productHelpers
    .addProduct(req.body)
    .then((result) => {
      console.log("Product added successfully with ID:", result);
      let Image = req.files.image;
      console.log("Image file:", Image);

      Image.mv("./public/product-images/" + result + ".jpg", (err) => {
        if (err) {
          console.log("Error moving image:", err);
          next(err); // Handle errors
        } else {
          console.log("Image uploaded successfully");
          res.redirect("/admin");
        }
      });
    })
    .catch((err) => {
      console.log("Error in addProduct:", err);
      next(err); // Handle errors
    });
};

module.exports.deleteproduct = (req, res, next) => {
  let proId = req.params.id;
  console.log("Deleting product with ID: " + proId);
  productHelpers
    .deleteProduct(proId)
    .then(() => {
      res.redirect("/admin");
    })
    .catch(next); // Handle errors
};

module.exports.editproduct = async (req, res, next) => {
  try {
    let product = await productHelpers.getProductDetails(req.params.id);
    console.log(product);
    res.render("admin/edit-product", { admin: true, product });
  } catch (err) {
    next(err); // Handle errors
  }
};

module.exports.editproductpost = async (req, res, next) => {
  let id = req.params.id;
  try {
    await productHelpers.updateProduct(id, req.body);
    if (req.files && req.files.image) {
      let Image = req.files.image;
      Image.mv("./public/product-images/" + id + ".jpg", (err) => {
        if (err) {
          console.log(err);
          next(err); // Handle errors
        }
      });
    }
    res.redirect("/admin");
  } catch (err) {
    next(err); // Handle errors
  }
};

module.exports.adminloginpage = (req, res) => {
  if (req.session.admin && req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", { loginErr: req.session.adminLoginErr });
    req.session.adminLoginErr = false;
  }
};

module.exports.adminloginpost = (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      console.log("set ayi");
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect("/admin/admin-login");
    }
  });
};
module.exports.adminlogout = (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin/admin-logout");
};
module.exports.viewallorders = async (req, res, next) => {
  try {
    let orders = await adminHelpers.getAllOrders();
    res.render("admin/view-orders", { admin: true, orders });
  } catch (err) {
    next(err);
  }
};
module.exports.shiporder = (req, res, next) => {
  console.log('hai')
  try {
    userHelpers.changeStatus(req.params.id).then((response) => {
      res.json({success:true})
    });
  } catch (err) {
    next(err);
  }
};
