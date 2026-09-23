import type { IOrder } from "../types";
import { useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
    order: IOrder;
    onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
    const [loading, setLoading] = useState(false);

    const updateStatus = async () => {
        setLoading(true);
        try {
            // Đúng chuẩn cú pháp axios.post: (url, data, config)
            await axios.put(
                `${riderService}/api/rider/order/update/${order._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            toast.success("Order status updated");
            onStatusUpdate?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    // Xác định text hiển thị cho nút bấm dựa vào trạng thái hiện tại
    const getButtonText = () => {
        if (order.status === "rider_assigned") return "Picked up order";
        if (order.status === "picked_up") return "Mark as delivered";
        return "Update Status";
    };

    return (
        <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
            <h1 className="font-semibold text-gray-800">Current Order</h1>

            <div className="text-sm text-gray-600 space-y-1">
                <p>
                    <b>Pickup:</b> {order.restaurantName}
                </p>
                <p>
                    <b>Drop:</b> {order.deliveryAddress.formattedAddress}
                </p>
                <p>
                    <b>Total:</b> ${order.totalAmount}
                </p>
                <p>
                    <b>Status:</b>
                    <span className="capitalize text-blue-600 ml-1">
                        {order.status.replace("_", " ")}
                    </span>
                </p>
            </div>

            {order.deliveryAddress.mobile && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="text-sm w-full flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Customer Phone</p>
                            <p className="font-semibold text-gray-800">
                                {order.deliveryAddress.mobile}
                            </p>
                        </div>
                        <a
                            href={`tel:${order.deliveryAddress.mobile}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                            Call
                        </a>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {(order.status === "rider_assigned" || order.status === "picked_up") && (
                    <button
                        disabled={loading}
                        onClick={updateStatus}
                        className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
                    >
                        {loading ? "Updating..." : getButtonText()}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RiderCurrentOrder;