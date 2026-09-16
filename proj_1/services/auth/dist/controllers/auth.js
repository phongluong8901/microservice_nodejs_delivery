import User from "../model/User.js";
import jwt from 'jsonwebtoken';
import TryCatch from "../middlewares/trycatch.js";
import { oauth2Client } from "../config/googleConfig.js";
import axios from "axios";
// 1. Hàm đăng nhập/đăng ký thông qua Google OAuth Code
export const loginUser = TryCatch(async (req, res) => {
    // Lấy authorization code từ client gửi lên
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({
            message: "Authorization code is required",
        });
    }
    // Dùng code đổi lấy token từ Google
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);
    // Gọi API của Google để lấy thông tin chi tiết của người dùng
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    // Trích xuất thông tin người dùng
    const { email, name, picture } = userRes.data;
    // Tìm xem user đã tồn tại trong MongoDB chưa theo email
    let user = await User.findOne({ email });
    // Nếu chưa có, tạo mới một tài khoản user trong cơ sở dữ liệu
    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture,
        });
    }
    // Tạo JWT token riêng của ứng dụng cho user
    const token = jwt.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "15d", // Token có hiệu lực trong 15 ngày
    });
    // Trả về thông tin user và token cho client
    res.status(200).json({
        message: "Logged Success",
        token,
        user
    });
});
// Định nghĩa danh sách các role hợp lệ cho phép người dùng chọn
const allowedRoles = ["customer", "rider", "seller"];
// 2. Hàm cập nhật role (vai trò) cho người dùng
export const addUserRole = TryCatch(async (req, res) => {
    // Kiểm tra xem request đã được xác thực qua middleware isAuth chưa
    if (!req.user?._id) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    // Lấy role được gửi lên từ body
    const { role } = req.body;
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid role",
        });
    }
    // Tìm user theo ID và cập nhật role mới, trả về dữ liệu sau khi update
    const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true });
    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }
    // Tạo lại JWT token mới chứa thông tin user đã cập nhật role
    const token = jwt.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });
    res.json({ user, token });
});
// 3. Hàm lấy thông tin profile của chính user đang đăng nhập
export const myProfile = TryCatch(async (req, res) => {
    // Lấy thông tin user đã được gắn sẵn từ middleware isAuth
    const user = req.user;
    res.json(user);
});
