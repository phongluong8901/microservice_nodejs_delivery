import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiPackage } from "react-icons/bi";

const Account = () => {
    // Lấy thông tin user và các hàm cập nhật state từ AppContext
    const { user, setUser, setIsAuth } = useAppData();

    // Lấy chữ cái đầu tiên của tên user để làm avatar (ví dụ: "John" -> "J")
    const firstLetter = user?.name?.charAt(0).toUpperCase();

    const navigate = useNavigate();

    // Hàm xử lý đăng xuất (Logout)
    const logoutHandler = () => {
        localStorage.setItem("token", ""); // Xóa token trong localStorage
        setUser(null);                     // Reset user về null
        setIsAuth(false);                  // Đổi trạng thái xác thành false
        navigate("/login");                // Chuyển hướng về trang login
        toast.success("logout Success");   // Thông báo thành công
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            {/* Thêm p-5 và flex items-center gap-4 vào đây để avatar và tên canh hàng ngang đẹp mắt */}
            <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-sm space-y-6">

                {/* Phần thông tin cá nhân (Avatar + Tên + Email) */}
                <div className="flex items-center gap-4 border-b pb-5">
                    {/* Đã sửa: item-center thành items-center, bg-re-500 thành bg-red-500 */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-semibold text-white shadow-md">
                        {firstLetter || "U"}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{user?.name || "User Name"}</h2>
                        <p className="text-sm text-gray-500">{user?.email || "user@email.com"}</p>
                    </div>
                </div>

                <div className="divide-y">
                    <div className="flex cursor-pointer items-center gap-4 py-3 hover:bg-gray-50 rounded-lg transition" onClick={() => navigate("/addresses")}>
                        <BiPackage className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Addresses</span>
                    </div>
                </div>

                {/* Danh sách các tùy chọn (Ví dụ: Đơn hàng của bạn) */}
                <div className="divide-y">
                    <div className="flex cursor-pointer items-center gap-4 py-3 hover:bg-gray-50 rounded-lg transition" onClick={() => navigate("/orders")}>
                        <BiPackage className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Your Orders</span>
                    </div>
                </div>

                {/* Nút Đăng xuất (Bonus thêm cho bạn nút logout vì thấy có hàm logoutHandler mà chưa có nút bấm) */}
                <button
                    onClick={logoutHandler}
                    className="w-full rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Account;