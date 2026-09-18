import { useState } from "react";                        // Nhập hook quản lý state (trạng thái) của React
import type { IRestaurant } from "../types";           // Nhập kiểu dữ liệu TypeScript cho đối tượng nhà hàng
import { restaurantService } from "../main";                // Nhập biến chứa URL gốc của Restaurant Service
import axios from "axios";                                    // Nhập axios để gửi HTTP request lên server
import toast from "react-hot-toast";                      // Nhập thư viện hiển thị thông báo toast đẹp mắt
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";  // Nhập các icon chỉnh sửa, định vị vị trí và nút lưu từ react-icons

interface props {
    restaurant: IRestaurant;                                  // Thông tin chi tiết của nhà hàng truyền từ component cha vào
    isSeller: boolean;                                        // Biến phân quyền: true nếu là chủ nhà hàng, false nếu là khách hàng
    onUpdate: (restaurant: IRestaurant) => void;              // Hàm callback gọi lại khi cập nhật thông tin nhà hàng thành công để cập nhật state ở component cha
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
    const [editMode, setEditMode] = useState(false);            // State kiểm soát chế độ chỉnh sửa thông tin (true: đang bật form sửa, false: chỉ xem)
    const [name, setName] = useState(restaurant.name);          // State lưu tên nhà hàng (có thể chỉnh sửa)
    const [description, setDescription] = useState(restaurant.description); // State lưu mô tả nhà hàng (có thể chỉnh sửa)
    const [isOpen, setIsOpen] = useState(restaurant.isOpen);    // State lưu trạng thái mở/đóng cửa của nhà hàng
    const [loading, setLoading] = useState(false);            // State kiểm soát trạng thái đang gửi request lưu thay đổi

    // Hàm xử lý bật/tắt trạng thái mở hoặc đóng cửa của nhà hàng
    const toggleOpenstatus = async () => {
        try {
            const { data } = await axios.put(                 // Gửi HTTP PUT request cập nhật trạng thái mở/đóng lên server
                `${restaurantService}/api/restaurant/status`,
                {
                    status: !isOpen                           // Đảo ngược trạng thái hiện tại (Đang mở thành đóng, đóng thành mở)
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}` // Đính kèm JWT token xác thực quyền chủ quán
                    }
                }
            );

            toast.success(data.message);                      // Hiển thị thông báo thành công từ server
            setIsOpen(data.restaurant.isOpen);                // Cập nhật lại state trạng thái mới
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to update status"); // Hiển thị lỗi nếu thất bại
        }
    };

    // Hàm xử lý lưu các thay đổi về tên và mô tả nhà hàng
    const saveChanges = async () => {
        try {
            setLoading(true);                                 // Bật trạng thái loading khi đang gửi request
            const { data } = await axios.put(                 // Gửi HTTP PUT request cập nhật thông tin nhà hàng lên server
                `${restaurantService}/api/restaurant/edit`,
                {
                    name,
                    description
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}` // Đính kèm token xác thực
                    }
                }
            );

            toast.success(data.message);                      // Thông báo thành công
            onUpdate(data.restaurant);                        // Gọi hàm callback truyền dữ liệu nhà hàng mới cập nhật lên component cha
            setEditMode(false);                               // Tắt chế độ chỉnh sửa (edit mode)
        } catch (error) {
            console.log(error);
            toast.error("Failed to update");                  // Thông báo lỗi nếu cập nhật thất bại
        } finally {
            setLoading(false);                                // Tắt trạng thái loading khi hoàn tất
        }
    };

    return (
        // Khung bao ngoài profile nhà hàng: căn giữa, giới hạn chiều rộng tối đa, bo tròn góc và đổ bóng nhẹ
        <div className="mx-auto max-w-xl rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Hiển thị hình ảnh nhà hàng nếu có */}
            {restaurant.image && (
                <img
                    src={restaurant.image}
                    alt=""
                    className="h-48 w-full object-cover"
                />
            )}

            <div className="p-5 space-y-4">
                {/* Giao diện dành cho người bán (isSeller = true) */}
                {isSeller && (
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* Nếu đang ở chế độ chỉnh sửa (editMode = true), hiển thị input cho phép sửa tên nhà hàng */}
                            {editMode ? (
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded border px-2 py-1 text-lg font-semibold"
                                />
                            ) : (
                                <h2 className="text-xl font-semibold">{restaurant.name}</h2> // Hiển thị tên nhà hàng dạng văn bản bình thường
                            )}

                            {/* Hiển thị địa chỉ nhà hàng */}
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                <BiMapPin className="h-4 w-4 text-red-500" />
                                {restaurant.autoLocation?.formattedAddress || "Location unavailable"}
                            </div>
                        </div>

                        {/* Nút bấm bật/tắt chế độ chỉnh sửa (icon cây bút) */}
                        {isSeller && (
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="text-gray-500 hover:text-black"
                            >
                                <BiEdit size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Giao diện hiển thị tên đơn thuần nếu người xem là khách hàng (isSeller = false) */}
                {!isSeller && (
                    <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                )}

                {/* Phần hiển thị hoặc chỉnh sửa mô tả nhà hàng */}
                {editMode ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded border px-3 py-2 text-sm"
                    />
                ) : (
                    <p className="text-sm">
                        {restaurant.description || "No description added"}
                    </p>
                )}

                {/* Dòng hiển thị trạng thái hiện tại (OPEN hoặc CLOSED) */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <span
                        className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-500"}`}
                    >
                        {isOpen ? "OPEN" : "CLOSED"}
                    </span>
                </div>

                {/* Các nút hành động dành cho chủ nhà hàng */}
                <div className="flex gap-3">
                    {/* Nút Save xuất hiện khi đang bật chế độ chỉnh sửa (editMode) */}
                    {editMode && (
                        <button
                            onClick={saveChanges}
                            disabled={loading}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                        >
                            <BiSave size={16} />
                            Save
                        </button>
                    )}

                    {/* Nút chuyển đổi trạng thái Mở cửa / Đóng cửa nhà hàng */}
                    {isSeller && (
                        <button
                            onClick={toggleOpenstatus}
                            className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white ${isOpen
                                    ? "bg-red-600 hover:bg-red-700"       // Nếu đang mở thì hiển thị nút màu đỏ để đóng cửa
                                    : "bg-green-600 hover:bg-green-700"   // Nếu đang đóng thì hiển thị nút màu xanh để mở cửa
                                }`}
                        >
                            {isOpen ? "Close Restaurant" : "Open Restaurant"}
                        </button>
                    )}
                </div>

                {/* Hiển thị ngày tạo nhà hàng */}
                <p className="text-xs text-gray-400">
                    Created on {new Date(restaurant.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default RestaurantProfile; // Xuất component ra ngoài để sử dụng ở các file khác