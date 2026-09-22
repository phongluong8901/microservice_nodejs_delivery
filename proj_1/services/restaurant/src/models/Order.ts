import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    userId: string;
    restaurantId: string;
    restaurantName: string;
    riderId?: string | null;    // ID của shipper
    riderPhone: number | null;  // Số điện thoại của shipper
    riderName: string | null;
    distance: number;
    riderAmount: number;

    items: {
        itemId: string;
        name: string;
        price: number;
        quantity: number;   // Số lượng đặt
    }[];

    subtotal: number;   // Tổng tiền các món ăn (chưa tính phí)
    deliveryFee: number; // Phí vận chuyển
    platformFee: number; // Phí nền tảng
    totalAmount: number; // Tổng số tiền thanh toán cuối cùng

    addressId: string;  // ID địa chỉ giao hàng của người dùng
    deliveryAddress: {  // Chi tiết thông tin địa chỉ giao hàng
        formattedAddress: string;   // Địa chỉ đầy đủ dạng chữ
        mobile: number;             // Số điện thoại người nhận
        latitude: number;           // Kinh độ
        longitude: number;          // Vĩ độ
    };

    // Trạng thái hiện tại của đơn hàng
    status: | "placed" | "accepted" | "preparing" |
    "ready_for_rider" | "rider_assigned" | "picked_up" | "delivered" | "cancelled";

    paymentMethod: "razorpay" | "stripe"; // Phương thức thanh toán
    paymentStatus: "pending" | "paid" | "failed"; // Trạng thái thanh toán

    expiresAt: Date;    // Thời gian hết hạn của đơn hàng

    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: true,
    },
    restaurantId: {
        type: String,
        required: true,
    },
    restaurantName: {
        type: String,
        required: true
    },
    riderId: {
        type: String,
        default: null
    },
    riderPhone: {
        type: Number,
        default: null
    },
    riderName: {
        type: String,
        default: null
    },
    distance: {
        type: Number,
        required: true
    },
    riderAmount: {
        type: Number,
        required: true
    },
    items: [
        {
            itemId: String,
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
    subtotal: Number,
    deliveryFee: Number,
    platformFee: Number,
    totalAmount: Number,

    addressId: {
        type: String,
        required: true
    },
    deliveryAddress: {
        fromattedAddress: {
            type: String,
            required: true,
        },
        mobile: { type: Number, required: true },
        latitude: Number,
        longitude: Number,
    },

    status: {
        type: String,
        enum: ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up", "delivered", "cancelled"],
        default: "placed"
    },

    paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    expiresAt: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    },
},
    {
        timestamps: true,
    }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
