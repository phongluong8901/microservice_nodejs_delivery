import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import Addrestaurant from "../components/Addrestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";

type SellerTab = "menu" | "add-item" | "sales"

const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null); // State lưu thông tin nhà hàng (mặc định là null chưa có)
    const [loading, setLoading] = useState(true);                   // State quản lý trạng thái đang tải dữ liệu (loading màn hình)
    const [tab, setTab] = useState<SellerTab>("menu");              // State lưu tab hiện đang được chọn (mặc định là tab "menu")

    //Hàm gọi API lấy thông tin nhà hàng của Seller
    const fetchMyRestaurant = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, { // Gửi GET request lấy thông tin nhà hàng của seller đang đăng nhập
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Đính kèm JWT token từ localStorage vào headers để xác thực
                }
            });

            setRestaurant(data.restaurant || null);                 // Lưu thông tin nhà hàng vào state, nếu không có thì gán null
            if (data.token) {                                       // Nếu backend trả về một token mới (trường hợp vừa tạo nhà hàng xong được cấp token mới kèm restaurantId)
                localStorage.setItem("token", data.token);          // Cập nhật lại token mới vào localStorage
                window.location.reload();                           // Tải lại trang (reload) để áp dụng token mới và cập nhật trạng thái toàn app
            }
        } catch (error) {
            console.log(error);                                     // Bắt và in lỗi ra console nếu gọi API thất bại
        } finally {
            setLoading(false);                                      // Dù thành công hay thất bại thì cũng tắt trạng thái loading (set thành false)
        }
    }

    useEffect(() => {
        fetchMyRestaurant();                                        // Gọi hàm lấy thông tin nhà hàng ngay khi component vừa được render lần đầu (Mount)
    }, []);

    //Quản lý danh sách món ăn và gọi API lấy Menu
    const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);    // State lưu danh sách các món ăn của nhà hàng (mặc định là mảng rỗng)

    const fetchMenuItems = async (restaurantId: string) => {        // Hàm gọi API lấy danh sách món ăn theo ID nhà hàng
        try {
            const { data } = await axios.get(`${restaurantService}/api/item/all/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` // Gửi kèm token xác thực
                }
            });

            setMenuItems(data);                                     // Lưu danh sách món ăn nhận được vào state

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (restaurant?._id) {                                      // Khi đã có thông tin nhà hàng (đã có _id)
            fetchMenuItems(restaurant._id);                         // Tự động gọi API lấy danh sách menu của nhà hàng đó
        }
    }, [restaurant]);                                               // Chạy lại mỗi khi biến `restaurant` thay đổi

    // Nếu đang tải dữ liệu, hiển thị dòng chữ Loading... chính giữa màn hình
    if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Loading your restaurant ...</p></div>

    // Nếu user đăng nhập vào nhưng chưa đăng ký nhà hàng nào, hiển thị component form thêm mới nhà hàng
    if (!restaurant) {
        return <Addrestaurant fetchMyRestaurant={fetchMyRestaurant} />
    }

    return <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
        {/* Component hiển thị thông tin profile nhà hàng, cho phép cập nhật hoặc bật/tắt trạng thái */}
        <RestaurantProfile
            restaurant={restaurant}
            onUpdate={setRestaurant}
            isSeller={true}
        />

        {/* Khung chứa các nút chuyển tab chức năng */}
        <div className="roundex-xl bg white shadow-sm">
            <div className="flex border-b">
                {[
                    { key: "menu", label: "Menu Items" },
                    { key: "add-item", label: "Add Item" },
                    { key: "sales", label: "Sales" },
                ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key as SellerTab)} // Khi click sẽ đổi state `tab` sang tab tương ứng
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === t.key ?
                            "border-b-2 border-red-500 text-red-500" :     // Nếu là tab đang chọn: gạch chân màu đỏ, chữ đỏ
                            "text-gray-500 hover:text-gray-700"}`}          // Nếu không: màu xám bình thường
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Nội dung thay đổi tương ứng theo tab đang chọn */}
            <div className="p-5">
                {/* Nếu đang ở tab "menu": Hiển thị danh sách món ăn */}
                {tab === "menu" && <MenuItems
                    items={menuItems}
                    onItemDeleted={() => fetchMenuItems(restaurant._id)} // Khi xóa món thành công sẽ tự động gọi lại hàm tải menu
                    isSeller={true}
                />}

                {/* Nếu đang ở tab "add-item": Hiển thị form thêm món ăn mới */}
                {tab === "add-item" && <AddMenuItem
                    onItemAdded={() => fetchMenuItems(restaurant._id)}   // Khi thêm món thành công sẽ tải lại danh sách menu
                />}

                {/* Nếu đang ở tab "sales": Hiển thị trang quản lý doanh thu (tạm thời để chữ Sales Page) */}
                {tab === "sales" && <p>Sales Page</p>}
            </div>
        </div>
    </div>
};

export default Restaurant;                                        // Xuất component để sử dụng trong routing của ứng dụng React

