var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
const productHelpers = require("../helpers/product-helpers");
const { viewproduct, addproduct, addproductpost } = require("../controllers/asmin-controller");
const { deleteproduct, editproduct, editproductpost } = require("../controllers/admin-controller");

/* GET users listing. */
router.get("/",viewproduct );
router.get("/add-product",addproduct );
router.post("/add-product",addproductpost );
router.get("/delete-product/:id",deleteproduct);
router.get("/edit-product/:id",editproduct);
router.post("/edit-product/:id",editproductpost );

module.exports = router;
