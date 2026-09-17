import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

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
    const { name, description, latitude, longitude, formattedAddress, phone, isVerified } = req.body;
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
        description,
        phone,
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: { // Cấu trúc định vị không gian địa lý GeoJSON chuẩn của MongoDB
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
        isVerified: false,
    });

    return res.status(201).json({
        message: "Restaurant created successfully",
        restaurant,
    });

});

export const fetchMyRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(400).json({
            message: "No Restaurant found",
        });
    }

    if (!req.user.restaurantId) {
        const token = jwt.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id
            },
        },
            process.env.JWT_SEC as string, {
            expiresIn: "15d",
        }
        );

        return res.json({ restaurant, token });
    }

    res.json({ restaurant });
});

export const updateStatusRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login",
        })
    }

    const { status } = req.body;
    if (typeof status !== "boolean") {
        return res.status(400).json({
            message: "Status must be boolean",
        })
    }

    const restaurant = await Restaurant.findOneAndUpdate(
        {
            ownerId: req.user._id
        },
        { isOpen: status },
        { new: true }
    );

    if (!restaurant) {
        return res.status(400).json({
            message: "Restaurant not found",
        });
    }

    res.json({
        message: "Restaurant status Updated",
        restaurant,
    });
});

export const updateRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login",
        })
    }

    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
        { ownerId: req.user._id },
        { name: name, description: description },
        { new: true },
    );

    if (!restaurant) {
        return res.status(400).json({
            message: "Restaurant not found",
        });
    }

    res.json({
        message: "Restaurant status Updated",
        restaurant,
    });

});

