import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import type { IOrder } from "../types";
import { useEffect, useState } from "react";
import { restaurantService } from "../main";
import axios from "axios";

const OrderPage = () => {
    const { id } = useParams();
    const { socket } = useSocket();

    const [order, setOrder] = useState<IOrder | null>(null);

    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }// Đính kèm JWT Token lấy từ localStorage để xác thực quyền xem đơn hàng ở phía backend.
            });

            setOrder(data.order);   // Gán dữ liệu đơn hàng nhận được từ server vào state `order`.
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    //Xử lý Vòng đời (useEffect) và WebSocket
    useEffect(() => {
        fetchOrder();   // Gọi API lấy dữ liệu ngay khi component được render lần đầu hoặc khi `id` trên URL thay đổi.
    }, [id]);

    useEffect(() => {
        // Nếu socket chưa được kết nối thì không làm gì cả.
        if (!socket) return;

        // Khi có sự kiện cập nhật đơn hàng từ server bắn về, tự động gọi lại `fetchOrder()` để cập nhật giao diện mới nhất
        const onOrderUpdate = () => {
            fetchOrder();
        };

        // Lắng nghe sự kiện WebSocket có tên là "order:update".
        socket.on("order:update", onOrderUpdate);

        // Dọn dẹp (cleanup) lắng nghe sự kiện khi component bị unmount để tránh rò rỉ bộ nhớ.
        return () => {
            socket.off("order:update", onOrderUpdate);
        }
    }, [socket]);

    // Hiển thị dòng chữ đang tải khi dữ liệu chưa được trả về từ server.
    if (loading) {
        return <p className="text-ceter text-gray-500">Loading order...</p>;
    }

    //Hiển thị thông báo nếu không tìm thấy đơn hàng hoặc đơn hàng không tồn tại
    if (!order) {
        return (<div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-gray-500">No order found</p>
        </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
            <h1 className="text-xl font-bold">Order #{order._id.slice(-6)}</h1>
            <div className="rounded-lg bg-blue-50 p-3 text-sm font-medium">
                Status: <span className="capitalize">{order.status}</span>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
                <h2 className="font-semibold">Items</h2>
                {
                    order.items.map((item, i) => {
                        return (
                            <div className="flex justify-between text-sm" key={i}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                            </div>
                        );
                    })
                }
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm space-y-1">
                <h2 className="font-semibold">Delivery Address</h2>
                <p className="text-sm text-gray-600">
                    {order.deliveryAddress?.formattedAddress || (order.deliveryAddress as any)?.fromattedAddress}
                </p>
                <p className="text-sm text-gray-600">Mobile: {order.deliveryAddress.mobile}</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-sm">
                    <span>
                        SubTotal
                    </span>
                    <span>
                        ${order.subtotal}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span>
                        Delivery Fee
                    </span>
                    <span>
                        ${order.deliveryFee}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span>
                        Platform Fee
                    </span>
                    <span>
                        ${order.platformFee}
                    </span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                    <span>
                        Total Amount
                    </span>
                    <span>
                        ${order.totalAmount}
                    </span>
                </div>

                <p className="text-xs text-gray-500">Payment method: {order.paymentMethod}</p>
                <p className="text-xs text-gray-500">Payment status: {order.paymentStatus}</p>
            </div>
        </div>
    );
}

export default OrderPage;