import mongoose, { Document, Schema } from "mongoose";

// Định nghĩa TypeScript Interface (IUser) để mô tả cấu trúc kiểu dữ liệu của một Document User khi code trong TS
export interface IUser extends Document {
    name: string;
    email: string;
    image: string;
    role: string;
}

// Khởi tạo một Mongoose Schema mới gắn với interface IUser để định nghĩa cấu trúc dữ liệu lưu trong MongoDB
const schema: Schema<IUser> = new Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,   // Đảm bảo email không bị trùng lặp trong cơ sở dữ liệu
    },
    image: String,
    role: {
        type: String,
        default: null,
    },
},
    {
        timestamps: true, // Tự động tạo và quản lý hai trường 'createdAt' (ngày tạo) và 'updatedAt' (ngày cập nhật gần nhất)
    }
);

// Tạo một Mongoose Model từ Schema để tương tác với collection 'users' trong database
// Model này sẽ được dùng để query, create, update, delete documents trong collection 'users'
const User = mongoose.model<IUser>("User", schema);

export default User;