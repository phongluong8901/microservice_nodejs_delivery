import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";

const ACTIVE_STATUSES = [
    "placed",
    "accepted",
    "preparing",
    "ready_for_rider",
    "rider_assigned",
    "picked_up"
]

const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook điều hướng trang của React Router.
    const { socket } = useSocket(); // Lấy socket từ Context để lắng nghe sự kiện realtime.

    // Gọi API lấy danh sách đơn hàng kèm theo Token xác thực của user
    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/myorder`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            setOrders(data.orders || []);   // Lưu danh sách đơn hàng nhận được vào state.
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Lắng nghe vòng đời và WebSocket
    useEffect(() => {
        fetchOrders();// Gọi API ngay khi component được tải lên lần đầu
    }, []);

    useEffect(() => {
        if (!socket) return; // Nếu chưa có kết nối Socket, dừng hàm ngay lập tức

        // Khi có sự thay đổi trạng thái đơn hàng từ server gửi qua socket, tự động gọi lại API cập nhật danh sách
        const onOrderUpdate = () => {
            fetchOrders();
        };

        socket.on("order:update", onOrderUpdate);
        socket.on("order:rider_assigned", onOrderUpdate);


        return () => {
            socket.off("order:update", onOrderUpdate); // Dọn dẹp sự kiện khi component unmount.
            socket.off("order:rider_assigned", onOrderUpdate);
        }
    }, [socket]);

    if (loading) {
        return <p className="text-ceter text-gray-500">Loading orders...</p>;
    }

    if (orders.length === 0) {
        return (<div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-gray-500">No orders yet</p>
        </div>
        );
    }

    // Lọc ra các đơn hàng đang xử lý dựa vào mảng ACTIVE_STATUSES.
    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    // Lọc ra các đơn hàng đã hoàn thành hoặc bị hủy
    const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Active Orders</h2>
                {
                    !activeOrders || activeOrders.length === 0 ? (
                        <p>No active orders</p>
                    ) : (
                        activeOrders.map((order) => (
                            <OrderRow
                                key={order._id}
                                order={order}
                                onClick={() => navigate(`/order/${order._id}`)}
                            />
                        ))
                    )
                }
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Completed Orders</h2>
                {
                    !completedOrders || completedOrders.length === 0 ? (
                        <p>No active orders</p>
                    ) : (
                        completedOrders.map((order) => (
                            <OrderRow
                                key={order._id}
                                order={order}
                                onClick={() => navigate(`/order/${order._id}`)}
                            />
                        ))
                    )
                }
            </section>
        </div>
    );
}

export default Orders;

///component Oder now
const OrderRow = ({ order, onClick }: { order: IOrder, onClick: () => void }) => {
    return (
        <div className="cursor-pointer rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50" onClick={onClick}>
            <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
            <span className="text-xs capitalize text-gray-500">{order.status}</span>
            <div className="mt-2 text-sm text-gray-600">
                {order.items.map((item, i) => (
                    <span key={i}>
                        {item.name} x {item.quantity}
                        {i < order.items.length - 1 && ", "}
                    </span>
                ))}
            </div>

            <div className="mt-2 flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>${order.totalAmount}</span>
            </div>
        </div>
    );
};