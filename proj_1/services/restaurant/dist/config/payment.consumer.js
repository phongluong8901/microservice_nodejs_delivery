import Order from "../models/Order.js"; // Nhập Mongoose Model Order để thao tác với bảng đơn hàng trong CSDL
import { getChanel } from "./rabbitmq.js"; // Nhập hàm getChanel để lấy kênh kết nối RabbitMQ hiện tại
export const startPaymentConsumer = async () => {
    const channel = getChanel(); // Lấy channel RabbitMQ đã được kết nối
    channel.consume(process.env.PAYMENT_QUEUE, async (msg) => {
        if (!msg)
            return; // Nếu message rỗng thì bỏ qua
        try {
            const event = JSON.parse(msg.content.toString()); // Chuyển đổi nội dung message từ buffer sang đối tượng JSON
            if (event.type !== "PAYMENT_SUCCESS") { // Kiểm tra nếu loại sự kiện không phải là thanh toán thành công (⚠️ Lưu ý: Ở file publisher trước bạn đặt type là "PAYMENT SUCCESS", cần đồng bộ dấu gạch dưới `_` ở cả 2 bên thành "PAYMENT_SUCCESS")
                channel.ack(msg); // Xác nhận đã xử lý message này để RabbitMQ xóa khỏi queue
                return;
            }
            const { orderId } = event.data; // Lấy `orderId` từ dữ liệu sự kiện gửi đến
            const order = await Order.findOneAndUpdate(// Tìm và cập nhật trạng thái đơn hàng trong MongoDB
            {
                _id: orderId,
                paymentStatus: { $ne: "paid" }, // Điều kiện: đơn hàng chưa được thanh toán trước đó
            }, {
                $set: {
                    paymentStatus: "paid", // Cập nhật trạng thái thanh toán thành đã trả ("paid")
                    status: "placed", // Cập nhật trạng thái đơn hàng thành đã đặt ("placed")
                },
                $unset: {
                    expiresAt: 1, // Xóa bỏ trường expiresAt để đơn hàng không bị tự động xóa bởi TTL Index nữa (vì đã thanh toán thành công)
                },
            }, { new: true } // Trả về document sau khi đã được cập nhật mới
            );
            if (!order) { // Nếu không tìm thấy đơn hàng hoặc đơn hàng đã được cập nhật từ trước
                channel.ack(msg); // Gửi xác nhận (ack) để bỏ qua message
                return;
            }
            console.log("Order Placed:", order._id); // In log thông báo đơn hàng đã được đặt và thanh toán thành công
            //socket work // Chỗ dành để viết code thông báo realtime qua WebSocket cho nhà hàng/user (chưa triển khai)
            channel.ack(msg); // Gửi xác nhận thành công (ack) cho RabbitMQ để xóa message khỏi hàng đợi
        }
        catch (error) {
            console.error("X Payment cosumer error: ", error); // Bắt lỗi và in ra console nếu quá trình xử lý message gặp sự cố
        }
    });
};
