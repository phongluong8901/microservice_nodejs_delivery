import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId, // Kiểu dữ liệu ObjectId chuẩn của MongoDB
        ref: "Restaurant", // Tạo liên kết (populate) sang collection "Restaurant"
        required: true,
        index: true, // Đánh chỉ mục (index) giúp tối ưu tốc độ tìm kiếm theo nhà hàng
    },
    name: {
        type: String,
        required: true,
        trim: true // Tự động cắt bỏ khoảng trắng thừa ở đầu/cuối chuỗi
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true, // Tự động tạo và quản lý hai trường createdAt và updatedAt
});
export default mongoose.model("MenuItem", schema);
