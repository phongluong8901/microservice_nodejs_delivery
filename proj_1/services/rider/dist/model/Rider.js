import mongoose, { Schema } from "mongoose"; // Nhập mongoose, Schema và Document từ thư viện Mongoose
const schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true, // Đảm bảo mỗi userId là duy nhất
    },
    picture: {
        type: String,
        required: true // Bắt buộc phải có ảnh đại diện
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true, // Số điện thoại là duy nhất
        trim: true, // Tự động cắt bỏ khoảng trắng thừa
    },
    addharNumber: {
        type: String,
        required: true // Bắt buộc có số Aadhaar
    },
    drivingLicenseNumber: {
        type: String,
        required: true // Bắt buộc có số bằng lái xe
    },
    isVerified: {
        type: Boolean,
        default: false // Mặc định chưa được xác thực
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // Giới hạn giá trị type bắt buộc là "Point"
            default: "Point",
        },
        coordinates: {
            type: [Number], // Mảng chứa các số nguyên/thực đại diện cho tọa độ
            required: true
        }
    },
    isAvailable: {
        type: Boolean,
        default: false // Mặc định tài xế không rảnh (chưa sẵn sàng nhận đơn)
    },
    lastActiveAt: {
        type: Date,
        default: Date.now // Mặc định lấy thời gian hiện tại
    },
}, {
    timestamps: true, // Tự động quản lý hai trường createdAt và updatedAt
});
schema.index({ location: "2dsphere" }); // Đánh chỉ mục (index) 2dsphere cho trường location để phục vụ các truy vấn vị trí gần nhất ($near) ở file consumer
export default mongoose.model("Rider", schema); // Biên dịch và xuất ra Mongoose Model "Rider" dựa trên schema đã định nghĩa
