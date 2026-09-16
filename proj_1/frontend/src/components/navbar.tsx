import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
    const { isAuth, city } = useAppData(); // Lấy trạng thái đăng nhập từ Context
    const currLocation = useLocation();// Lấy thông tin về đường dẫn URL hiện tại

    const isHomePage = currLocation.pathname === "/"; // Kiểm tra xem có phải đang ở trang chủ không

    // Khởi tạo các hook quản lý search query trên URL (ví dụ: ?search=pizza)
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    // Sử dụng useEffect kết hợp debounce (trì hoãn 400ms) để cập nhật query params lên URL khi người dùng gõ tìm kiếm
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) {
                setSearchParams({ search })// Nếu có từ khóa, đẩy lên URL: ?search=...
            } else {
                setSearchParams({})
            }
        }, 400)

        return () => clearTimeout(timer) // Xóa timer cũ khi người dùng gõ ký tự tiếp theo
    }, [search]);

    return (
        <div className="w-full bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                {/* Logo thương hiệu (bấm vào để về trang chủ) - ⚠️ Lưu ý nhỏ: class `cursor-poniter` đang bị viết sai chính tả */}
                <Link to={'/'} className="text-2xl font-bold text-[#E23744] cursor-pointer">
                    Tomato
                </Link>

                {/* Các tiện ích bên phải: Giỏ hàng và Tài khoản/Đăng nhập */}
                <div className="flex items-center gap-4">
                    <Link to={'/cart'} className="relative">
                        <CgShoppingCart className="h-6 w-6 text-[#E23744]" />
                        {/* Huy hiệu hiển thị số lượng sản phẩm trong giỏ hàng (tạm để số 0) */}
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E23744] text-xs font-semibold text-white">
                            0
                        </span>
                    </Link>

                    {/* Kiểm tra nếu đã đăng nhập thì hiện chữ "Account", ngược lại hiện "Login" */}
                    {
                        isAuth ? (
                            <Link to="/account" className="font-medium text-[#E23744]">Account</Link>
                        ) : (
                            <Link to="/login" className="font-medium text-[#E23744]">Login</Link>
                        )
                    }
                </div>
            </div>

            {/* Thanh tìm kiếm (Search bar) - Chỉ hiển thị khi đang ở trang chủ (isHomePage = true) */}
            {
                isHomePage && <div className="border-t px-4 py-3">
                    <div className="mx-auto flex max-w-7xl items-center rounded-lg border shadow-sm">

                        {/* Phần hiển thị vị trí / thành phố */}
                        <div className="flex items-center gap-2 px-3 border-r text-gray-700">
                            <BiMapPin className="h-4 w-4 text-[#E23744]" />
                            <span className="text-sm truncate max-w-35">{city}</span>
                        </div>

                        {/* Ô nhập từ khóa tìm kiếm nhà hàng/món ăn */}
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <BiSearch className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for restaurant"
                                value={search}
                                onChange={e => setSearch(e.target.value)} // Cập nhật state search khi người dùng gõ
                                className="w-full py-2 text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default Navbar;