import { Request, Response, NextFunction } from 'express';
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import { IUser } from '../model/User.js';
import { auth } from 'googleapis/build/src/apis/abusiveexperiencereport/index.js';

// Mở rộng interface Request gốc của Express thành AuthenticatedRequest để có thêm thuộc tính user
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;

}

// Định nghĩa hàm middleware isAuth dùng để kiểm tra tính hợp lệ của token trước khi cho phép đi tiếp vào controller
export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Lấy chuỗi header Authorization từ yêu cầu
        const authHeader = req.headers.authorization;

        // Kiểm tra xem header có tồn tại và bắt đầu bằng tiền tố "Bearer " hay không
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: "Please Login - No auth header",
            });
            return;
        }

        // Tách chuỗi theo dấu cách để lấy phần token phía sau chữ "Bearer"
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login - Token missing",
            });
            return;
        }

        // Xác thực tính hợp lệ của token bằng secret key
        const decodedValue = jwt.verify(
            token, process.env.JWT_SEC as string
        ) as JwtPayload;

        // Kiểm tra xem dữ liệu sau khi giải mã (payload) có chứa thông tin user hay không
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }
        //Gắn thông tin user vừa giải mã được vào đối tượng req để các controller phía sau có thể sử dụng
        req.user = decodedValue.user;
        // Cho phép request tiếp tục đi tới middleware tiếp theo hoặc controller chính
        next();
    } catch (error) {
        res.status(500).json({
            message: "Please Login - Jwt error",
        });
        return;
    }
}
