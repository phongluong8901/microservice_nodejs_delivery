import DataUriParser from "datauri/parser.js";
import path from 'path';

// Khai báo một hàm helper tên là `getBuffer` nhận vào tham số `file` (được lấy từ multer middleware)
const getBuffer = (file: any) => {
    // Khởi tạo một thể hiện (instance) mới của DataUriParser
    const parser = new DataUriParser();

    // Lấy phần mở rộng của file gốc (ví dụ: .jpg, .png, .jpeg) từ thuộc tính `file.originalname` và chuyển thành dạng chuỗi
    const extName = path.extname(file.originalname).toString()

    // Gọi phương thức `format` của parser để kết hợp phần mở rộng (`extName`) và dữ liệu nhị phân (`file.buffer`), 
    // từ đó tạo ra một chuỗi Data URI chuẩn (ví dụ: "data:image/jpeg;base64,...") sẵn sàng đẩy lên Cloudinary
    return parser.format(extName, file.buffer);
};

export default getBuffer;