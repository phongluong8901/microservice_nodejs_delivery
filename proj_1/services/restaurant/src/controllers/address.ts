import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";

// 1. CONTROLLER THÊM ĐỊA CHỈ MỚI
export const addAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Lấy thông tin user từ request
    const user = req.user

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    // Lấy các trường dữ liệu cần thiết từ request body do client gửi lên
    const { mobile, formattedAddress, latitude, longitude } = req.body;

    if (!mobile
        || !formattedAddress
        || latitude === undefined
        || longitude === undefined) {
        return res.status(400).json({
            message: "Please give all fields.",
        });
    }

    // Tạo bản ghi địa chỉ mới trong cơ sở dữ liệu MongoDB
    const newAddress = await Address.create({
        userId: user._id.toString(),
        mobile,
        formattedAddress,
        location: {
            type: "Point",  // Định dạng kiểu không gian GeoJSON
            coordinates: [Number(longitude), Number(latitude)], // Lưu tọa độ theo định dạng [kinh độ, vĩ độ]
        },
    });

    return res.status(201).json({
        message: "Address added successfully",
        address: newAddress,
    });
});

// 2. CONTROLLER XÓA ĐỊA CHỈ
export const deleteAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    // Lấy ID của địa chỉ cần xóa từ đường dẫn URL
    const { id } = req.params

    if (!id) {
        return res.status(400).json({
            message: "id is required",
        });
    }

    // Tìm kiếm địa chỉ dựa vào ID đồng thời kiểm tra xem địa chỉ đó có đúng thuộc về user hiện tại không (bảo mật)
    const address = await Address.findOne({
        _id: id,
        userId: user._id.toString(),
    });

    if (!address) {
        return res.status(404).json({
            message: "Address not found",
        });
    }

    // Thực hiện xóa bản ghi địa chỉ khỏi database
    await address.deleteOne();

    res.json({
        message: "Address deleted Successfully"
    });

});

// 3. CONTROLLER LẤY DANH SÁCH ĐỊA CHỈ CỦA TÔI
export const getMyAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    // Tìm tất cả các địa chỉ thuộc sở hữu của user hiện tại và sắp xếp theo thứ tự mới nhất lên đầu (createdAt giảm dần)
    const addresses = await Address.find({
        userId: user._id.toString(),
    }).sort({ createdAt: -1 });

    res.json({ addresses });
});