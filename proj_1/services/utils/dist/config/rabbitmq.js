import amqp from 'amqplib'; // Nhập thư viện amqplib để tương tác với RabbitMQ
let channel; // Khai báo biến toàn cục `channel` để lưu kênh giao tiếp (channel) của RabbitMQ dùng chung trong module
export const connectRabbitMQ = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL); // Kết nối đến RabbitMQ server thông qua URL lấy từ biến môi trường
    channel = await connection.createChannel(); // Tạo một channel từ kết nối vừa thiết lập và gán vào biến `channel`
    await channel.assertQueue(process.env.PAYMENT_QUEUE, {
        durable: true, // Đặt durable thành true để hàng đợi không bị mất khi RabbitMQ khởi động lại
    });
    console.log("RB: connected to Rabbitmq"); // In thông báo thành công ra console khi kết nối và thiết lập xong
};
export const getChanel = () => channel; // Hàm xuất ra (getter) để các file khác có thể lấy instance `channel` và thực hiện gửi/nhận message
