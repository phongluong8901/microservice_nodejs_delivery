import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Tự động cắt bỏ các khoảng trắng thừa ở đầu và cuối chuỗi
    },
    description: String,
    image: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    autoLocation: {
        type: {
            type: String,
            enum: ['Point'], // Giới hạn giá trị cố định bắt buộc phải là chữ "Point"
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true
        },
        formattedAddress: {
            type: String
        }
    },
    isOpen: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});
// Tạo chỉ mục (index) kiểu "2dsphere" cho trường autoLocation 
// 👉 CỰC KỲ QUAN TRỌNG: Giúp MongoDB thực hiện các truy vấn không gian địa lý (như tìm nhà hàng ở bán kính X km quanh vị trí của bạn) một cách cực nhanh.
schema.index({ autoLocation: "2dsphere" });
export default mongoose.model("Restaurant", schema);
