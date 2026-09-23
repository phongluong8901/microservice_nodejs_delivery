import { useCallback, useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload, BiPowerOff, BiLoader } from "react-icons/bi";
import type { IOrder } from "../types";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOderMap";

interface IRider {
    _id: string;
    phoneNumber: string;
    addharNumber: string;
    drivingLicenseNumber: string;
    picture: string;
    isVerified: boolean;
    isAvailable: boolean;
}

const RiderDashboard = () => {
    const { user, setIsAuth, setUser } = useAppData();
    const { socket } = useSocket();

    const [profile, setProfile] = useState<IRider | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        return localStorage.getItem("sound_enabled") === "true";
    });

    // Form states
    const [phoneNumber, setPhoneNumber] = useState("");
    const [addharNumber, setAddharNumber] = useState("");
    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // 🌟 HÀM TẠO ÂM THANH BẰNG WEB AUDIO API
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);

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

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setProfile(data || null);
        } catch (error) {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentOrder = async () => {
        try {
            const { data } = await axios.get(`${riderService}/api/rider/order/current`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setCurrentOrder(data.order);
        } catch (error) {
            console.log(error);
            setCurrentOrder(null);
        }
    };

    // --- TẤT CẢ CÁC HOOK (useEffect, useCallback) ĐƯỢC ĐẶT Ở ĐÂY (TRƯỚC CÁC ĐIỀU KIỆN RETURN) ---

    const handleOrderAccepted = useCallback((orderId: string) => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
        fetchProfile();
        fetchCurrentOrder();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onOrderAvailable = ({ orderId }: { orderId: string }) => {
            setIncomingOrders((prev) => prev.includes(orderId) ? prev : [...prev, orderId]);
            if (soundEnabled) playNotificationSound();
        }

        socket.on("order:available", onOrderAvailable);
        return () => {
            socket.off("order:available", onOrderAvailable);
        }
    }, [socket, soundEnabled]);

    useEffect(() => {
        if (user?.role === "rider") {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCurrentOrder();
    }, []);

    const logoutHandler = () => {
        localStorage.setItem("token", "");
        setIsAuth(false);
        setUser(null);
        toast.success("Logged out successfully");
    };

    const toggleAvailability = async () => {
        if (!navigator.geolocation) {
            toast.error("Location Access Required");
            return;
        }

        setToggling(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                await axios.patch(`${riderService}/api/rider/toggle`, {
                    isAvailable: !profile?.isAvailable,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                toast.success(!profile?.isAvailable ? "You are now Online" : "You are now Offline");
                fetchProfile();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Something went wrong");
            } finally {
                setToggling(false);
            }
        }, () => {
            toast.error("Please allow location access");
            setToggling(false);
        });
    };

    const handleSubmit = async () => {
        if (!phoneNumber || !addharNumber || !drivingLicenseNumber || !image) {
            toast.error("All fields and profile image are required");
            return;
        }

        if (!navigator.geolocation) {
            toast.error("Location Access Required");
            return;
        }

        setSubmitting(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const formData = new FormData();
                formData.append("phoneNumber", phoneNumber);
                formData.append("addharNumber", addharNumber);
                formData.append("drivingLicenseNumber", drivingLicenseNumber);
                formData.append("latitude", pos.coords.latitude.toString());
                formData.append("longitude", pos.coords.longitude.toString());
                if (image) {
                    formData.append("file", image);
                }

                await axios.post(`${riderService}/api/rider/new`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                });

                toast.success("Rider profile created successfully");
                fetchProfile();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to create profile");
            } finally {
                setSubmitting(false);
            }
        }, () => {
            toast.error("Please allow location access to create profile");
            setSubmitting(false);
        });
    };

    // --- CÁC ĐIỀU KIỆN RETURN ĐẶT SAU CÙNG (SAU KHI ĐÃ KHAI BÁO HẾT HOOK) ---

    if (user?.role !== "rider") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
                <p>You are not registered as a rider</p>
                <button onClick={logoutHandler} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                    Logout
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
                Loading rider details ...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6">
                <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold">Add Your Rider Profile</h1>
                        <button onClick={logoutHandler} className="text-sm text-red-500 hover:underline">
                            Logout
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Aadhar Number"
                        value={addharNumber}
                        onChange={(e) => setAddharNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-red-500"
                    />

                    <input
                        type="number"
                        placeholder="Contact Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-red-500"
                    />

                    <input
                        type="text"
                        placeholder="Driving License Number"
                        value={drivingLicenseNumber}
                        onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-red-500"
                    />

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
                        <BiUpload className="h-5 w-5 text-red-500" />
                        {image ? image.name : "Upload Rider Profile Image"}
                        <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} />
                    </label>

                    <button
                        className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744] hover:bg-red-600 disabled:opacity-50"
                        disabled={submitting}
                        onClick={handleSubmit}>
                        {submitting ? "Submitting ..." : "Add Profile"}
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER CHÍNH ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={profile.picture} alt="Rider" className="w-12 h-12 rounded-full object-cover border" />
                    <div>
                        <h2 className="font-semibold text-lg">{user.name}</h2>
                        <p className="text-xs text-gray-500">Phone: {profile.phoneNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        disabled={toggling}
                        onClick={toggleAvailability}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition ${profile.isAvailable ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}`}
                    >
                        {toggling ? <BiLoader className="animate-spin" /> : <BiPowerOff />}
                        {profile.isAvailable ? "Online" : "Offline"}
                    </button>
                    <button onClick={logoutHandler} className="px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200">
                        Logout
                    </button>
                </div>
            </div>

            <div className={`border rounded-lg p-4 flex items-center justify-between transition ${soundEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
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
                    className={`px-4 py-2 rounded-lg font-medium transition text-white ${soundEnabled ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {soundEnabled ? "Disable Sound" : "Enable Sound"}
                </button>
            </div>

            {profile.isAvailable && incomingOrders.length > 0 && (
                <div className="mx-auto max-w-md px-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Incoming Orders</h3>
                    {
                        incomingOrders.map((id) => (
                            <RiderOrderRequest
                                key={id}
                                orderId={id}
                                onAccepted={handleOrderAccepted}
                            />

                        ))

                    }
                    <RiderOrderMap order={currentOrder} />
                </div>
            )}

            {currentOrder && (
                <div className="mx-auto max-w-md px-4 sapce-y-4">
                    <RiderCurrentOrder
                        order={currentOrder}
                        onStatusUpdate={fetchCurrentOrder}
                    />
                </div>
            )}

            {/* Rider Details Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                <h3 className="font-semibold border-b pb-2">Rider Profile Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 font-medium ${profile.isAvailable ? "text-green-600" : "text-gray-600"}`}>
                            {profile.isAvailable ? "Available for orders" : "Offline"}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">Verification:</span>
                        <span className={`ml-2 font-medium ${profile.isVerified ? "text-green-600" : "text-amber-600"}`}>
                            {profile.isVerified ? "Verified ✓" : "Pending Verification"}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">Aadhar:</span>
                        <span className="ml-2 font-medium">{profile.addharNumber}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">License:</span>
                        <span className="ml-2 font-medium">{profile.drivingLicenseNumber}</span>
                    </div>
                </div>
            </div>

            <div>
                <span>Please be within a 500m radius of any restaurant (which we call a hospital) before going online as a rider to recive order</span>
            </div>
        </div>
    );
};

export default RiderDashboard;