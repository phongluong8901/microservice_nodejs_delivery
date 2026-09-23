import { getChanel } from "./rabbitmq.js";                   // Nhập hàm lấy kênh kết nối RabbitMQ từ file rabbitmq.js

export const publishEvent = async (type: string, data: any) => { // Khai báo hàm async publishEvent nhận vào loại sự kiện và dữ liệu
    const channel = getChanel();                             // Lấy đối tượng channel hiện tại từ kết nối RabbitMQ

    channel.sendToQueue(                                     // Gửi message trực tiếp vào một hàng đợi (queue)
        process.env.ORDER_READY_QUEUE!,                      // Tên hàng đợi lấy từ biến môi trường (dấu ! báo TypeScript là biến này chắc chắn có)
        Buffer.from(JSON.stringify({ type, data })),         // Chuyển đổi object {type, data} thành chuỗi JSON rồi ép kiểu sang Buffer để RabbitMQ nhận được
        { persistent: true }                                 // Cấu hình message ghi xuống ổ đĩa, không bị mất nếu RabbitMQ khởi động lại
    );
};