import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";

// Định nghĩa kiểu dữ liệu cho role
type Role = "customer" | "rider" | "seller" | null;

const SelectRole = () => {
    // Khởi tạo state lưu role mà user đang chọn (mặc định là null)
    const [role, setRole] = useState<Role>(null);
    const { setUser } = useAppData() // Lấy hàm setUser từ Context để cập nhật thông tin user sau khi chọn role
    const navigate = useNavigate() // Khởi tạo hàm điều hướng trang

    // Danh sách các vai trò cố định để hiển thị lên giao diện
    const roles: Role[] = ["customer", "rider", "seller"]

    // Hàm thực hiện gọi API để cập nhật vai trò cho user
    const addRole = async () => {
        try {
            // Gửi request PUT kèm theo role và token xác thực trong header
            const { data } = await axios.put(`${authService}/api/auth/add/role`, {
                role
            },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            // Lưu token mới (nếu có sự thay đổi)
            localStorage.setItem("token", data.token)
            // Cập nhật thông tin user vào state trong Context
            setUser(data.user)

            // Chuyển hướng người dùng về trang chủ sau khi chọn vai trò thành công
            navigate("/", { replace: true });
        } catch (error) {
            alert("something went wrong")
            console.log(error);
        }
    }

    return <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
            <h1 className="text-center text-2xl font-bold"> Choose your role</h1>
            {/* Danh sách các nút chọn vai trò */}
            <div className="space-y-4">
                {
                    roles.map((r) => (
                        <button key={r} onClick={() => setRole(r)} className={`
                        w-full rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${role === r ? "border-[#E23744] bg-[#E23744] text-white" : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}>
                            Continue as {r}
                        </button>
                    ))
                }
            </div>
            {/* Nút Next: chỉ bật lên khi user đã chọn xong role */}
            <button disabled={!role} onClick={addRole} className={`w-full  rounded-xl px-4 py-3 text-sm font-semibold transition ${role ? "border-[#23744] bg-[#E23774] text-white hover:bg[#d32f3a]" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}>
                Next
            </button>
        </div>
    </div>
};

export default SelectRole;