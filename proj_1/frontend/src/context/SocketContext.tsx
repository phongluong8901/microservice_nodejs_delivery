import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"; // Nhập các hooks và kiểu dữ liệu cơ bản từ React
import { io, Socket } from 'socket.io-client'; // Nhập hàm io và kiểu Socket từ thư viện socket.io-client để kết nối WebSocket
import { useAppData } from "./AppContext"; // Nhập custom hook quản lý trạng thái ứng dụng chung (để lấy trạng thái xác thực `isAuth`)
import { realtimeService } from "../main"; // Nhập địa chỉ URL của dịch vụ real-time từ file main

interface SocketContextType {
    socket: Socket | null; // Định nghĩa kiểu dữ liệu cho Context, chứa một instance Socket hoặc null
}

const SocketContext = createContext<SocketContextType>({ socket: null }); // Khởi tạo React Context cho Socket với giá trị mặc định ban đầu là null

export const SocketProvider = ({ children }: { children: ReactNode }) => { // Khởi tạo component Provider để bọc các component con và cung cấp kết nối Socket toàn cục
    const { isAuth } = useAppData(); // Lấy trạng thái đăng nhập (`isAuth`) từ AppContext

    const socketRef = useRef<Socket | null>(null); // Sử dụng useRef để lưu trữ thực thể socket xuyên suốt các vòng đời render mà không làm component re-render lại

    useEffect(() => { // Hook quản lý việc kết nối và ngắt kết nối socket dựa trên trạng thái `isAuth`
        if (!isAuth) { // Nếu người dùng chưa đăng nhập (hoặc đã đăng xuất)
            socketRef.current?.disconnect(); // Ngắt kết nối socket hiện tại nếu có
            socketRef.current = null; // Gán lại giá trị ref bằng null
            return; // Thoát khỏi useEffect
        }

        if (socketRef.current) return; // Nếu đã có kết nối socket rồi thì không tạo mới nữa

        const socket = io(realtimeService, { // Khởi tạo kết nối tới server Socket.io với URL được định nghĩa
            auth: {
                token: localStorage.getItem("token"), // Gửi kèm token JWT trong phần auth handshake để server xác thực
            },
            transports: ["websocket"], // Ép buộc sử dụng giao thức websocket thuần túy
        });

        socketRef.current = socket; // Lưu instance socket vào ref để dùng chung

        socket.on("connect", () => { // Lắng nghe sự kiện khi kết nối thành công tới server
            console.log("Socket Connected", socket.id); // In ra ID của socket khi kết nối thành công
        });

        socket.on("disconnect", () => { // Lắng nghe sự kiện khi mất kết nối với server
            console.log("Socket Disconnected"); // Thông báo khi socket ngắt kết nối
        });

        socket.on("connect_error", (err) => { // Lắng nghe khi có lỗi xảy ra trong quá trình kết nối (ví dụ sai token hoặc server tắt)
            console.log("Socket Error", err.message); // In thông báo lỗi ra console
        });

        return () => { // Hàm cleanup chạy khi component unmount hoặc isAuth thay đổi
            socket.disconnect(); // Ngắt kết nối socket
            socketRef.current = null; // Xóa giá trị trong ref
        };
    }, [isAuth]); // Chạy lại useEffect mỗi khi trạng thái đăng nhập `isAuth` thay đổi

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}> {/* Cung cấp giá trị socket hiện tại xuống các component con bên trong */}
            {children}
        </SocketContext.Provider>
    )
};

export const useSocket = () => { // Custom hook tiện ích giúp các component khác dễ dàng gọi socket thông qua `useSocket()`
    return useContext(SocketContext); // Trả về giá trị của SocketContext hiện tại
};