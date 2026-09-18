import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { addToCart, clearCart, decrementCartItem, fetchMyCart, incrementCartItem } from '../controllers/cart.js';

const router = express.Router();

// Định nghĩa route GET /all: Lấy danh sách toàn bộ sản phẩm trong giỏ hàng của tôi(cần đăng nhập qua`isAuth`).
router.get("/all", isAuth, fetchMyCart);

// Định nghĩa route PUT /inc: Tăng số lượng của một sản phẩm trong giỏ hàng (cần đăng nhập qua `isAuth`).
router.put("/inc", isAuth, incrementCartItem);

// Định nghĩa route PUT /dec: Giảm số lượng của một sản phẩm trong giỏ hàng (cần đăng nhập qua `isAuth`).
router.put("/dec", isAuth, decrementCartItem);

// Định nghĩa route DELETE /clear: Xóa sạch toàn bộ giỏ hàng (cần đăng nhập qua `isAuth`).
router.delete("/clear", isAuth, clearCart);

export default router;