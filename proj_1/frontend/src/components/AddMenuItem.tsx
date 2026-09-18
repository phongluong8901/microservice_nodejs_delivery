import axios from "axios";                                    // Nhập axios để gửi HTTP request lên server
import { useState } from "react";                        // Nhập hook quản lý state (trạng thái) của React
import { restaurantService } from "../main";                // Nhập biến chứa URL gốc của Restaurant Service
import toast from "react-hot-toast";                      // Nhập thư viện hiển thị thông báo toast đẹp mắt
import { BiUpload } from "react-icons/bi";                  // Nhập icon upload (tải lên) từ thư viện react-icons

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => Promise<void> }) => {
    const [name, setName] = useState("");                     // State lưu tên món ăn do người dùng nhập
    const [description, setDescription] = useState("");       // State lưu mô tả chi tiết món ăn
    const [price, setPrice] = useState("");                   // State lưu giá tiền món ăn
    const [image, setImage] = useState<File | null>(null);    // State lưu file ảnh món ăn được chọn (kiểu File hoặc null)
    const [loading, setLoading] = useState(false);            // State kiểm soát trạng thái đang gửi request (dùng để khóa nút, chống spam)

    // Hàm reset (làm sạch) lại toàn bộ form về trạng thái ban đầu sau khi thêm món thành công
    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setImage(null);
    }

    // Hàm xử lý sự kiện khi người dùng bấm nút thêm món ăn
    const handleSubmit = async () => {
        if (!name || !price || !image) {                      // Kiểm tra xem các trường bắt buộc (tên, giá, ảnh) đã được điền đầy đủ chưa
            alert("Name price and image is required");          // Nếu thiếu, hiển thị cảnh báo
            return;                                           // Dừng hàm không chạy tiếp
        }

        const formData = new FormData();                      // Khởi tạo đối tượng FormData để đóng gói dữ liệu dạng multipart/form-data (hỗ trợ gửi kèm file ảnh)

        formData.append("name", name);                        // Đưa tên món ăn vào gói dữ liệu
        formData.append("description", description);          // Đưa mô tả vào gói dữ liệu
        formData.append("price", price);                      // Đưa giá tiền vào gói dữ liệu
        formData.append("file", image);                       // Đưa file ảnh vào gói dữ liệu

        try {
            setLoading(true);                                 // Bật trạng thái đang tải (khóa nút, chuyển chữ thành "Adding...")

            await axios.post(`${restaurantService}/api/item/new`, formData, { // Gửi HTTP POST request tạo món ăn mới lên API backend
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` // Đính kèm JWT token từ localStorage để xác thực quyền người bán
                }
            });

            toast.success("Item added successfully");           // Hiển thị thông báo thành công
            resetForm();                                      // Làm trống form nhập liệu
            onItemAdded();                                    // Gọi hàm callback từ component cha để tải lại danh sách món ăn ngay lập tức
        } catch (error) {
            console.log(error);
            toast.error("Failed to add item");                // Hiển thị thông báo lỗi nếu quá trình thêm thất bại
        } finally {
            setLoading(false);                                // Tắt trạng thái loading (trả nút bấm về trạng thái bình thường)
        }
    }

    return <div className="max-w-md space-y-4 m-auto">          {/* Khung form căn giữa màn hình, giới hạn chiều rộng tối đa, có khoảng cách giữa các phần tử */}
        <h2 className="text-lg font-semibold">Add Menu Item</h2> {/* Tiêu đề form thêm món ăn */}

        {/* Input nhập tên món ăn */}
        <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />

        {/* Textarea nhập mô tả món ăn */}
        <textarea
            placeholder="Item description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />

        {/* Input nhập giá tiền món ăn */}
        <input
            type="number"
            placeholder="Item price $"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />

        {/* Khu vực chọn file ảnh món ăn */}
        <label className="flex cursor-poniter items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
            <BiUpload className="h-5 w-5 text-red-500" /> {/* Icon upload */}
            {image ? image.name : "Upload restaurant image"} {/* Nếu đã chọn ảnh thì hiển thị tên file, ngược lại hiển thị chữ hướng dẫn */}
            <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} /> {/* Input file ẩn, chỉ nhận định dạng ảnh, khi chọn sẽ cập nhật vào state image */}
        </label>

        {/* Nút bấm xác nhận thêm món */}
        <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-[#e23744] py-2 text-white text-sm font-semibold"
            disabled={loading} // Khóa nút bấm khi đang trong quá trình gửi request
        >
            {loading ? "Adding..." : "Add Item"} {/* Thay đổi chữ hiển thị tùy thuộc vào trạng thái loading */}
        </button>

    </div>
};

export default AddMenuItem; // Xuất component ra ngoài để sử dụng ở các file khác