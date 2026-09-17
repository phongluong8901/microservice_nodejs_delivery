import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import axios from "axios";
import type { AppContextType, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

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
    const [location, setLocation] = useState<LocationData | null>(null); //location này sẽ có kiểu dữ liệu là LocationData
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

    useEffect(() => {
        if (!navigator.geolocation)
            return alert("Please allow Location to continue");
        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await res.json();

                // Cập nhật state vị trí của bạn (tùy thuộc vào cấu trúc state bạn đã định nghĩa)
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.display_name || "current Location",
                });

                setCity(
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    "Your Location",
                );
                setLoadingLocation(false);

            } catch (error) {
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: "Current Location"
                });
                setCity("Failed to load");
                setLoadingLocation(false);
            }
        })
    }, []);

    // Cung cấp các giá trị state và hàm cập nhật cho tất cả các component
    return (
        <AppContext.Provider value={{
            isAuth,
            loading,
            setIsAuth,
            setLoading,
            setUser,
            user, location, loadingLocation, city
        }}>
            {children}
            <Toaster />
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