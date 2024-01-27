const { where } = require("sequelize");
const Product = require("../models/product");
const { ObjectId } = require("mongodb");

exports.getAllProducts = (req, res, next) => {
  Product.fetchAllProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products, //passing data to ejs file
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log("[Controllers/Admin/getAllProducts] err:", err);
    });
};

// //* controller for get add product
exports.getAddProducts = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log("[Controllers/Admin/postAddProduct]: req.body", req.body);
  const { title, imageUrl, price, description } = req.body;

  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    req.user._id
  );
  product
    .save()
    .then((result) => {
      console.log("[Controllers/Admin/postAddProduct]: Created Product ");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("err in postAddProduct:", err);
    });
};

exports.getEditProduct = (req, res, next) => {
  console.log("[Controllers/Admin/getEditProduct] req.query:", req.query);
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const { productId } = req.params;
  Product.fetchProductDetail(productId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }

      //if product exist
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editMode,
        product,
      });
    })
    .catch((err) => {
      console.log("[Controllers/Admin/getEditProduct] err:", err);
    });
};

exports.postEditProduct = (req, res, next) => {
  console.log("[Controllers/Admin/postEditProduct] req.body:", req.body);
  const { title, imageUrl, price, description } = req.body;

  const productId = req.body.productId;
  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    new ObjectId(productId)
  );
  product
    .save()
    .then((result) => {
      console.log("[Controllers/Admin/postEditProduct] Product Updated.");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("[Controllers/Admin/postEditProduct] err:", err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  console.log("[Controllers/Admin/postDeleteProduct] req.body:", req.body);
  const { productId } = req.body;

  Product.deleteProduct(productId)
    .then((result) => {
      console.log("[Controllers/Admin/postDeleteProduct] Product Deleted.");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("[Controllers/Admin/postDeleteProduct] err:", err);
    });
};