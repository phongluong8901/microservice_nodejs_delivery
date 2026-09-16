import mongoose, { Schema } from "mongoose";
// Khởi tạo một Mongoose Schema mới gắn với interface IUser để định nghĩa cấu trúc dữ liệu lưu trong MongoDB
const schema = new Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true, // Đảm bảo email không bị trùng lặp trong cơ sở dữ liệu
    },
    image: String,
    role: {
        type: String,
        default: null,
    },
}, {
    timestamps: true, // Tự động tạo và quản lý hai trường 'createdAt' (ngày tạo) và 'updatedAt' (ngày cập nhật gần nhất)
});
// Tạo một Mongoose Model từ Schema để tương tác với collection 'users' trong database
// Model này sẽ được dùng để query, create, update, delete documents trong collection 'users'
const User = mongoose.model("User", schema);
export default User;
