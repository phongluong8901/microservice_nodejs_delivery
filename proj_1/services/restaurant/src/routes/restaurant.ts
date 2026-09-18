import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant, fetchMyRestaurant, fetchSingleRestaurant, getNearbyRestaurant, updateRestaurant, updateStatusRestaurant } from "../controllers/restaurant.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);   // Tuyến đường POST /new: Thêm mới nhà hàng (yêu cầu đăng nhập, là seller, tải file ảnh lên rồi chạy controller addRestaurant)
router.get("/my", isAuth, isSeller, fetchMyRestaurant);           // Tuyến đường GET /my: Lấy thông tin nhà hàng của chính seller đang đăng nhập (yêu cầu đăng nhập & quyền seller)
router.put("/status", isAuth, isSeller, updateStatusRestaurant);  // Tuyến đường PUT /status: Cập nhật trạng thái đóng/mở cửa của nhà hàng (yêu cầu đăng nhập & quyền seller)
router.put("/edit", isAuth, isSeller, updateRestaurant);          // Tuyến đường PUT /edit: Cập nhật thông tin chi tiết tên/mô tả nhà hàng (yêu cầu đăng nhập & quyền seller)
router.get("/all", isAuth, getNearbyRestaurant);                  // Tuyến đường GET /all: Tìm kiếm danh sách nhà hàng lân cận theo tọa độ vị trí (yêu cầu đăng nhập)
router.get("/:id", isAuth, fetchSingleRestaurant);                // Tuyến đường GET /:id: Lấy thông tin chi tiết một nhà hàng dựa vào ID truyền trên URL params (yêu cầu đăng nhập)

export default router;