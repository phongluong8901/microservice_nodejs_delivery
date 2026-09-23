import axios from "axios"; // Nhập thư viện axios để gọi HTTP request
import Rider from "../model/Rider.js"; // Nhập Mongoose model Rider để truy vấn dữ liệu tài xế trong MongoDB
import { getChanel } from "./rabbitmq.js"; // Nhập hàm lấy kênh kết nối RabbitMQ
export const startOrderReadyConsumer = async () => {
    const channel = getChanel(); // Lấy đối tượng channel RabbitMQ hiện tại
    console.log("Starting to consume from: ", process.env.ORDER_READY_QUEUE); // In log thông báo bắt đầu lắng nghe từ hàng đợi nào
    channel.consume(process.env.ORDER_READY_QUEUE, async (msg) => {
        if (!msg)
            return; // Nếu message trống thì bỏ qua
        try {
            console.log("Received Message", msg.content.toString()); // In ra nội dung thô của message nhận được dưới dạng chuỗi
            const event = JSON.parse(msg.content.toString()); // Chuyển chuỗi JSON thành object JavaScript
            console.log("event type", event.type); // In ra loại sự kiện (event type)
            if (event.type !== "ORDER_READY_FOR_RIDER") { // Kiểm tra nếu sự kiện không phải là đơn hàng sẵn sàng cho tài xế
                console.log("skipping non-order-ready-for-rider event "); // In log bỏ qua sự kiện
                channel.ack(msg); // Gửi xác nhận (ack) đã xử lý xong message để xóa nó khỏi queue
                return; // Thoát hàm
            }
            const { orderId, restaurantId, location, } = event.data; // Lấy các thông tin orderId, restaurantId, và location từ dữ liệu sự kiện
            console.log("Searching for rider near: ", JSON.stringify(location)); // In log tọa độ đang tìm kiếm tài xế xung quanh
            const riders = await Rider.find({
                isAvailable: true, // Tài xế đang rảnh (sẵn sàng nhận đơn)
                isVerified: true, // Tài xế đã được xác thực tài khoản
                location: {
                    $near: {
                        $geometry: location, // Tọa độ vị trí quán ăn/đơn hàng
                        $maxDistance: 500, // Khoảng cách tối đa (mét), ở đây là trong bán kính 500m
                    }
                }
            });
            console.log(`Found ${riders.length} nearby riders`); // In ra số lượng tài xế tìm thấy ở gần
            if (riders.length === 0) { // Nếu không tìm thấy tài xế nào ở gần
                // --- DEBUG: check if ANY riders are available (ignore location) ---
                const allAvailable = await Rider.find({ isAvailable: true, isVerified: true }); // Truy vấn tất cả tài xế đang rảnh không phân biệt vị trí để debug
                console.log(`[DEBUG] Total available+verified riders (no location filter): ${allAvailable.length}`);
                allAvailable.forEach(r => {
                    console.log(`[DEBUG] userId=${r.userId}, location=${JSON.stringify(r.location)}`); // In thông tin từng tài xế khả dụng
                });
                console.log("No riders available nearby"); // In log thông báo không có tài xế gần đó
                channel.ack(msg); // Xác nhận đã xử lý message để tránh kẹt queue
                return; // Thoát hàm
            }
            for (const rider of riders) { // Duyệt qua danh sách các tài xế tìm được
                console.log(`Notifying rider userId: ${rider.userId}`); // In log đang thông báo cho tài xế cụ thể
                try {
                    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
                        event: "order:available", // Tên sự kiện websocket gửi đi
                        room: `user:${rider.userId}`, // Tên phòng (room) riêng của tài xế trên Socket.io
                        payload: { orderId, restaurantId }, // Dữ liệu kèm theo gồm mã đơn hàng và mã nhà hàng
                    }, {
                        headers: {
                            "x-internal-key": process.env.INTERNAL_SERVICE_KEY // Gửi kèm khóa bảo mật nội bộ trong header
                        }
                    });
                    console.log(`Notified rider ${rider.userId} successfully`); // In log thông báo thành công cho tài xế
                    await new Promise((resolve) => setTimeout(resolve, 100)); // Đợi 100ms trước khi gửi cho tài xế tiếp theo để tránh quá tải request
                }
                catch (error) {
                    console.error(`Failed to notify rider ${rider.userId}`); // Xử lý lỗi nếu gọi API thất bại cho tài xế này
                }
            }
            channel.ack(msg); // Gửi xác nhận (ack) hoàn thành xử lý message cho RabbitMQ
            console.log("mesasge acknowledged"); // In log báo đã xác nhận message
        }
        catch (error) {
            console.log("OrderReady consummer error: ", error); // Bắt và in ra lỗi nếu có ngoại lệ xảy ra trong quá trình xử lý message
        }
    });
};
