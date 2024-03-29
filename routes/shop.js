const express = require("express");

const router = express.Router();
const shopController = require("../controllers/shop");
const isAuthenticated = require("../middleware/is-authenticated");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProductDetail); //* dynamic route

router.get("/cart", isAuthenticated, shopController.getCart);

router.post("/cart", isAuthenticated, shopController.addToCart);

router.post(
  "/cart-delete-item",
  isAuthenticated,
  shopController.postCartDeleteProduct
);

//* checkout
router.get("/checkout", isAuthenticated, shopController.getCheckout);

//* orders
router.post("/create-order", isAuthenticated, shopController.createOrder);
router.get("/orders", isAuthenticated, shopController.getOrders);

// invoice
router.get("/orders/:orderId", isAuthenticated, shopController.getInvoice);

module.exports = router;
