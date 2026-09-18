import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import getBuffer from "../config/datauri.js";
import MenuItems from "../models/MenuItems.js";

// 2. Hàm addMenuItem (Thêm mới món ăn)
export const addMenuItem = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        // Kiểm tra nếu chưa đăng nhập
        if (!req.user) {
            return res.status(401).json({
                message: "Please login",
            });
        }

        // Tìm nhà hàng dựa vào ID của user đang đăng nhập
        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
        if (!restaurant) {
            return res.status(404).json({
                message: "No Restaurant found",
            });
        }

        // Lấy tên, mô tả và giá tiền từ body request
        const { name, description, price } = req.body;
        if (!name || !price) {
            return res.status(400).json({
                message: "Name and price are required",
            });
        }

        // Lấy file ảnh được gửi lên thông qua middleware multer
        const file = req.file
        if (!file) {
            return res.status(400).json({
                message: "Please give image",
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

        const item = await MenuItems.create({
            name,
            description,
            price,
            restaurantId: restaurant._id,
            image: uploadResult.url,
            isAvailable: true,
        });

        res.json({
            message: "Item Added Successfully",
            item
        });

    }
);

// 3. Hàm getAllItems (Lấy danh sách tất cả món ăn theo nhà hàng)
export const getAllItems = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "Id is required"
        });
    }

    // Tìm tất cả các món ăn trong MongoDB có restaurantId trùng khớp với ID truyền vào
    const items = await MenuItems.find({
        restaurantId: id
    });

    res.json(items);
});

// 4. Hàm deleteMenuItem (Xóa món ăn)
export const deleteMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please login",
        });
    }

    // Lấy ID của món ăn từ URL params
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required"
        });
    }

    // Tìm kiếm món ăn cần xóa theo ID
    const item = await MenuItems.findById(itemId)

    if (!item) {
        return res.status(404).json({
            message: "No item found"
        });
    }

    // Kiểm tra xem nhà hàng sở hữu món ăn này có phải thuộc quyền sở hữu của user đang đăng nhập không
    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    });

    // Nếu không phải chủ nhà hàng, chặn lại không cho xóa
    if (!restaurant) {
        return res.status(404).json({
            message: "No Restaurant found"
        });
    }

    // Tiến hành xóa bản ghi món ăn khỏi MongoDB
    await item.deleteOne()

    res.json({
        message: "menu item deleted successfully",
    });
});

// 5. Hàm toggleMenuItemAvailability (Bật/tắt trạng thái sẵn sàng của món ăn)
export const toggleMenuItemAvailability = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please login",
        });
    }

    // Lấy ID món ăn từ URL params
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required"
        });
    }

    // Tìm kiếm món ăn cần thao tác theo ID
    const item = await MenuItems.findById(itemId)

    if (!item) {
        return res.status(404).json({
            message: "No item found"
        });
    }

    // Kiểm tra quyền sở hữu nhà hàng của user hiện tại
    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    });
    if (!restaurant) {
        return res.status(404).json({
            message: "No Restaurant found"
        });
    }

    // Đảo ngược trạng thái hiện tại (Đang bán <-> Tạm ngưng)
    item.isAvailable = !item.isAvailable;
    // Lưu lại thay đổi vào cơ sở dữ liệu
    await item.save();

    res.json({
        message: `Item Marked as  ${item.isAvailable ? "available" : "unavailable"}`,
        item
    });
})
