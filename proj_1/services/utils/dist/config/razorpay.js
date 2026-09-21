import Razorpay from "razorpay"; // Nhập thư viện Razorpay để xử lý thanh toán
import dotenv from 'dotenv'; // Nhập thư viện dotenv để đọc biến môi trường từ file .env
dotenv.config(); // Kích hoạt dotenv để nạp các biến từ file .env vào process.env
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID, // Lấy khóa API ID từ biến môi trường (dấu ! báo cho TS biết biến không null/undefined)
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Lấy khóa bí mật từ biến môi trường
});
export default razorpay; // Xuất đối tượng razorpay làm default export cho file khác sử dụng
