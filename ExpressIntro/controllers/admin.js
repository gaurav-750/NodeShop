const { where } = require("sequelize");
const Product = require("../models/product");

exports.getAllProducts = (req, res, next) => {
  Product.findAll()
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

//* controller for get add product
exports.getAddProducts = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log("[Controllers/Admin/postAddProduct]: ", req.body);
  const { title, imageUrl, price, description } = req.body;

  Product.create({
    title,
    price,
    imageUrl,
    description,
  })
    .then((result) => {
      // console.log("result in postAddProduct:", result);
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
  Product.findByPk(productId)
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
  Product.update(
    {
      title,
      price,
      imageUrl,
      description,
    },
    {
      //where clause
      where: {
        id: productId,
      },
    }
  )
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

  Product.destroy({
    where: {
      id: productId,
    },
  })
    .then((result) => {
      console.log("[Controllers/Admin/postDeleteProduct] Product Deleted.");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("[Controllers/Admin/postDeleteProduct] err:", err);
    });
};
