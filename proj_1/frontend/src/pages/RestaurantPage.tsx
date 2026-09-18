import { useEffect, useState } from "react";                // Nhập các hook useEffect và useState từ React
import { useParams } from "react-router-dom";                    // Nhập hook useParams để lấy tham số (id nhà hàng) từ URL
import type { IMenuItem, IRestaurant } from "../types";           // Nhập các kiểu dữ liệu TypeScript cho món ăn và nhà hàng
import { restaurantService } from "../main";                // Nhập biến chứa URL gốc của Restaurant Service
import axios from "axios";                                    // Nhập axios để gửi HTTP request lên server
import RestaurantProfile from "../components/RestaurantProfile";  // Nhập component hiển thị thông tin chi tiết nhà hàng
import MenuItems from "../components/MenuItems";              // Nhập component hiển thị danh sách các món ăn

const RestaurantPage = () => {
    const { id } = useParams();                               // Lấy tham số id nhà hàng từ URL hiện tại

    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null); // State lưu thông tin chi tiết nhà hàng (ban đầu là null)
    const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);          // State lưu danh sách các món ăn của nhà hàng (mảng trống)
    const [loading, setLoading] = useState(true);            // State kiểm soát trạng thái đang tải dữ liệu (đang chờ API trả về)

    // Hàm gọi API lấy thông tin chi tiết của nhà hàng theo ID
    const fetchRestaurant = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/restaurant/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Đính kèm JWT token từ localStorage để xác thực
                },
            });

            setRestaurant(data || null);                      // Lưu dữ liệu nhà hàng vào state
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);                                // Tắt trạng thái loading khi hoàn tất request lấy nhà hàng
        }
    }

    // Hàm gọi API lấy danh sách tất cả món ăn thuộc nhà hàng này
    const fetchMenuItems = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/item/all/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` // Đính kèm JWT token xác thực
                }
            });

            setMenuItems(data);                               // Lưu danh sách món ăn vào state

        } catch (error) {
            console.log(error);
        }
    }

    // Sử dụng useEffect để gọi dữ liệu nhà hàng và danh sách món ăn ngay khi component được tải lên hoặc khi id trên URL thay đổi
    useEffect(() => {
        if (id) {
            fetchRestaurant();
            fetchMenuItems();
        }
    }, [id]);

    // Nếu đang trong quá trình tải dữ liệu hoặc chưa tìm thấy thông tin nhà hàng thì hiển thị thông báo
    if (!restaurant) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-gray-500">No Restaurant with this ID</p>
            </div>
        )
    }

    return (
        // Khung trang chi tiết nhà hàng: có nền xám nhạt, khoảng đệm xung quanh và khoảng cách giữa các phần tử
        <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
            {/* Component hiển thị thông tin hồ sơ nhà hàng (dưới góc độ khách hàng: isSeller = false) */}
            <RestaurantProfile
                restaurant={restaurant}
                onUpdate={setRestaurant}
                isSeller={false}
            />

            {/* Khung chứa danh sách menu món ăn của nhà hàng */}
            <div className="rounded-xl bg-white-sm p-4">
                <MenuItems
                    isSeller={false}                          // Khách hàng xem menu (không hiển thị nút xóa/sửa món, chỉ hiện nút thêm vào giỏ)
                    items={menuItems}                         // Truyền danh sách món ăn vào component con
                    onItemDeleted={() => {
                        // Callback tạm thời (có thể gọi lại fetchMenuItems() ở đây nếu khách hàng hoặc hệ thống cần làm mới danh sách)
                    }}
                />
            </div>
        </div>
    );
}

export default RestaurantPage;                                // Xuất component ra ngoài để sử dụng ở file định tuyến (router)