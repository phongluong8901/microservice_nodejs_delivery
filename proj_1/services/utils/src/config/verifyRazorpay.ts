import crypto from 'crypto'; // Nhập module crypto có sẵn của Node.js để thực hiện mã hóa và tạo chữ ký bảo mật (HMAC)

export const verifyRazorpaySignature = ( // Khai báo và xuất hàm kiểm tra tính hợp lệ của chữ ký Razorpay
    orderId: string, // Mã đơn hàng từ phía Razorpay (razorpay_order_id)
    paymentId: string, // Mã thanh toán từ phía Razorpay (razorpay_payment_id)
    signature: string // Chữ ký bảo mật nhận được từ client/Razorpay (razorpay_signature)
) => {
    const body = `${orderId}|${paymentId}` // Nối orderId và paymentId theo đúng chuẩn định dạng yêu cầu của Razorpay để tạo chuỗi dữ liệu gốc

    const expectedSignatur = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!) // Tạo thuật toán mã hóa HMAC với khóa bí mật SHA-256 dùng RAZORPAY_KEY_SECRET
        .update(body.toString()) // Cập nhật nội dung chuỗi dữ liệu cần mã hóa vào thuật toán
        .digest("hex"); // Lấy kết quả mã hóa dưới dạng chuỗi hệ thập lục phân (hex)

    return expectedSignatur === signature; // So sánh chữ ký vừa tính toán (expectedSignatur) với chữ ký thực tế truyền vào (signature) và trả về true nếu khớp
}