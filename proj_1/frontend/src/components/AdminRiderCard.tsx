import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";

interface AdminRiderCardProps {
    rider: any;
    onVerify: () => void; // Gọi lại hàm fetch danh sách
}

const AdminRiderCard = ({
    rider,
    onVerify,
}: AdminRiderCardProps) => {
    const verify = async () => {
        try {
            await axios.patch(`${adminService}/api/v1/verify/rider/${rider._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success("Rider verified successfully");
            onVerify(); // Load lại dữ liệu
        } catch (error) {
            console.log(error);
            toast.error("Failed to verify rider");
        }
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow space-y-3">
            {rider.image && (
                <img
                    src={rider.image}
                    className="h-40 w-full object-cover rounded-lg"
                    alt={rider.name}
                />
            )}
            <div>
                <h3 className="font-bold text-lg">{rider.name || "Rider Name"}</h3>
                <p className="text-sm text-gray-500">Email: {rider.email || "N/A"}</p>
                <p className="text-sm text-gray-500">Phone: {rider.phone || "N/A"}</p>
                <p className="text-xs text-gray-400 mt-1">ID: {rider._id}</p>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={verify}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
                >
                    Approve
                </button>
            </div>
        </div>
    );
}

export default AdminRiderCard;