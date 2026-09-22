import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";

const ACTIVE_STATUSES = [
    "placed",
    "accepted",
    "preparing",
    "ready_for_rider",
    "rider_assigned",
    "picked_up",
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        return localStorage.getItem("sound_enabled") === "true";
    });

    const { socket } = useSocket();

    // 🌟 HÀM TẠO ÂM THANH BẰNG WEB AUDIO API (KHÔNG CẦN FILE MP3)
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();

            // Tạo dao động âm thanh (Oscillator)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine'; // Kiểu sóng mượt, nghe như tiếng chuông báo
            // Tần số âm thanh (tạo tiếng ting ting vui tai)
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nốt D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // Nốt A5

            // Kiểm soát âm lượng giảm dần (fade out) để âm thanh mượt mà
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } catch (err) {
            console.log("Play sound error:", err);
        }
    };

    const toggleSound = () => {
        if (!soundEnabled) {
            playNotificationSound();
            setSoundEnabled(true);
            localStorage.setItem("sound_enabled", "true");
        } else {
            setSoundEnabled(false);
            localStorage.setItem("sound_enabled", "false");
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/restaurant/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });

            setOrders(data.orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [restaurantId]);

    useEffect(() => {
        if (!socket) return;

        const onNewOrder = () => {
            console.log("New Order received socket");

            if (soundEnabled) {
                playNotificationSound(); // Phát chuông báo khi có đơn mới
            }

            fetchOrders();
        };

        socket.on("order:new", onNewOrder);

        return () => {
            socket.off("order:new", onNewOrder);
        };
    }, [socket, soundEnabled]);

    if (loading) {
        return <p className="text-gray-500">Loading Orders</p>
    }

    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

    return (
        <div className="space-y-6">
            <div className={`border rounded-lg p-4 flex items-center justify-between transition ${soundEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{soundEnabled ? "🔔" : "🔕"}</span>
                    <div>
                        <p className={`font-medium ${soundEnabled ? "text-green-900" : "text-gray-900"}`}>
                            {soundEnabled ? "Sound Notification Enabled" : "Enable Sound Notification"}
                        </p>
                        <p className={`text-sm ${soundEnabled ? "text-green-700" : "text-gray-600"}`}>
                            {soundEnabled ? "You will hear a sound when new orders arrive" : "Get notified with sound when new orders arrive"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleSound}
                    className={`px-4 py-2 rounded-lg font-medium transition text-white ${soundEnabled
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {soundEnabled ? "Disable Sound" : "Enable Sound"}
                </button>
            </div>

            {/* Active orders */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Active Orders</h3>
                {
                    activeOrders.length === 0 ? (
                        <p className="text-sm text-gray-500">No Active orders</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeOrders.map((order) => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    onStatusUpdate={fetchOrders}
                                />
                            ))}
                        </div>
                    )
                }
            </div>

            {/* Completed orders */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Completed Orders</h3>
                {
                    completedOrders.length === 0 ? (
                        <p className="text-sm text-gray-500">No Completed orders</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedOrders.map((order) => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    onStatusUpdate={fetchOrders}
                                />
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default RestaurantOrders;