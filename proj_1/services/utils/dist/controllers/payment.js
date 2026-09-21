import axios from 'axios'; // Nhập thư viện axios để thực hiện HTTP request sang các service khác
import { verifyRazorpaySignature } from '../config/verifyRazorpay.js'; // Nhập hàm kiểm tra chữ ký bảo mật của Razorpay
import { publishPaymentSuccess } from '../config/payment.product.js'; // Nhập hàm phát sự kiện thanh toán thành công lên RabbitMQ
import razorpay from '../config/razorpay.js'; // Nhập instance cấu hình Razorpay đã được khởi tạo sẵn
export const createRzaorpayOrder = async (req, res) => {
    const { orderId } = req.body; // Lấy `orderId` được truyền lên từ phía client (request body)
    const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY // Gửi kèm khóa bảo mật nội bộ để xác thực quyền gọi giữa các microservices
        }
    });
    const razorpayOrder = await razorpay.orders.create({
        amount: data.amount * 100, // Nhân số tiền đơn hàng với 100 vì Razorpay tính đơn vị tiền tệ bằng đơn vị nhỏ nhất (ví dụ: paise đối với INR)
        currency: "INR", // Đặt loại tiền tệ là INR (Indian Rupee)
        receipt: orderId, // Gắn mã biên lai (receipt) chính là orderId để dễ đối soát
    });
    res.json({
        razorpayOrderId: razorpayOrder.id, // Mã định danh đơn hàng trên hệ thống Razorpay
        key: process.env.RAZORPAY_KEY_SECRET // (⚠️ Lưu ý bảo mật: thường phía client chỉ cần key_id công khai, việc trả về key_secret ở đây có thể rủi ro nếu dùng ở frontend public)
    });
};
export const verifyRazorPayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_paymen_id, razorpay_signature, orderId } = req.body; // Lấy các tham số xác thực thanh toán từ request body (⚠️ Lưu ý: `razorpay_paymen_id` ở đây đang bị thiếu chữ `t`, nên đồng bộ tên biến với phía client nếu cần)
    const isValid = verifyRazorpaySignature(// Gọi hàm để kiểm tra tính hợp lệ của chữ ký chữ ký số
    razorpay_order_id, razorpay_paymen_id, razorpay_signature);
    if (!isValid) { // Nếu chữ ký không hợp lệ (không khớp)
        return res.status(400).json({
            message: "payment verification failed" // Thông báo xác thực thanh toán thất bại
        });
    }
    await publishPaymentSuccess(// Nếu hợp lệ, gọi hàm đẩy message sự kiện thanh toán thành công lên RabbitMQ
    {
        orderId, // Mã đơn hàng
        paymentId: razorpay_paymen_id, // Mã giao dịch thanh toán
        provider: "razorpay", // Nhà cung cấp cổng thanh toán là razorpay
        // status: "success" // Dòng chú thích cũ đã bị bỏ
    });
    res.json({
        message: "payment verified successfully", // Thông báo xác thực thanh toán thành công
    });
};
