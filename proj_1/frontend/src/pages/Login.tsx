import axios from "axios";
import { useState } from "react";
import { authService } from "../main";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import { useAppData } from "../context/AppContext";

const Login = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Lấy các hàm cập nhật state user và isAuth từ AppContext
    const { setUser, setIsAuth } = useAppData();

    // Hàm xử lý sau khi Google trả về kết quả xác thực thành công
    const responseGoogle = async (authResult: any) => {
        setLoading(true)    // Bật trạng thái loading khi đang gọi API
        try {
            // Gửi authorization code nhận được từ Google lên Backend của bạn
            const result = await axios.post(`${authService}/api/auth/login`, {
                code: authResult["code"],
            });
            // Lưu token vào localStorage để duy trì phiên đăng nhập
            localStorage.setItem("token", result.data.token);
            // Hiển thị thông báo thành công
            toast.success(result.data.message);

            // Tắt loading
            setLoading(false);

            // Cập nhật thông tin user vào state
            setUser(result.data.user);
            // Đánh dấu đã đăng nhập
            setIsAuth(true);
            // Chuyển hướng về trang chủ
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Problem while login");
            setLoading(false);
        }
    }

    // Khởi tạo Google Login hook với cơ chế "auth-code" (lấy authorization code gửi về backend)
    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle, // Gọi hàm responseGoogle khi thành công
        onError: responseGoogle,   // Gọi hàm responseGoogle khi có lỗi xảy ra
        flow: "auth-code",         // Chọn luồng xác thực bằng auth-code chuẩn bảo mật cao
    });

    return <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm space-y-6">
            <h1 className="text-center text-3xl font-bold text-[#E23774]">
                Tomato
            </h1>
            <p className="text-center text-sm text-gray-500">Login or Signup to continue</p>

            {/* Nút đăng nhập bằng Google - chỉ bật lên khi không ở trạng thái loading */}
            <button onClick={googleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
                <FcGoogle size={20} />
                {loading ? "Siging in ..." : "Sign in with Google"}
            </button>

            <p className="text-center text-xs text-gray-500">
                By continuing, you agree with our {" "}
                <a href="#" className="text-[#E23774]">Terms of Service</a> and{" "}
                <a href="#" className="text-[#E23774]"> Privacy Policy</a>
            </p>
        </div>
    </div>
};

export default Login;