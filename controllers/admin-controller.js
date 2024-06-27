module.exports.viewproduct = function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
};

module.exports.addproduct = function (req, res) {
  res.render("admin/add-product", { admin: true });
};

module.exports.addproductpost = function (req, res) {
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
};

module.exports.deleteproduct = (req, res) => {
  let proId = req.params.id;
  console.log("hello" + proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin");
  });
};

module.exports.editproduct = async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", { product });
};

module.exports.editproductpost = async (req, res) => {
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
};
