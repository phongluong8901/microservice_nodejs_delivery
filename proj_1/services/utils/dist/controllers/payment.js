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
import dotenv from 'dotenv'; // Nhập thư viện dotenv để đọc các biến môi trường từ file .env
dotenv.config(); // Kích hoạt cấu hình dotenv để nạp các biến vào process.env
import Stripe from 'stripe'; // Nhập thư viện Stripe để xử lý thanh toán
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Khởi tạo đối tượng Stripe bằng khóa bí mật lấy từ biến môi trường
export const payWithStripe = async (req, res) => {
    try {
        const { orderId } = req.body; // Lấy `orderId` được truyền lên từ phía client (request body)
        const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY // Gửi kèm khóa bảo mật nội bộ để xác thực quyền gọi giữa các microservices
            }
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Chỉ định phương thức thanh toán là thẻ ngân hàng (credit/debit card)
            mode: "payment", // Đặt chế độ thanh toán một lần (one-time payment)
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // Đơn vị tiền tệ là Đô la Mỹ (USD)
                        product_data: {
                            name: "Tomato food order", // Tên hiển thị của sản phẩm trên trang thanh toán Stripe
                        },
                        unit_amount: data.amount * 100, // Số tiền thanh toán (Stripe tính bằng đơn vị nhỏ nhất là Cent, nên nhân 100)
                    },
                    quantity: 1, // Số lượng sản phẩm là 1
                }
            ],
            metadata: {
                orderId, // Lưu kèm orderId vào metadata của Stripe để dễ truy xuất lại sau khi thanh toán xong
            },
            success_url: `${process.env.FRONTEND_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`, // Đường dẫn điều hướng về phía Frontend khi thanh toán thành công
            cancel_url: `${process.env.FRONTEND_URL}/checkout`, // Đường dẫn điều hướng về trang giỏ hàng/checkout nếu người dùng bấm hủy
        });
        res.json({
            url: session.url, // Trả về URL của trang thanh toán Stripe để client tiến hành redirect
        });
    }
    catch (error) {
        console.log("LỖI STRIPE CHI TIẾT:", error.response?.data || error.message || error); // In lỗi chi tiết ra terminal cổng 5002 để debug khi gặp sự cố
        res.status(500).json({
            message: "Internal server error" // Trả về thông báo lỗi chung cho client khi có ngoại lệ xảy ra
        });
    }
};
export const verifyStripe = async (req, res) => {
    const { sessionId } = req.body; // Lấy `sessionId` do client gửi lên sau khi thanh toán xong
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId); // Truy vấn thông tin chi tiết phiên thanh toán từ Stripe dựa vào sessionId
        if (!session) { // Kiểm tra nếu không tìm thấy phiên thanh toán
            return res.status(400).json({
                message: "Payment verification failed", // Báo lỗi xác thực thất bại
            });
        }
        const orderId = session.metadata?.orderId; // Lấy lại `orderId` đã được đính kèm trong metadata từ lúc tạo session
        if (!orderId) { // Kiểm tra nếu không tìm thấy orderId trong metadata
            return res.status(400).json({
                message: "orderid not found in stripe session" // Báo lỗi không tìm thấy mã đơn hàng
            });
        }
        await publishPaymentSuccess({
            orderId,
            paymentId: sessionId,
            provider: "stripe",
        });
        res.json({
            message: "payment verified successfully", // Trả về thông báo xác thực thành công cho client
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Stripe payment failed" // Trả về lỗi server nếu quá trình xử lý xác thực gặp trục trặc
        });
    }
};
