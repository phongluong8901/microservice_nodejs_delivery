import { useNavigate } from "react-router-dom";                    // Nhập hook useNavigate từ react-router-dom để điều hướng trang (chuyển hướng qua URL khác)

type Props = {
    id: string;                                                   // ID của nhà hàng (dùng cho đường dẫn chi tiết)
    image: string;                                                // URL ảnh đại diện của nhà hàng
    name: string;                                                 // Tên nhà hàng
    distance: string;                                             // Khoảng cách từ vị trí hiện tại đến nhà hàng (tính bằng km)
    isOpen: boolean;                                              // Trạng thái mở/đóng cửa của nhà hàng (true: đang mở, false: đã đóng)
}

const RestaurantCard = ({ id, image, name, distance, isOpen }: Props) => {
    const navigate = useNavigate();                               // Khởi tạo hàm điều hướng

    return (
        <div
            // Khung thẻ nhà hàng: có hiệu ứng bo tròn, đổ bóng, hiệu ứng hover phóng to nhẹ. 
            // Nếu nhà hàng đóng cửa (!isOpen), làm mờ toàn thẻ (opacity-80) và con trỏ chuột thành mặc định
            className={`relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md ${!isOpen ? "opacity-80" : ""}`}
            onClick={() => navigate(`/restaurant/${id}`)}         // Khi người dùng bấm vào thẻ, điều hướng tới trang chi tiết nhà hàng dựa vào ID
        >
            {/* Khung chứa hình ảnh nhà hàng */}
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    // Hiệu ứng ảnh: Khi hover vào ảnh sẽ phóng to nhẹ (hover:scale-105). 
                    // Nếu nhà hàng đóng cửa (!isOpen), ảnh sẽ chuyển sang trắng đen (grayscale)
                    className={`h-full w-full object-cover transition duration-300 hover:scale-105 ${!isOpen ? "grayscale" : ""}`}
                />
            </div>

            {/* Phần thông tin tên nhà hàng và khoảng cách */}
            <div className="p-3 space-y-1">
                <h3 className="font-semibold text-gray-800 truncate">{name}</h3> {/* Tên nhà hàng (nếu quá dài sẽ tự động cắt bớt bằng truncate) */}
                <p className="text-sm text-gray-500">{distance} km away</p>     {/* Hiển thị khoảng cách cách bao nhiêu km */}
            </div>

            {/* Lớp phủ (Overlay) thông báo "Closed" nếu nhà hàng đang đóng cửa */}
            {!isOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                    <span className="rounded-md bg-black/80 px-3 py-1 font-semibold text-sm text-white">
                        Closed
                    </span>
                </div>
            )}
        </div>
    );
}

export default RestaurantCard;                                    // Xuất component ra ngoài để sử dụng ở các file danh sách nhà hàng