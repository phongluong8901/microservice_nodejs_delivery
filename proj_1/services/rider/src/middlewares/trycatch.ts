import { Request, Response, RequestHandler, NextFunction } from "express";

// Định nghĩa một Higher-Order Function (Hàm bọc) tên là TryCatch nhận vào một controller handler và trả về một RequestHandler mới
const TryCatch = (handler: RequestHandler): RequestHandler => {
    // Trả về một hàm middleware bất đồng bộ (async function) chuẩn của Express
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (err: any) {
            console.error("X Rider Service Error:", err);
            res.status(500).json({
                message: err.message
            });
        }
    };
};

export default TryCatch;