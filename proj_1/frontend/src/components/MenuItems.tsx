import { useState } from "react";                        // Nhập hook quản lý state (trạng thái) của React
import type { IMenuItem } from "../types";           // Nhập kiểu dữ liệu TypeScript cho món ăn
import { BsCartPlus, BsEye } from "react-icons/bs";       // Nhập các icon giỏ hàng và con mắt hiển thị từ thư viện react-icons
import { FiEyeOff } from "react-icons/fi";                // Nhập icon ẩn (mắt gạch chéo)
import { BiTrash } from "react-icons/bi";                 // Nhập icon thùng rác (xóa)
import { VscLoading } from "react-icons/vsc";             // Nhập icon loading xoay vòng
import axios from "axios";                                    // Nhập axios để gửi HTTP request lên server
import { restaurantService } from "../main";                // Nhập biến chứa URL gốc của Restaurant Service
import toast from "react-hot-toast";                      // Nhập thư viện hiển thị thông báo toast đẹp mắt
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
    items: IMenuItem[];                                       // Mảng danh sách các món ăn cần hiển thị
    onItemDeleted: () => void;                                // Hàm callback gọi lại khi xóa món hoặc thay đổi trạng thái để component cha tải lại dữ liệu
    isSeller: boolean;                                        // Biến phân quyền: true nếu là người bán (hiện nút xóa, ẩn/hiện), false nếu là khách hàng (hiện nút thêm vào giỏ)
}

const MenuItems = ({
    items,
    onItemDeleted,
    isSeller
}: MenuItemsProps) => {
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null); // State lưu ID của món ăn đang trong trạng thái xử lý (loading) để khóa nút bấm tương ứng

    // Hàm xử lý sự kiện xóa món ăn
    const handleDelete = async (itemId: string) => {
        const confirm = window.confirm("Are you sure you want to delete this item"); // Hiển thị hộp thoại xác nhận trước khi xóa
        if (!confirm) return;                                 // Nếu người dùng bấm Cancel thì dừng lại

        try {
            await axios.delete(`${restaurantService}/api/item/${itemId}`, { // Gửi HTTP DELETE request lên server để xóa món ăn theo ID
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` // Đính kèm JWT token từ localStorage để xác thực quyền
                }
            });

            toast.success("Item deleted");                    // Hiển thị thông báo thành công
            onItemDeleted();                                  // Gọi hàm callback để component cha cập nhật lại danh sách món ăn
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete item");             // Hiển thị thông báo lỗi nếu xóa thất bại
        }
    };

    // Hàm xử lý chuyển đổi trạng thái sẵn sàng (available / unavailable) của món ăn
    const toggleAvailability = async (itemId: string) => {
        try {
            setLoadingItemId(itemId);                         // Ghi nhận ID món ăn đang được xử lý để hiển thị icon loading
            const { data } = await axios.put(                 // Gửi HTTP PUT request cập nhật trạng thái món ăn lên server
                `${restaurantService}/api/item/status/${itemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}` // Đính kèm token xác thực
                    }
                }
            );

            toast.success(data.message);                      // Hiển thị thông báo thành công trả về từ server
            onItemDeleted();                                  // Gọi hàm callback tải lại danh sách món ăn
        } catch (error) {
            console.log(error);
            toast.error("Failed to update status");           // Thông báo lỗi nếu cập nhật thất bại
        } finally {
            setLoadingItemId(null);                           // Reset lại state loading về null khi hoàn tất
        }
    };

    const { fetchCart } = useAppData();

    const addToCart = async (restaurantId: string, itemId: string) => {
        try {
            setLoadingItemId(itemId);

            const { data } = await axios.post(`${restaurantService}/api/cart/add`, {
                restaurantId, itemId
            },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            toast.success(data.message);
            fetchCart();
        } catch (error: any) {
            toast.error(error.response.data.message);
        } finally {
            setLoadingItemId(null);
        }
    }

    return (
        // Khung hiển thị dạng lưới (grid): 1 cột trên màn nhỏ, 2 cột trên tablet, 3-4 cột trên màn hình lớn
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
                const isLoading = loadingItemId === item._id; // Kiểm tra xem món ăn hiện tại có đang trong trạng thái loading hay không

                return (
                    <div
                        key={item._id}
                        // Khung thẻ món ăn: làm mờ (opacity-70) nếu món ăn tạm ngưng phục vụ (!item.isAvailable)
                        className={`relative flex gap-4 rounded-lg bg-white p-4 shadow-sm transition ${!item.isAvailable ? "opacity-70" : ""}`}
                    >
                        {/* Phần hiển thị ảnh món ăn */}
                        <div className="relative shrink-0">
                            <img
                                src={item.image}
                                alt={item.name}
                                // Nếu món ăn không khả dụng thì làm xám ảnh (grayscale) và giảm độ sáng
                                className={`h-20 w-20 rounded object-cover ${!item.isAvailable ? "grayscale brightness-75" : ""}`}
                            />

                            {/* Lớp phủ mờ hiển thị chữ "Not Available" đè lên ảnh nếu món ăn tạm ngưng */}
                            {!item.isAvailable && (
                                <span className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs font-semibold text-white">
                                    Not Available
                                </span>
                            )}
                        </div>

                        {/* Phần thông tin chi tiết và các nút thao tác của món ăn */}
                        <div className="flex flex-1 flex-col justify-between">
                            <div>
                                <h3 className="font-semibold">{item.name}</h3> {/* Tên món ăn */}
                                {item.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {item.description} {/* Mô tả món ăn (giới hạn tối đa 2 dòng bằng line-clamp-2) */}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <p className="font-medium">${item.price}</p> {/* Giá tiền món ăn */}

                                {/* Giao diện dành riêng cho Người bán (isSeller = true) */}
                                {isSeller && (
                                    <div className="flex gap-2">
                                        {/* Nút bật/tắt trạng thái hiển thị (ẩn/hiện món ăn) */}
                                        <button
                                            onClick={() => toggleAvailability(item._id)}
                                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <VscLoading size={18} className="animate-spin" /> // Hiển thị icon xoay nếu đang xử lý
                                            ) : item.isAvailable ? (
                                                <BsEye size={18} /> // Hiển thị icon mắt mở nếu đang bán
                                            ) : (
                                                <FiEyeOff size={18} /> // Hiển thị icon mắt gạch chéo nếu đang tạm ngưng
                                            )}
                                        </button>

                                        {/* Nút xóa món ăn */}
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                        >
                                            <BiTrash size={18} />
                                        </button>
                                    </div>
                                )}

                                {/* Giao diện dành riêng cho Khách hàng (isSeller = false) */}
                                {!isSeller && (
                                    <button
                                        disabled={!item.isAvailable || isLoading} // Khóa nút nếu món không sẵn sàng hoặc đang loading
                                        onClick={() => addToCart(item.restaurantId, item._id)}
                                        className={`flex items-center justify-center rounded-lg p-2 ${!item.isAvailable || isLoading
                                            ? "cursor-not-allowed text-gray-400" // Kiểu hiển thị khi bị khóa (vô hiệu hóa)
                                            : "text-red-500 hover:bg-red-50"     // Kiểu hiển thị bình thường khi có thể bấm
                                            }`}
                                    >
                                        {isLoading ? (
                                            <VscLoading size={18} className="animate-spin" />
                                        ) : (
                                            <BsCartPlus size={18} /> // Icon thêm vào giỏ hàng
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MenuItems; // Xuất component ra ngoài để sử dụng ở các file khác