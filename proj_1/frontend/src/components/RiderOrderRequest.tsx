import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
    orderId: string;
    onAccepted: (orderId: string) => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
    const [accepting, setAccepting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onAccepted(orderId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [orderId, onAccepted]);

    const acceptOrder = async () => {
        setAccepting(true);
        try {
            await axios.post(`${riderService}/api/rider/accept/${orderId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            toast.success("Order Accepted");
            onAccepted(orderId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Order already taken");
            onAccepted(orderId);
        } finally {
            setAccepting(false);
        }
    };

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-green-300 space-y-3">
            <p className="text-center text-xs font-semibold text-red-600">
                Accept within {secondsLeft}s
            </p>
            <p className="text-center text-xs font-semibold text-green-600">
                New Delivery Request
            </p>

            <p className="text-xs text-gray-600">
                Order ID: <b>{orderId.slice(-6)}</b>
            </p>

            <button
                disabled={accepting}
                onClick={acceptOrder}
                className="w-full bg-green-600 text-white rounded-xl py-2 hover:bg-green-700 disabled:opacity-50"
            >
                {accepting ? "Accepting..." : "Accept order"}
            </button>
        </div>
    );
};

export default RiderOrderRequest;