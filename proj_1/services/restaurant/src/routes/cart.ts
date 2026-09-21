import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import {
    addToCart,         // <-- Đã có import hàm addToCart từ controller
    clearCart,
    decrementCartItem,
    fetchMyCart,
    incrementCartItem
} from '../controllers/cart.js';

const router = express.Router();

// Định nghĩa route POST /add: Thêm sản phẩm vào giỏ hàng (cần đăng nhập qua `isAuth`).
router.post("/add", isAuth, addToCart);

// Định nghĩa route GET /all: Lấy danh sách toàn bộ sản phẩm trong giỏ hàng...
router.get("/all", isAuth, fetchMyCart);

// Định nghĩa route PUT /inc: Tăng số lượng...
router.put("/inc", isAuth, incrementCartItem);

// Định nghĩa route PUT /dec: Giảm số lượng...
router.put("/dec", isAuth, decrementCartItem);

// Định nghĩa route DELETE /clear: Xóa sạch giỏ hàng...
router.delete("/clear", isAuth, clearCart);

export default router;