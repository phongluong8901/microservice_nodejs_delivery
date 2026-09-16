import { Navigate, Outlet } from 'react-router-dom';
import { useAppData } from '../context/AppContext';

const PublicRoute = () => {
    // Lấy trạng thái đăng nhập (isAuth) và trạng thái đang tải (loading) từ AppContext
    const { isAuth, loading } = useAppData();

    // Nếu ứng dụng vẫn đang trong quá trình kiểm tra token (fetchUser), tạm thời không render gì cả (hoặc có thể hiển thị màn hình loading)
    if (loading) return null;


    // Nếu đã đăng nhập (isAuth = true), chuyển hướng người dùng đến trang chủ ("/")
    // Nếu chưa đăng nhập (isAuth = false), cho phép truy cập vào component con được bao bọc bởi Outlet (ví dụ: trang login/register)
    return isAuth ? <Navigate to="/" /> : <Outlet />
}

export default PublicRoute;