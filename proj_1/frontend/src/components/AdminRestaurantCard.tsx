import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";

interface AdminRestaurantCardProps {
    restaurant: any;
    onVerify: () => void; // Gọi lại hàm fetch danh sách
}

const AdminRestaurantCard = ({
    restaurant,
    onVerify,
}: AdminRestaurantCardProps) => {
    const verify = async () => {
        try {
            await axios.patch(`${adminService}/api/v1/verify/restaurant/${restaurant._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success("Restaurant verified successfully");
            onVerify(); // Load lại dữ liệu
        } catch (error) {
            console.log(error);
            toast.error("Failed to verify restaurant");
        }
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow space-y-3">
            <img
                src={restaurant.image}
                className="h-40 w-full object-cover rounded-lg"
                alt={restaurant.name}
            />
            <div>
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-sm text-gray-500">Phone: {restaurant.phone}</p>
                <p className="text-sm text-gray-600 mt-1">{restaurant.autoLocation?.formattedAddress}</p>
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

export default AdminRestaurantCard;