import express from 'express';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import cors from 'cors';
import uploadRoutes from './routes/cloudinary.js';

dotenv.config();

const app = express()

// Cho phép các service khác hoặc frontend gọi API vượt qua chính sách CORS
app.use(cors());

// Tăng giới hạn payload lên 50mb để đảm bảo khi client gửi file ảnh lớn (dạng chuỗi base64) lên server không bị lỗi "PayloadTooLargeError"
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;
if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
    throw new Error("Missing Cloudinary environment variables");
}

// Xác thực với Cloudinary bằng thông tin lấy từ .env
cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_SECRET_KEY,
});

app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Utils service is running on port ${PORT}`);
});