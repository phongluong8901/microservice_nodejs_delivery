import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";

export const addRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Lấy thông tin user từ request
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        })
    }

    // Kiểm tra trong database xem user này đã đăng ký/sở hữu nhà hàng nào trước đó chưa
    const existingRestaurant = await Restaurant.findOne({
        ownerId: user?._id,
    });

    if (existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant",
        });
    }

    // Lấy các trường thông tin dạng text từ phần body của request gửi lên
    const { name, desciption, latitude, longitude, formattedAddress, phone } = req.body;
    if (!name || !latitude || !longitude) {
        return res.status(400).json({
            message: "Please give all details",
        });
    }

    // Lấy thông tin file ảnh từ `req.file`
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            message: "Please provide an image",
        });
    }

    // Gọi hàm helper `getBuffer` để chuyển đổi file nhị phân thô thành chuỗi Base64 Data URI
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to create file buffer",
        });
    }

    // Giao tiếp liên dịch vụ (Inter-service communication): 
    // Gửi một HTTP POST request chứa buffer của ảnh sang Utils Service (chạy ở cổng 5002) để tiến hành upload lên Cloudinary
    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content,

    });

    // Sau khi upload ảnh thành công và nhận lại đường dẫn URL, tiến hành tạo mới bản ghi nhà hàng vào MongoDB
    const restaurant = await Restaurant.create({
        name,
        desciption,
        phone,
        image: uploadResult.utl,
        ownerId: user._id,
        autoLocation: { // Cấu trúc định vị không gian địa lý GeoJSON chuẩn của MongoDB
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
    });

    return res.status(201).json({
        message: "Restaurant created successfully",
        restaurant,
    });

})