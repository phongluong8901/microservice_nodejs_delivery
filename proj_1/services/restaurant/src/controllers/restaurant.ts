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

// 3. Hàm fetchMyRestaurant (Lấy thông tin nhà hàng của Seller đang đăng nhập)
export const fetchMyRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Kiểm tra nếu chưa đăng nhập thì chặn lại
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    // Tìm nhà hàng trong DB dựa vào ID của chủ sở hữu
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(400).json({
            message: "No Restaurant found",
        });
    }

    // Nếu token cũ chưa có restaurantId, tạo token mới tích hợp thêm restaurantId
    if (!req.user.restaurantId) {
        // Tiến hành tạo (ký) một token JWT mới
        const token = jwt.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id    // Gộp thông tin cũ và bổ sung thêm restaurantId vào payload
            },
        },
            process.env.JWT_SEC as string, {
            expiresIn: "15d", // Cài đặt thời hạn token là 15 ngày
        }
        );

        return res.json({ restaurant, token });
    }

    res.json({ restaurant });
});

// 4. Hàm updateStatusRestaurant (Cập nhật trạng thái đóng/mở cửa)
export const updateStatusRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Kiểm tra đăng nhập
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login",
        })
    }

    // Lấy trạng thái mới (true/false) từ body request
    const { status } = req.body;
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (typeof status !== "boolean") {
        return res.status(400).json({
            message: "Status must be boolean",
        })
    }

    // Tìm nhà hàng theo ownerId và tiến hành cập nhật trạng thái
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

// 5. Hàm updateRestaurant (Cập nhật thông tin chi tiết nhà hàng)
export const updateRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Kiểm tra đăng nhập
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login",
        })
    }

    // Lấy tên mới và mô tả mới từ body request
    const { name, description } = req.body;

    // Tìm nhà hàng của user và cập nhật thông tin
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

// 6. Hàm getNearbyRestaurant (Tìm kiếm nhà hàng lân cận theo vị trí địa lý)
export const getNearbyRestaurant = TryCatch(async (req, res) => {
    // Lấy vĩ độ, kinh độ, bán kính tìm kiếm (mặc định 5000m) và từ khóa từ query params
    const { latitude, longtitude, radius = 5000, search = "" } = req.query;

    // Kiểm tra nếu thiếu tọa độ trung tâm thì báo lỗi
    if (!latitude || !longtitude) {
        return res.status(400).json({
            message: "Latitude and longtitude are required",
        });
    }

    // Khởi tạo đối tượng điều kiện truy vấn: chỉ lấy các nhà hàng đã được xác thực (isVerified: true)
    const query: any = {
        isVerified: true
    }

    // Nếu có truyền từ khóa tìm kiếm tên nhà hàng
    if (search && typeof search === "string") {
        query.name = { $regex: search, $options: "i" }; // Thêm điều kiện regex tìm kiếm gần đúng, không phân biệt hoa thường ("i")
    }

    // Sử dụng MongoDB Aggregation Pipeline để xử lý tính toán không gian phức tạp
    const restaurants = await Restaurant.aggregate([             // Sử dụng MongoDB Aggregation Pipeline để xử lý tính toán không gian phức tạp
        {
            $geoNear: {                                          // Toán tử tìm kiếm vị trí địa lý gần nhất của MongoDB
                near: {
                    type: "Point",
                    coordinates: [Number(longtitude), Number(latitude)], // Tọa độ trung tâm người dùng: [Kinh độ, Vĩ độ]
                },
                distanceField: "distance",                       // Tên trường kết quả trả về chứa khoảng cách tính bằng mét
                maxDistance: Number(radius),                     // Bán kính khoảng cách tối đa giới hạn tìm kiếm
                spherical: true,                                 // Bật chế độ tính toán trên hình cầu trái đất
                query,                                           // Gắn thêm các điều kiện lọc phụ (isVerified và search name) vào thuật toán
            },
        },
        {
            $sort: {
                isOpen: -1,                                      // Sắp xếp ưu tiên: nhà hàng đang mở cửa (isOpen: true <=> 1) sẽ hiển thị lên đầu
                distance: 1,                                     // Sắp xếp thứ hai: khoảng cách từ gần đến xa (tăng dần)
            },
        },
        {
            $addFields: {
                distanceKm: {
                    $round: [{ $divide: ["$distance", 1000] }, 2], // Thêm trường ảo distanceKm: chia khoảng cách mét cho 1000 để ra km, sau đó làm tròn 2 chữ số thập phân
                },
            },
        },
    ]);

    res.json({
        success: true,
        count: restaurants.length,
        restaurants,
    });
});

// 7. Hàm fetchSingleRestaurant (Lấy chi tiết một nhà hàng cụ thể theo ID)
export const fetchSingleRestaurant = TryCatch(async (req, res) => {
    // Truy vấn và trả về toàn bộ thông tin của nhà hàng dựa vào ID được gửi trong tham số URL
    const restaurant = await Restaurant.findById(req.params.id);
    res.json(restaurant);
})

