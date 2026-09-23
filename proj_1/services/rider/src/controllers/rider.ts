import axios from "axios";                                                  // Nhập thư viện axios để gọi HTTP request sang các microservice khác
import getBuffer from "../config/datauri.js";                               // Nhập hàm chuyển đổi file upload sang định dạng buffer/datauri
import { AuthenticatedRequest } from "../middlewares/isAuth.js";            // Nhập kiểu dữ liệu request đã được xác thực (chứa thông tin user)
import TryCatch from "../middlewares/trycatch.js";                            // Nhập wrapper TryCatch để tự động bắt lỗi bất đồng bộ (async/await)
import Rider from "../model/Rider.js";                                      // Nhập Mongoose model Rider

// 1. Controller tạo hồ sơ tài xế (Rider Profile)
export const addRiderProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;                                                    // Lấy thông tin user từ request (đã qua middleware xác thực)

    if (!user) {
        return res.status(401).json({ mesasge: "Unauthorized" });            // Trả về lỗi 401 nếu chưa đăng nhập
    }

    if (user.role !== "rider") {
        return res.status(403).json({ message: "Only riders can create rider profile" }); // Chặn nếu không phải vai trò tài xế
    }

    const file = req.file;                                                    // Lấy file ảnh tải lên từ request (multer middleware)
    if (!file) {
        return res.status(400).json({ message: "Rider Image is required" });   // Báo lỗi nếu thiếu ảnh
    }

    const fileBuffer = getBuffer(file);                                       // Chuyển file thành buffer
    if (!fileBuffer?.content) {
        return res.status(500).json({ message: "Failed to generate image buffer" });
    }

    // Gọi microservice phụ trợ (utils-service) để tải ảnh lên cloud storage
    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content,
    });

    const {
        phoneNumber,
        addharNumber,
        drivingLicenseNumber,
        latitude,
        longitude,
    } = req.body;                                                             // Lấy các thông tin chi tiết từ request body

    if (!phoneNumber || !addharNumber || !drivingLicenseNumber || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: "All field are required" });    // Kiểm tra thiếu trường dữ liệu bắt buộc
    }

    const existingProfile = await Rider.findOne({ userId: user._id });       // Kiểm tra xem tài xế đã có hồ sơ trước đó chưa
    if (existingProfile) {
        return res.status(400).json({ message: "Rider profile already exists" });
    }

    // Tạo bản ghi hồ sơ tài xế mới trong MongoDB
    const riderProfile = await Rider.create({
        userId: user._id,
        picture: uploadResult.url,                                            // Lưu URL ảnh trả về từ service upload
        phoneNumber,
        addharNumber,
        drivingLicenseNumber,
        location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],                 // Lưu tọa độ dạng [Kinh độ, Vĩ độ] cho GeoJSON
        },
        isAvailable: true,
        isVerified: true,
    });

    return res.status(201).json({
        message: "Rider profile created successfully",
        riderProfile,
    });
});

// 2. Controller lấy thông tin hồ sơ của chính tài xế đang đăng nhập
export const fetchMyProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ mesasge: "Unauthorized" });
    }

    const account = await Rider.findOne({ userId: user._id });                // Tìm hồ sơ tài xế dựa vào userId
    res.json(account);
});

// 3. Controller bật/tắt trạng thái hoạt động (online/offline) và cập nhật vị trí mới của tài xế
export const toggleRiderAvailability = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ mesasge: "Unauthorized" });
    if (user.role !== "rider") return res.status(403).json({ message: "Only riders can create rider profile" });

    const { isAvailable, latitude, longitude } = req.body;

    if (typeof isAvailable !== "boolean") {
        return res.status(400).json({ message: "isAvailable must be boolean" });
    }
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: "location is required" });
    }

    const rider = await Rider.findOne({ userId: user._id });
    if (!rider) return res.status(404).json({ message: "Rider profile not found" });

    if (isAvailable && !rider.isVerified) {
        return res.status(400).json({ message: "Rider is not verified" });      // Không cho phép online nếu tài khoản chưa được xác thực
    }

    rider.isAvailable = isAvailable;                                          // Cập nhật trạng thái sẵn sàng
    rider.location = {
        type: "Point",
        coordinates: [longitude, latitude],                                   // Cập nhật tọa độ vị trí hiện tại
    };
    rider.lastActiveAt = new Date();                                          // Cập nhật thời gian hoạt động cuối
    await rider.save();

    res.json({
        message: isAvailable ? "Rider so now online" : "Rider is now offline",
        rider,
    });
});

// 4. Controller chấp nhận đơn hàng
export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;
    const { orderId } = req.params;                                           // Lấy mã đơn hàng từ URL parameters

    if (!riderUserId) return res.status(400).json({ message: "Please Login" });

    const rider = await Rider.findOne({ userId: riderUserId, isAvailable: true });
    if (!rider) return res.status(404).json({ message: "rider not found" });

    try {
        // Gọi HTTP POST sang restaurant-service để gán đơn hàng cho tài xế này
        const { data } = await axios.post(`${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`, {
            orderId,
            riderId: rider._id.toString(),
            riderUserId: rider.userId,
            riderName: rider.picture,
            riderPhone: rider.phoneNumber,
        }, {
            headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY },    // Gửi kèm khóa nội bộ để xác thực giữa các service
        });

        if (data.success) {
            // Sau khi nhận đơn thành công, chuyển trạng thái tài xế thành bận (isAvailable: false) để không nhận đơn khác nữa
            await Rider.findOneAndUpdate(
                { userId: riderUserId, isAvailable: true },
                { isAvailable: false },
                { new: true }
            );

            res.json({ message: "Order accepted" });
        }
    } catch (error: any) {
        console.error("ACCEPT ORDER ERROR:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || error.response?.data?.error || "Order already taken";
        return res.status(400).json({ message: errorMsg });
    }
});

// 5. Controller lấy thông tin đơn hàng hiện tại mà tài xế đang thực hiện
export const fetchMyCurrentOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;
    if (!riderUserId) return res.status(400).json({ message: "Please Login" });

    const rider = await Rider.findOne({ userId: riderUserId, isVerified: true });
    if (!rider) return res.status(404).json({ message: "rider not found" });

    try {
        // Gọi sang restaurant-service để lấy đơn hàng đang xử lý dựa theo riderId
        const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id}`, {
            headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY },
        });

        res.json({ order: data || null });
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || "Internal server error";
        res.status(500).json({ message: errorMsg });
    }
});

// 6. Controller cập nhật trạng thái đơn hàng (ví dụ: đã lấy hàng, đã giao hàng)
export const updateOrderStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Please Login" });

    const rider = await Rider.findOne({ userId: userId });
    if (!rider) return res.status(404).json({ message: "Please Login" });

    const { orderId } = req.params;

    try {
        // Gọi API sang restaurant-service để tiến hành cập nhật trạng thái đơn hàng
        const { data } = await axios.put(`${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`, {
            orderId
        }, {
            headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY }
        });

        res.json({ message: data.message });
    } catch (error) {
        res.status(500).json({ message: "internal sever error" });
    }
});