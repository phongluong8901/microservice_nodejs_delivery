import type React from "react";

// Định nghĩa cấu trúc kiểu dữ liệu cho đối tượng User
export interface User {
    _id: string,
    name: string,
    email: string,
    image: string,
    role: string,
}

// Định nghĩa cấu trúc kiểu dữ liệu cho vị trí địa lý
export interface LocationData {
    latitude: number,
    longitude: number,
    formattedAddress: string,
}

// Định nghĩa cấu trúc cho Ngữ cảnh ứng dụng toàn cục (AppContext) để chia sẻ state xuyên suốt các component
export interface AppContextType {
    user: User | null,
    loading: boolean,
    isAuth: boolean,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    location: LocationData | null;
    loadingLocation: boolean,
    city: string,
    cart: ICart[] | null;
    fetchCart: () => Promise<void>,
    subTotal: number,
    quantity: number,
}

export interface IRestaurant {
    _id: string;
    name: string;
    description?: string;
    image: string;
    ownerId: string;
    phone: number;
    isVerified: boolean;

    autoLocation: {
        type: "Point",  // Kiểu hình học là "Point" (Điểm trên bản đồ)
        coordinates: [number, number]; //[longtitude, latitude]
        formattedAddress: string;   // Địa chỉ đầy đủ dạng chữ được format sẵn
    };

    isOpen: boolean;
    createdAt: Date;
}

export interface IMenuItem {
    _id: string;
    restaurantId: string;
    name: string;
    description: string;
    image?: string;
    price: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICart {
    _id: string;
    userId: string;
    restaurantId: string | IRestaurant;
    itemId: string | IMenuItem;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrder {
    _id: string;
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

    status: | "placed" | "accepted" | "preparing" |
    "ready_for_rider" | "rider_assigned" | "picked_up" | "delivered" | "cancelled";

    paymentMethod: "razorpay" | "stripe"; // Phương thức thanh toán
    paymentStatus: "pending" | "paid" | "failed"; // Trạng thái thanh toán

    expiresAt: Date;    // Thời gian hết hạn của đơn hàng

    createdAt: Date;
    updatedAt: Date;
}

// Khi bạn khai báo const [user, setUser] = useState(...), thì hàm setUser chính là một hàm thuộc kiểu Dispatch.