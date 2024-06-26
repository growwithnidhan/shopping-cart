var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
const productHelpers = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});
router.get("/add-product", function (req, res) {
  res.render("admin/add-product", { admin: true });
});
router.post("/add-product", function (req, res) {
  productHelper.addProduct(req.body, (result) => {
    console.log(result);
    let Image = req.files.image;
    Image.mv("./public/product-images/" + result + ".jpg", (err, done) => {
      if (err) {
        console.log(err);
      } else {
        res.render("admin/add-product");
      }
    });
  });
});
router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  console.log("hello" + proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin");
  });
});
router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", { product });
});
router.post("/edit-product/:id", async (req, res) => {
  let id = req.params.id;
  const updateResponse = await productHelpers.updateProduct(id, req.body);
  if (req.files && req.files.image) {
    let Image = req.files.image;
    Image.mv("./public/product-images/" + id + ".jpg", (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
  res.redirect("/admin");
});

module.exports = router;
