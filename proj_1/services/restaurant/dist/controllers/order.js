import TryCatch from "../middlewares/trycatch.js"; // Nhập middleware bọc lỗi tự động (try-catch wrapper) để bắt lỗi bất đồng bộ
import Address from "../models/Address.js"; // Nhập Model Address để truy vấn địa chỉ giao hàng
import Cart from "../models/Cart.js"; // Nhập Model Cart để lấy thông tin giỏ hàng của người dùng
import Order from "../models/Order.js"; // Nhập Model Order để tạo và quản lý đơn hàng
import Restaurant from "../models/Restaurant.js"; // Nhập Model Restaurant và interface IRestaurant để kiểm tra thông tin nhà hàng
export const createOrder = TryCatch(async (req, res) => {
    const user = req.user; // Lấy thông tin user từ request (được gán qua middleware xác thực)
    if (!user) { // Nếu chưa đăng nhập hoặc không tìm thấy user
        return res.status(401).json({
            message: "Unauthorized", // Trả về lỗi 401 Không có quyền truy cập
        });
    }
    const { paymentMethod, addressId } = req.body; // Lấy phương thức thanh toán, ID địa chỉ và khoảng cách từ body request
    // const distance = 0;
    if (!addressId) { // Kiểm tra nếu thiếu addressId
        return res.status(400).json({
            message: "Adress is required", // Trả về lỗi thiếu địa chỉ (⚠️ Lưu ý chính tả: `Adress` -> `Address`)
        });
    }
    const address = await Address.findOne({
        userId: user._id,
    });
    if (!address) { // Nếu không tìm thấy địa chỉ
        return res.status(404).json({
            message: "Addres Not Found", // Trả về lỗi không tìm thấy địa chỉ
        });
    }
    const getDistanceKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return +(R * c).toFixed(2);
    };
    const cartItems = await Cart.find({ userId: user._id }) // Lấy toàn bộ sản phẩm trong giỏ hàng của user
        .populate("itemId") // Populate (kết nối) thông tin chi tiết của món ăn
        .populate("restaurantId"); // Populate thông tin nhà hàng
    if (cartItems.length === 0) { // Nếu giỏ hàng trống
        return res.status(400).json({
            message: "Cart is empty"
        });
    }
    const firstCartItem = cartItems[0]; // Lấy sản phẩm đầu tiên trong giỏ hàng để kiểm tra nhà hàng
    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(400).json({
            message: "Invalid Cart Data", // Lỗi dữ liệu giỏ hàng không hợp lệ
        });
    }
    const restaurantId = firstCartItem.restaurantId._id; // Lấy ID của nhà hàng từ giỏ hàng
    const restaurant = await Restaurant.findById(restaurantId); // Tìm thông tin chi tiết nhà hàng trong DB
    if (!restaurant) {
        return res.status(404).json({
            message: "No restaurant with this id" // Lỗi không tìm thấy nhà hàng
        });
    }
    if (!restaurant.isOpen) { // Kiểm tra xem nhà hàng hiện có đang mở cửa không
        return res.status(404).json({
            message: "Sorry this restaurant is closed for now" // Lỗi nhà hàng đã đóng cửa
        });
    }
    const distance = getDistanceKm(address.location.coordinates[1], address.location.coordinates[0], restaurant.autoLocation.coordinates[1], restaurant.autoLocation.coordinates[0]);
    let subtotal = 0; // Biến tính tổng tiền hàng tạm tính
    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("Invalid cart item");
        }
        const itemTotal = item.price * cart.quantity; // Tính tổng tiền cho từng món (giá * số lượng)
        subtotal += itemTotal; // Cộng dồn vào tổng tiền tạm tính
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity,
        };
    });
    const deliveryFee = subtotal < 250 ? 49 : 0; // Tính phí ship: dưới 250 thì phí 49, ngược lại miễn phí (0)
    const platformFee = 7; // Phí dịch vụ cố định của nền tảng
    const totalAmount = subtotal + deliveryFee + platformFee; // Tổng tiền thanh toán cuối cùng
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Thời gian hết hạn đơn hàng (15 phút tính từ hiện tại nếu chưa thanh toán)
    const [longitude, latitude] = address.location.coordinates; // Lấy tọa độ kinh độ và vĩ độ từ địa chỉ giao hàng
    const riderAmount = Math.ceil(distance) * 17; // Tính tiền công cho shipper dựa trên khoảng cách (làm tròn lên nhân với 17 đơn vị tiền)
    const order = await Order.create({
        userId: user._id.toString(),
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItems,
        subtotal,
        deliveryFee,
        platformFee,
        totalAmount,
        addressId: address._id.toString(),
        deliveryAddress: {
            fromattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude,
            longitude,
        },
        status: "placed",
        paymentMethod,
        paymentStatus: "pending",
        expiresAt,
    });
    await Cart.deleteMany({ userId: user._id }); // Xóa sạch giỏ hàng của người dùng sau khi đặt hàng thành công
    res.json({
        message: "Order created Successfully", // Trả về thông báo thành công kèm thông tin ID đơn hàng và tổng tiền
        orderId: order._id.toString(),
        amount: totalAmount,
    });
});
export const fetchOrderForPayment = TryCatch(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) { // Kiểm tra khóa bảo mật nội bộ để đảm bảo request xuất phát từ service nội bộ tin cậy
        return res.status(403).json({
            message: "Forbidden", // Trả về lỗi 403 Nếu không có quyền
        });
    }
    const order = await Order.findById(req.params.id); // Tìm đơn hàng theo ID truyền trên params URL
    if (!order) {
        return res.status(404).json({
            message: "Order not found", // Lỗi không tìm thấy đơn hàng
        });
    }
    if (order.paymentStatus !== "pending") { // Kiểm tra nếu đơn hàng đã được thanh toán trước đó rồi
        return res.status(400).json({
            message: "Order is already paid", // Lỗi đơn hàng đã thanh toán
        });
    }
    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "INR",
    });
});
