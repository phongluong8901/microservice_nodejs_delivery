import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { addAddress, deleteAddress, getMyAddress } from '../controllers/address.js';
const router = express.Router();
// Tuyến đường POST: Thêm mới địa chỉ
// - Endpoint: POST /new
// - Middleware: Phải qua `isAuth` trước để xác thực, sau đó mới chạy hàm `addAddress`
router.post("/new", isAuth, addAddress);
// Tuyến đường DELETE: Xóa địa chỉ theo ID
// - Endpoint: DELETE /:id (với :id là tham số động truyền trên URL)
// - Middleware: Phải qua `isAuth` để xác thực quyền sở hữu, sau đó chạy hàm `deleteAddress`
router.delete("/:id", isAuth, deleteAddress);
// Tuyến đường GET: Lấy danh sách toàn bộ địa chỉ của người dùng hiện tại
// - Endpoint: GET /all
// - Middleware: Phải qua `isAuth` để lấy thông tin user, sau đó chạy hàm `getMyAddress`
router.get("/all", isAuth, getMyAddress);
export default router;
