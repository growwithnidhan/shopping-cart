var express = require("express");
var router = express.Router();
const {
  viewproduct,
  addproduct,
  addproductpost,
  deleteproduct,
  editproduct,
  editproductpost,
  adminloginpage,
  adminloginpost,
} = require("../controllers/admin-controller");



router.get("/admin-login", adminloginpage);
router.post("/login", adminloginpost);


router.use((req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/admin-login");
  }
});


router.get("/", viewproduct);
router.get("/add-product", addproduct);
router.post("/add-product", addproductpost);
router.get("/delete-product/:id", deleteproduct);
router.get("/edit-product/:id", editproduct);
router.post("/edit-product/:id", editproductpost);

module.exports = router;
