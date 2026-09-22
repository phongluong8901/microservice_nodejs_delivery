import { Server } from 'socket.io'; // Nhập lớp Server từ thư viện socket.io để khởi tạo máy chủ WebSocket
import http from 'http'; // Nhập module http chuẩn của Node.js để tương tác với HTTP Server
import jwt from 'jsonwebtoken'; // Nhập thư viện jsonwebtoken để giải mã và xác thực token JWT

let io: Server; // Khai báo biến toàn cục `io` để lưu trữ thể hiện (instance) của Socket.io server dùng chung cho toàn bộ ứng dụng

export const initSocket = (server: http.Server) => { // Định nghĩa hàm khởi tạo Socket.io gắn vào HTTP server
    io = new Server(server, { // Khởi tạo một Socket.io server mới bọc lấy server HTTP
        cors: {
            origin: "*", // Cho phép mọi nguồn (origin) kết nối vào WebSocket server (CORS mở)
        }
    });

    io.use((socket, next) => { // Middleware chạy trước khi client kết nối thành công để xác thực (authentication)
        try {
            const token = socket.handshake.auth?.token // Lấy token JWT từ đối tượng handshake.auth gửi lên từ phía client

            if (!token) { // Nếu không có token được gửi lên
                return next(new Error("Unauthorized")); // Từ chối kết nối và trả về lỗi chưa xác thực
            }

            const decoded = jwt.verify(token, process.env.JWT_SEC!) as any; // Giải mã và xác thực token bằng khóa bí mật JWT_SEC

            if (!decoded || !decoded.user) { // Kiểm tra nếu token không hợp lệ hoặc không chứa thông tin user
                return next(new Error("Unauthorized")); // Từ chối kết nối
            }

            socket.data.user = decoded.user; // Lưu thông tin user đã giải mã vào đối tượng socket.data để sử dụng về sau

            next(); // Cho phép kết nối đi tiếp vào sự kiện connection
        } catch (error) {
            console.log("X Socket auth failed: ", error); // In lỗi ra terminal nếu quá trình giải mã token gặp sự cố
            next(new Error("Unauthorized")); // Từ chối kết nối nếu xác thực thất bại
        }
    });

    io.on("connection", (socket) => { // Lắng nghe sự kiện khi một client kết nối thành công vào socket server
        const user = socket.data.user; // Lấy thông tin user đã được gán từ middleware phía trên

        if (!user) { // Phòng hờ nếu không có dữ liệu user thì ngắt kết nối
            socket.disconnect();
            return;
        }

        const userId = user._id; // Lấy ID của người dùng

        socket.join(`user:${userId}`); // Cho socket tham gia vào một room riêng biệt của chính user đó (để gửi thông báo cá nhân)

        if (user.restaurantId) { // Kiểm tra nếu user thuộc về một nhà hàng nào đó
            socket.join(`restaurant:${user.restaurantId}`); // Cho socket tham gia thêm vào room của nhà hàng đó (để nhận đơn hàng chung của quán)
        }

        console.log(`User connected: ${userId}`); // Thông báo ra console khi có user kết nối thành công
        console.log("Socket room: ", [...socket.rooms]); // In ra danh sách các room mà socket này đang tham gia

        socket.on("disconnect", () => { // Lắng nghe sự kiện khi client ngắt kết nối
            console.log(`User disconnected: ${userId}`); // Thông báo ra console khi user ngắt kết nối
        });
    });

    return io; // Trả về đối tượng io sau khi khởi tạo xong
};

export const getIo = () => { // Hàm helper dùng để lấy lại đối tượng io ở các file khác (ví dụ như trong router API)
    if (!io) { // Kiểm tra nếu Socket.io chưa được khởi tạo mà đã gọi
        throw new Error("Socket.io not initialized"); // Báo lỗi để lập trình viên biết
    }

    return io; // Trả về instance của io hiện tại
}