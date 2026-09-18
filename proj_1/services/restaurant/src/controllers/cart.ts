import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Cart from "../models/Cart.js";

// Controller xử lý thêm sản phẩm vào giỏ hàng
export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    // Lấy ID của người dùng từ request object
    const userId = req.user._id;

    // Lấy ID nhà hàng và ID món ăn từ request body gửi lên từ client
    const { restaurantId, itemId } = req.body;

    // Kiểm tra xem restaurantId và itemId có phải là định dạng ObjectId hợp lệ của MongoDB hay không
    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message: "Invalid restaurant and item id",
        });
    }

    // Kiểm tra xem giỏ hàng hiện tại của user có đang chứa món ăn từ một nhà hàng KHÁC hay không 
    // (Logic ứng dụng: Mỗi lần chỉ được đặt hàng từ 1 nhà hàng duy nhất)
    const cartFromDifferentRestaurant = await Cart.findOne({
        userId,
        restaurantId: {
            $ne: restaurantId   // $ne nghĩa là Not Equal (khác với restaurantId hiện tại)
        }
    });

    // Nếu phát hiện có sản phẩm từ nhà hàng khác, chặn lại và yêu cầu xóa giỏ hàng trước
    if (cartFromDifferentRestaurant) {
        return res.status(400).json({
            message: "you can order from only one restaurant at a time. Please clear your cart first to add items from this restaurant "
        });
    }

    // Tìm và cập nhật sản phẩm trong giỏ hàng (nếu chưa có thì tự động tạo mới bản ghi)
    const cartItem = await Cart.findOneAndUpdate({
        userId,
        restaurantId,
        itemId
    },
        {
            $inc: { quantity: 1 }, // Tăng số lượng lên 1 nếu sản phẩm đã tồn tại trong giỏ
            $setOnInsert: { userId, restaurantId, itemId } // Các giá trị mặc định khi tạo mới bản ghi (insert)
        },
        { upsert: true, new: true, setDefaultOnInsert: true }
        // upsert: true (tạo mới nếu chưa có), new: true (trả về dữ liệu mới sau khi update)
    );

    // Trả về phản hồi thành công kèm theo thông tin sản phẩm trong giỏ
    return res.json({
        message: "item added to cart",
        cart: cartItem,
    })
});

// Controller lấy toàn bộ danh sách sản phẩm trong giỏ hàng của người dùng
export const fetchMyCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    const userId = req.user._id;

    // Tìm tất cả các mục giỏ hàng thuộc về user này, đồng thời populate dữ liệu chi tiết của sản phẩm và nhà hàng
    // Mongoose sẽ tự động thực hiện một thao tác tương tự như lệnh JOIN trong cơ sở dữ liệu quan hệ (SQL):
    // Nó lấy itemId (item999), đi sang collection Items để kéo toàn bộ thông tin chi tiết của món ăn đó về (tên món, hình ảnh, giá tiền, mô tả,...).
    // Nó lấy restaurantId (rest888), đi sang collection Restaurants để kéo toàn bộ thông tin chi tiết của nhà hàng đó về (tên nhà hàng, địa chỉ, số điện thoại,...).
    const cartItems = await Cart.find({ userId })
        .populate("itemId")
        .populate("restaurantId");

    let subtotal = 0;
    let cartLength = 0;

    // Duyệt qua từng mục trong giỏ hàng để tính toán tổng tiền và số lượng
    for (const cartItem of cartItems) {
        const item: any = cartItem.itemId;

        subtotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity;
    }

    return res.json({
        success: true,
        cartLength,
        subtotal,
        cart: cartItems,
    });
});

// Controller tăng số lượng của một sản phẩm trong giỏ hàng
export const incrementCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Lấy userId an toàn bằng optional chaining
    const userId = req.user?._id;

    const { itemId } = req.body;

    // Kiểm tra dữ liệu đầu vào hợp lệ
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }

    // Tìm kiếm và tăng số lượng sản phẩm lên 1 đơn vị
    const cartItem = await Cart.findOneAndUpdate(
        { userId, itemId },
        {
            $inc: { quantity: 1 },
        },
        { new: true }
    );

    if (!cartItem) {
        return res.status(400).json({
            message: "Item not found",
        });
    }

    res.json({
        message: "Quantity increased",
        cartItem,
    })
});

// Controller giảm số lượng của một sản phẩm trong giỏ hàng
export const decrementCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }

    // Tìm sản phẩm trong giỏ hàng
    const cartItem = await Cart.findOne(
        { userId, itemId }
    );

    if (!cartItem) {
        return res.status(400).json({
            message: "Item not found",
        });
    }

    // Nếu số lượng hiện tại bằng 1, khi giảm sẽ tiến hành xóa luôn sản phẩm khỏi giỏ hàng
    if (cartItem.quantity === 1) {
        await Cart.deleteOne({ userId, itemId })

        return res.json({
            message: "Item remove from cart"
        })
    }

    // Nếu số lượng lớn hơn 1, trừ đi 1 đơn vị và lưu lại vào database
    cartItem.quantity -= 1;
    await cartItem.save();

    res.json({
        message: "Quantity decreased",
        cartItem,
    })
});

// Controller xóa sạch toàn bộ giỏ hàng của người dùng
export const clearCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    // Xóa tất cả các bản ghi giỏ hàng có chứa userId này
    await Cart.deleteMany({ userId });
    res.json({
        message: "Cart cleared successfully"
    })
})