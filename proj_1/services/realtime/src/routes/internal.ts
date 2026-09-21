import express from 'express'; // Nhập framework Express để xây dựng router và xử lý HTTP request
import { getIo } from '../socket'; // Nhập hàm getIo từ file socket để lấy thể hiện của Socket.io server

const router = express.Router(); // Khởi tạo một Express Router mới để định nghĩa các tuyến đường (routes)

router.post("/emit", (req, res) => { // Định nghĩa endpoint POST `/emit` để nhận yêu cầu phát sự kiện socket từ các microservices khác trong hệ thống
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) { // Kiểm tra khóa bảo mật nội bộ để đảm bảo request xuất phát từ service nội bộ tin cậy
        return res.status(403).json({
            message: "Forbidden", // Trả về lỗi 403 Nếu không có quyền truy cập (khóa không khớp)
        });
    }

    const { event, room, payload } = req.body; // Trích xuất các thông tin `event` (tên sự kiện), `room` (phòng nhận), và `payload` (dữ liệu gửi kèm) từ request body
    if (!event || !room) { // Kiểm tra xem tên sự kiện và phòng nhận có được cung cấp đầy đủ hay không
        return res.status(400).json({
            message: "event ad room are required", // Trả về lỗi 400 nếu thiếu thông tin bắt buộc
        });
    }

    const io = getIo() // Lấy thể hiện Socket.io server đã được khởi tạo trước đó
    console.log(`III Emiting evnt ${event} to room ${room}`); // In thông báo ra console để debug sự kiện đang được phát đi

    io.to(room).emit(event, payload ?? {}) // Gửi sự kiện (`event`) kèm theo dữ liệu (`payload` hoặc object rỗng nếu không có) đến tất cả các client nằm trong phòng (`room`) chỉ định

    return res.json({
        success: true, // Trả về kết quả thành công cho service gọi tới khi đã emit xong
    })
});

export default router; // Xuất router để gắn vào ứng dụng chính trong file server (app.use)