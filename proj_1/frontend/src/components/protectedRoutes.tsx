import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppContext';

const ProtectedRoute = () => {
    const { isAuth, user, loading } = useAppData();

    // Lấy thông tin về đường dẫn hiện tại mà người dùng đang truy cập (ví dụ: "/", "/select-role")
    const location = useLocation()

    if (loading) return null;

    // Trường hợp 1: Nếu chưa đăng nhập (isAuth = false), ép chuyển hướng về trang "/login"
    // Thuộc tính `replace` giúp thay thế lịch sử trang hiện tại, ngăn user bấm nút "Quay lại" trên trình duyệt để lách luật
    if (!isAuth) {
        return <Navigate to={"/login"} replace />;
    }

    // Trường hợp 2: Nếu đã đăng nhập nhưng CHƯA chọn vai trò (role === null), 
    // và hiện tại KHÔNG PHẢI đang ở trang chọn vai trò -> Bắt buộc chuyển hướng về "/select-role"
    if (user?.role === null && location.pathname !== "/select-role") {
        return <Navigate to={'/select-role'} replace />;
    }

    // Trường hợp 3: Nếu đã có vai trò rồi (role !== null), 
    // nhưng lại cố tình truy cập vào trang chọn vai trò ("/select-role") -> Đẩy ngược về trang chủ ("/")
    if (user?.role !== null && location.pathname === "/select-role") {
        return <Navigate to={'/'} replace />;
    }

    // Nếu vượt qua tất cả các điều kiện trên một cách hợp lệ, cho phép hiển thị trang con thông qua thẻ <Outlet />
    return <Outlet />
}

export default ProtectedRoute;