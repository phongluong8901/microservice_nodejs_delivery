// Định nghĩa một Higher-Order Function (Hàm bọc) tên là TryCatch nhận vào một controller handler và trả về một RequestHandler mới
const TryCatch = (handler) => {
    // Trả về một hàm middleware bất đồng bộ (async function) chuẩn của Express
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (err) {
            res.status(500).json({
                message: err.message
            });
        }
    };
};
export default TryCatch;
