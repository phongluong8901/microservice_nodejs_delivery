import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;    // ID của người dùng sở hữu giỏ hàng (tham chiếu đến bảng User)
    restaurantId: mongoose.Types.ObjectId;  // ID của nhà hàng chứa món ăn này (tham chiếu đến bảng Restaurant)
    itemId: mongoose.Types.ObjectId;    // ID của món ăn được thêm vào giỏ hàng (tham chiếu đến bảng MenuItem)
    quantity: number;                   // Số lượng món ăn trong giỏ hàng
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,    // Kiểu dữ liệu ObjectId lưu trữ ID của User
        ref: "User",    // Tham chiếu liên kết (populate) tới Model "User"
        required: true,
        index: true,    // Tạo index trên trường này giúp tăng tốc độ truy vấn tìm giỏ hàng theo người dùng
    },

    restaurantId: {
        type: Schema.Types.ObjectId,    // Kiểu dữ liệu ObjectId lưu trữ ID của Restaurant
        ref: "Restaurant",  // Tham chiếu liên kết (populate) tới Model "Restaurant"
        required: true,
        index: true,
    },

    itemId: {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
        index: true,
    },

    quantity: {
        type: Number,
        default: 1,
        min: 1, // Giá trị tối thiểu phải là 1 (không được nhỏ hơn 1)
    },

},
    {
        timestamps: true
    }
);

// Tạo một Compound Index (Index kết hợp) bao gồm userId, restaurantId và itemId với ràng buộc duy nhất (unique: true)
// Mục đích: Đảm bảo cùng một người dùng trong cùng một nhà hàng không bị trùng lặp bản ghi cho cùng một món ăn,
// từ đó giúp dễ dàng tăng giảm số lượng (quantity) thay vì tạo ra nhiều dòng dữ liệu cho cùng 1 món.
schema.index({ userId: 1, restaurantId: 1, itemId: 1 }, { unique: true });

export default mongoose.model<ICart>("Cart", schema);