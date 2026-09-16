import express from 'express';
import cloudinary from 'cloudinary';

// Khởi tạo một router mới từ Express để định nghĩa các tuyến đường (routes
const router = express.Router();

router.post("/upload", async (req, res) => {
    try {
        // Lấy ra thuộc tính `buffer` từ body của request gửi lên client
        const { buffer } = req.body
        // Gọi thư viện Cloudinary (phiên bản v2) để upload buffer ảnh lên cloud
        const cloud = await cloudinary.v2.uploader.upload(buffer);

        res.json({
            url: cloud.secure_url
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
        });
    }
});

export default router;