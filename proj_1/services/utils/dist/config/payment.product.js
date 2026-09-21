import { getChanel } from "./rabbitmq.js"; // Nhập hàm getChanel để lấy kênh kết nối RabbitMQ hiện tại
export const publishPaymentSuccess = async (payload) => {
    const channel = getChanel(); // Gọi hàm để lấy channel RabbitMQ đã được khởi tạo sẵn
    channel.sendToQueue(process.env.PAYMENT_QUEUE, Buffer.from(JSON.stringify({
        type: "PAYMENT SUCCESS", // Gán nhãn loại sự kiện là thanh toán thành công
        data: payload, // Truyền dữ liệu chi tiết vào message
    })), { persistent: true } // Đảm bảo message được lưu vào ổ đĩa của RabbitMQ, không bị mất nếu broker sập
    );
};
