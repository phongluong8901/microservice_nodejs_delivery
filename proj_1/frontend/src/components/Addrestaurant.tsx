import { useState } from "react";                        // Nhập hook quản lý state (trạng thái) của React
import { useAppData } from "../context/AppContext";         // Nhập custom hook lấy dữ liệu toàn cục (như tọa độ vị trí địa lý) từ AppContext
import toast from "react-hot-toast";                      // Nhập thư viện hiển thị thông báo toast đẹp mắt
import { restaurantService } from "../main";                // Nhập biến chứa URL gốc của Restaurant Service
import axios from "axios";                                    // Nhập axios để gửi HTTP request lên server
import { BiMapPin, BiUpload } from "react-icons/bi";          // Nhập các icon định vị bản đồ và tải lên từ thư viện react-icons

interface props {
    fetchMyRestaurant: () => Promise<void>;                   // Định nghĩa kiểu dữ liệu TypeScript cho props: hàm gọi lại để tải lại thông tin nhà hàng sau khi thêm thành công
}

const Addrestaurant = ({ fetchMyRestaurant }: props) => {
    const [name, setName] = useState("");                     // State lưu tên nhà hàng do người dùng nhập
    const [description, setDescription] = useState("");       // State lưu mô tả chi tiết nhà hàng
    const [phone, setPhone] = useState("");                   // State lưu số điện thoại liên hệ nhà hàng
    const [image, setImage] = useState<File | null>(null);    // State lưu file ảnh được chọn để tải lên (kiểu File hoặc null)
    const [submitting, setSubmitting] = useState(false);      // State kiểm soát trạng thái đang gửi form (dùng để khóa nút bấm, chống spam)

    const { loadingLocation, location } = useAppData();       // Lấy trạng thái đang tải vị trí (loadingLocation) và thông tin tọa độ/địa chỉ (location) từ AppContext

    // Hàm xử lý sự kiện khi người dùng bấm nút gửi form thêm nhà hàng
    const handleSubmit = async () => {
        if (!name || !image || !phone) {                      // Kiểm tra xem các trường bắt buộc (tên, ảnh, số điện thoại) đã được điền chưa
            alert("All field are required");                  // Nếu thiếu, hiển thị cảnh báo
            return;                                           // Dừng hàm không thực hiện tiếp
        }

        const formData = new FormData();                      // Khởi tạo đối tượng FormData để đóng gói dữ liệu dạng multipart/form-data (hỗ trợ gửi kèm file ảnh)
        formData.append('name', name);                        // Đưa tên nhà hàng vào gói dữ liệu
        formData.append('description', description);          // Đưa mô tả vào gói dữ liệu
        formData.append('latitude', String(location?.latitude));       // Đưa vĩ độ lấy từ context vào gói dữ liệu (chuyển sang dạng chuỗi)
        formData.append('longitude', String(location?.longitude));     // Đưa kinh độ lấy từ context vào gói dữ liệu
        formData.append('formattedAddress', location?.formattedAddress || ''); // Đưa địa chỉ dạng chữ vào gói dữ liệu
        formData.append('file', image);                       // Đưa file ảnh vào gói dữ liệu
        formData.append('phone', phone);                      // Đưa số điện thoại vào gói dữ liệu

        try {
            setSubmitting(true);                              // Bật trạng thái đang gửi (khóa nút bấm, hiển thị chữ "Submitting ...")
            await axios.post(`${restaurantService}/api/restaurant/new`, // Gửi HTTP POST request lên API tạo nhà hàng mới
                formData,                                     // Truyền gói dữ liệu FormData chứa cả text và file ảnh
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Đính kèm JWT token từ localStorage để xác thực quyền người bán
                    },
                });

            toast.success("Restaurant Added successfully");   // Hiển thị thông báo thành công khi thêm nhà hàng thành công
            fetchMyRestaurant();                              // Gọi hàm cập nhật lại thông tin nhà hàng trên component cha để chuyển sang giao diện quản lý
        } catch (error: any) {
            toast.error(error.response.data.message);         // Hiển thị thông báo lỗi trả về từ backend nếu có sự cố xảy ra
        } finally {
            setSubmitting(false);                             // Tắt trạng thái đang gửi (trả nút bấm về trạng thái bình thường)
        }
    }

    return <div className="min-h-screen bg-gray-50 px-4 py-6">  {/* Khung bọc toàn màn hình, nền xám nhạt, có padding */}
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5"> {/* Khung form chính giữa, bo tròn, nền trắng, có bóng mờ */}
            <h1 className="text-xl font-semibold">Add Your Restaurant</h1> {/* Tiêu đề form */}

            {/* Input nhập tên nhà hàng */}
            <input
                type="text"
                placeholder="Restaurant Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
            />

            {/* Input nhập số điện thoại liên hệ */}
            <input
                type="number"
                placeholder="Contact Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
            />

            {/* Textarea nhập mô tả nhà hàng */}
            <textarea
                placeholder="Restaurant Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
            />

            {/* Khu vực chọn file ảnh nhà hàng */}
            <label className="flex cursor-poniter items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
                <BiUpload className="h-5 w-5 text-red-500" /> {/* Icon upload */}
                {image ? image.name : "Upload restaurant image"} {/* Nếu đã chọn ảnh thì hiển thị tên file, ngược lại hiển thị chữ hướng dẫn */}
                <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} /> {/* Input file ẩn, chỉ nhận file ảnh, khi chọn sẽ lưu vào state image */}
            </label>

            {/* Khu vực hiển thị vị trí định vị tự động */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
                <BiMapPin className="mt-0.5 h-5 w-5 text-red-500" /> {/* Icon bản đồ */}
                <div className="text-sm">
                    {
                        loadingLocation ? "Fetching you location ..." : location?.formattedAddress || "Location not available" // Nếu đang lấy tọa độ thì hiện chữ loading, nếu có địa chỉ thì hiện địa chỉ, không thì báo không có
                    }
                </div>
            </div>

            {/* Nút bấm xác nhận gửi form */}
            <button
                className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744]"
                disabled={submitting} // Khóa nút bấm khi đang trong quá trình gửi request
                onClick={handleSubmit}> {/* Khi click sẽ gọi hàm handleSubmit xử lý dữ liệu */}
                {submitting ? "Submitting ..." : "Add Restaurant"} {/* Thay đổi chữ trên nút tùy theo trạng thái submitting */}
            </button>
        </div>
    </div>
};

export default Addrestaurant; // Xuất component ra ngoài để sử dụng ở các file khác