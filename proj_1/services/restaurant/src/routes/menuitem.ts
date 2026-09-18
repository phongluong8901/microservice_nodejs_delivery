import express from 'express';
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { addMenuItem, deleteMenuItem, getAllItems, toggleMenuItemAvailability } from '../controllers/menuitem.js';
import uploadFile from '../middlewares/multer.js';

// Khởi tạo một đối tượng router của Express
const router = express.Router();

// Tuyến đường thêm món ăn mới (yêu cầu đăng nhập, là seller, tải ảnh lên rồi mới gọi controller addMenuItem)
router.post("/new", isAuth, isSeller, uploadFile, addMenuItem);

// Tuyến đường lấy tất cả món ăn của một nhà hàng (chỉ cần đăng nhập)
router.get("/all/:id", isAuth, getAllItems);

// Tuyến đường xóa món ăn (yêu cầu đăng nhập và là seller)
router.delete("/:itemId", isAuth, isSeller, deleteMenuItem);

// Tuyến đường thay đổi trạng thái món ăn (yêu cầu đăng nhập và là seller)
router.put("/status/:itemId", isAuth, isSeller, toggleMenuItemAvailability);


export default router;