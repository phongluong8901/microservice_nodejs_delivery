// Import thư viện multer dùng để xử lý dữ liệu dạng multipart/form-data (dùng khi upload file)
import multer from "multer";

// Cấu hình lưu trữ tệp tạm thời trong bộ nhớ RAM (Memory Storage) thay vì lưu ngay xuống ổ cứng của server.
// Việc này giúp dễ dàng chuyển đổi buffer trực tiếp sang chuỗi Base64 / Data URI để đẩy lên Cloudinary một cách nhanh chóng.
const storage = multer.memoryStorage();

// Khởi tạo middleware `uploadFile` bằng cách sử dụng cấu hình memoryStorage ở trên, 
// đồng thời gọi `.single("file")` để chỉ định rằng server sẽ chỉ chấp nhận nhận **một** file duy nhất được truyền lên thông qua trường form-data có tên là "file".
const uploadFile = multer({ storage }).single("file");

// Xuất middleware này ra để gắn vào các tuyến đường (routes) cần xử lý upload ảnh (ví dụ: route tạo nhà hàng, cập nhật avatar,...)
export default uploadFile;