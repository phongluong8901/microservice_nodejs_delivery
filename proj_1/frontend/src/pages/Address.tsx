import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";

// 🔧 Sửa lỗi mất icon mặc định của Leaflet (thư viện bản đồ)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Định nghĩa kiểu dữ liệu TypeScript cho một đối tượng Địa chỉ
interface Address {
    _id: string;
    formattedAddress: string;
    mobile: number;
}

// 📍 Component xử lý sự kiện click trên bản đồ để chọn tọa độ
const LocationPicker = ({
    setLocation,
}: {
    setLocation: (lat: number, lng: number) => void;
}) => {
    useMapEvents({
        click(e) {
            // Khi người dùng click vào bất kỳ điểm nào trên bản đồ, lấy ra vĩ độ và kinh độ rồi gọi callback
            setLocation(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// 🎯 Component nút định vị vị trí hiện tại của người dùng
const LocateMeButton = ({
    onLocate,
}: {
    onLocate: (lat: number, lng: number) => void;
}) => {
    const map = useMap(); // Lấy đối tượng bản đồ hiện tại thông qua hook của Leaflet
    const locateUser = () => {
        // Kiểm tra xem trình duyệt có hỗ trợ định vị (Geolocation) hay không
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }
        // Lấy tọa độ vị trí hiện tại của thiết bị
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.flyTo([latitude, longitude], 16, { animate: true }); // Di chuyển tâm bản đồ tới vị trí hiện tại với hiệu ứng mượt
                onLocate(latitude, longitude); // Cập nhật tọa độ vào state của component cha
            },
            () => toast.error("Location permission denied") // Báo lỗi nếu người dùng từ chối cấp quyền vị trí
        );
    };
    return (
        <button
            onClick={locateUser}
            className="absolute right-3 top-3 z-1000 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow hover:bg-gray-100"
        >
            <LuLocateFixed size={16} />
            Use current location
        </button>
    );
};

// Component chính trang thêm và quản lý địa chỉ
const AddAddressPage = () => {
    // Khai báo các biến state quản lý dữ liệu và trạng thái UI
    const [addresses, setAddresses] = useState<Address[]>([]); // Danh sách các địa chỉ đã lưu
    const [loading, setLoading] = useState(true); // Trạng thái đang tải danh sách địa chỉ
    const [adding, setAdding] = useState(false); // Trạng thái đang gửi yêu cầu thêm địa chỉ mới
    const [deletingId, setDeletingId] = useState<string | null>(null); // Lưu ID của địa chỉ đang trong quá trình xóa

    // 📋 Form state (Trạng thái của form nhập liệu)
    const [mobile, setMobile] = useState("");
    const [formattedAddress, setFormattedAddress] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    // 🌍 Lấy địa chỉ dạng văn bản từ tọa độ (Reverse Geocoding sử dụng OpenStreetMap Nominatim)
    const fetchFormattedAddress = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            setFormattedAddress(data.display_name || ""); // Cập nhật tên địa chỉ đầy đủ vào state
        } catch {
            toast.error("Failed to fetch address");
        }
    };

    // Hàm cập nhật đồng thời tọa độ và gọi dịch vụ chuyển đổi tên địa chỉ
    const setLocation = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
        fetchFormattedAddress(lat, lng);
    };

    // 📡 Gọi API lấy danh sách địa chỉ đã lưu của người dùng từ server
    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/address/all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi kèm token xác thực lấy từ localStorage
                },
            });

            // Xử lý linh hoạt cấu trúc trả về từ API để đảm bảo luôn nhận được một Mảng (Array)
            const addressList = Array.isArray(data)
                ? data
                : (data.addresses || data.data || data.cart || []);

            setAddresses(Array.isArray(addressList) ? addressList : []);
        } catch {
            toast.error("Failed to load addresses");
            setAddresses([]);
        } finally {
            setLoading(false); // Tắt trạng thái đang tải sau khi hoàn tất (dù thành công hay thất bại)
        }
    };

    // useEffect chạy một lần khi component được render lần đầu để lấy danh sách địa chỉ
    useEffect(() => {
        fetchAddresses();
    }, []);

    // ➕ Gửi yêu cầu thêm địa chỉ mới lên server
    const addAddress = async () => {
        // Kiểm tra xem đã điền đủ thông tin và chọn vị trí trên bản đồ chưa
        if (
            !mobile ||
            !formattedAddress ||
            latitude === null ||
            longitude === null
        ) {
            toast.error("Please select location on map");
            return;
        }
        try {
            setAdding(true);
            await axios.post(
                `${restaurantService}/api/address/new`,
                {
                    formattedAddress,
                    mobile,
                    latitude,
                    longitude,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Address added");
            // Reset lại form về trạng thái trống sau khi thêm thành công
            setMobile("");
            setFormattedAddress("");
            setLatitude(null);
            setLongitude(null);
            fetchAddresses(); // Tải lại danh sách địa chỉ mới
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed");
        } finally {
            setAdding(false);
        }
    };

    // 🗑 Gửi yêu cầu xóa một địa chỉ dựa vào ID
    const deleteAddress = async (id: string) => {
        if (!window.confirm("Delete this address?")) return; // Hộp thoại xác nhận trước khi xóa
        try {
            setDeletingId(id);
            await axios.delete(`${restaurantService}/api/address/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.success("Address deleted");
            fetchAddresses(); // Tải lại danh sách sau khi xóa thành công
        } catch {
            toast.error("Failed to delete address");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            <h1 className="text-2xl font-bold">Select Delivery Address</h1>

            {/* 🗺 Khu vực hiển thị bản đồ Leaflet */}
            <div className="relative h-100 w-full overflow-hidden rounded-lg border">
                <MapContainer
                    center={[latitude || 28.6139, longitude || 77.209]} // Tâm bản đồ mặc định (hoặc theo tọa độ đã chọn)
                    zoom={13}
                    className="h-full w-full"
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <LocationPicker setLocation={setLocation} />
                    <LocateMeButton onLocate={setLocation} />
                    {/* Hiển thị marker ghim trên bản đồ nếu đã có tọa độ */}
                    {latitude && longitude && <Marker position={[latitude, longitude]} />}
                </MapContainer>
            </div>

            {/* 📍 Hiển thị khung tên địa chỉ đã chọn từ tọa độ */}
            {formattedAddress && (
                <div className="rounded-lg border bg-green-50 p-3 text-sm">
                    📍 {formattedAddress}
                </div>
            )}

            {/* 📱 Ô nhập số điện thoại liên hệ */}
            <input
                type="number"
                placeholder="Mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-lg border px-4 py-2"
            />

            {/* ➕ Nút bấm lưu địa chỉ */}
            <button
                disabled={adding}
                onClick={addAddress}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#E23744] px-4 py-3 text-white hover:bg-[#d32f3a] disabled:opacity-50"
            >
                {/* Hiệu ứng xoay vòng (spinner) khi đang gửi request lưu */}
                {adding ? <BiLoader className="animate-spin" /> : <BiPlus />}
                Save Address
            </button>

            {/* 📋 Khu vực hiển thị danh sách các địa chỉ đã được lưu trước đó */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Saved Addresses</h2>
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : !Array.isArray(addresses) || addresses.length === 0 ? (
                    <p className="text-sm text-gray-500">No addresses saved</p>
                ) : (
                    // Duyệt qua mảng addresses để hiển thị từng địa chỉ
                    addresses.map((addr) => (
                        <div
                            key={addr._id}
                            className="flex items-center justify-between rounded-lg border bg-white p-3"
                        >
                            <div>
                                <p className="text-sm font-medium">{addr.formattedAddress}</p>
                                <p className="text-xs text-gray-500">📞 {addr.mobile}</p>
                            </div>
                            {/* Nút xóa từng địa chỉ */}
                            <button
                                onClick={() => deleteAddress(addr._id)}
                                disabled={deletingId === addr._id}
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                                {deletingId === addr._id ? (
                                    <BiLoader size={16} className="animate-spin" />
                                ) : (
                                    <BiTrash size={16} />
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AddAddressPage;