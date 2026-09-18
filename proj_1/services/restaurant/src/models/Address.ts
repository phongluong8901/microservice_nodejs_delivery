import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
    userId: string;
    mobile: number;

    formattedAddress: string;   // Địa chỉ đầy đủ đã được định dạng (kiểu chuỗi)
    location: {
        type: 'Point';  // Loại hình học GeoJSON, mặc định là 'Point' (Điểm)
        coordinates: [number, number]; // Tọa độ địa lý: [Kinh độ (longitude), Vĩ độ (latitude)]
    };

    createAt: Date;
    updatedAt: Date;
}

const schema = new Schema<IAddress>({
    userId: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    formattedAddress: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],    // Giới hạn giá trị chỉ được phép là 'Point'
            default: "Point",
        },
        coordinates: {
            type: [Number], // Mảng chứa các số (dùng để lưu [kinh độ, vĩ độ])
            required: true,
        },
    },
},
    {
        timestamps: true,
    }
);

// Tạo chỉ mục (index) không gian địa lý dạng 2dsphere cho trường location để hỗ trợ tìm kiếm vị trí gần đây (GeoQueries)
schema.index({ location: "2dsphere" });

export default mongoose.model<IAddress>("Address", schema);