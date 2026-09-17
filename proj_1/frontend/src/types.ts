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
    city: string
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

// Khi bạn khai báo const [user, setUser] = useState(...), thì hàm setUser chính là một hàm thuộc kiểu Dispatch.