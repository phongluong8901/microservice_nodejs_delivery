import { getChanel } from "./rabbitmq.js"; // Nhập hàm getChanel để lấy kênh kết nối RabbitMQ hiện tại

export const publishPaymentSuccess = async (payload: { // Khai báo hàm bất đồng bộ để phát sự kiện thanh toán thành công
    orderId: string; // Mã đơn hàng
    paymentId: string; // Mã giao dịch thanh toán
    provider: "razorpay" | "stripe"; // Nhà cung cấp dịch vụ thanh toán (razorpay hoặc stripe)
    // status: "status: "success" | "failed"; // Dòng chú thích code cũ đã bị ẩn đi
}) => {
    const channel = getChanel() // Gọi hàm để lấy channel RabbitMQ đã được khởi tạo sẵn

    channel.sendToQueue(process.env.PAYMENT_QUEUE!, Buffer.from(JSON.stringify({ // Chuyển đổi object chứa message thành Buffer để gửi vào hàng đợi
        type: "PAYMENT SUCCESS", // Gán nhãn loại sự kiện là thanh toán thành công
        data: payload, // Truyền dữ liệu chi tiết vào message
    })
    ),
        { persistent: true } // Đảm bảo message được lưu vào ổ đĩa của RabbitMQ, không bị mất nếu broker sập
    )
};