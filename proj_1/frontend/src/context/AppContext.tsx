import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import axios from "axios";
import type { AppContextType, User } from "../types";

// Khởi tạo một React Context chứa thông tin toàn cục, giá trị ban đầu là undefined
const AppContext = createContext<AppContextType | undefined>(undefined)

// Định nghĩa kiểu dữ liệu cho props của component AppProvider
interface AppProviderProps {
    children: ReactNode
}

// Định nghĩa component AppProvider chuyên cung cấp state cho toàn bộ ứng dụng
export const AppProvider = ({ children }: AppProviderProps) => {
    // Khai báo các state chính quản lý người dùng, trạng thái xác thực và trạng thái chờ
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(false);

    // Khai báo thêm các state phụ trợ cho vị trí địa lý
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fecthing Location...");

    // Hàm gọi API kiểm tra xem token trong localStorage có hợp lệ không và lấy thông tin user hiện tại
    async function fetchUser() {
        try {
            const token = localStorage.getItem("token") // Lấy JWT token đã lưu từ localStorage của trình duyệt
            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }, // Gửi token này kèm theo trong header Authorization để xác thực yêu cầu tới backend
            });
            setUser(data.user); // Cập nhật state user với thông tin nhận được từ backend
            setIsAuth(true); // Đánh dấu trạng thái đã đăng nhập thành công
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    // Sử dụng useEffect chạy 1 lần duy nhất khi ứng dụng khởi chạy (mount) để kiểm tra đăng nhập tự động
    useEffect(() => {
        fetchUser();
    }, []);

    // Cung cấp các giá trị state và hàm cập nhật cho tất cả các component
    return (
        <AppContext.Provider value={{
            isAuth,
            loading,
            setIsAuth,
            setLoading,
            setUser,
            user
        }}>
            {children}
        </AppContext.Provider>
    )

}

// Custom Hook tiện ích `useAppData` giúp các component dễ dàng truy xuất dữ liệu từ AppContext mà không cần gọi useContext lặp lại
export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used with in AppProvider");
    }
    return context;
}