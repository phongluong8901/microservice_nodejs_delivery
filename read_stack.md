# --- lib
express: Framework web phổ biến và cốt lõi nhất cho Node.js, giúp bạn dễ dàng xây dựng RESTful APIs, định tuyến (routing) và quản lý middleware.

dotenv: Thư viện giúp tải các biến môi trường từ file .config hoặc .env vào trong process.env để bảo mật thông tin nhạy cảm (như mật khẩu database, API key).

mongoose: Thư viện ODM (Object Data Modeling) dành cho MongoDB và Node.js, giúp định nghĩa Schema, quản lý collection và thao tác với cơ sở dữ liệu dễ dàng hơn thông qua các đối tượng JavaScript.

axios: Thư viện HTTP client dựa trên Promise, dùng để gửi các yêu cầu (requests) HTTP/HTTPS từ server của bạn sang các API bên ngoài hoặc giao tiếp giữa các microservices với nhau.

cors: Middleware của Express giúp cấu hình cơ chế Chia sẻ tài nguyên giữa các nguồn gốc khác nhau (Cross-Origin Resource Sharing), cho phép frontend (ví dụ chạy ở cổng 3000) gọi API đến backend (chạy ở cổng khác) mà không bị chặn.

jsonwebtoken (thường viết tắt là JWT): Thư viện dùng để tạo (sign) và xác thực (verify) JSON Web Tokens, phục vụ cho việc quản lý xác thực người dùng (Authentication) qua cơ chế token.

multer: Middleware của Express chuyên dùng để xử lý dữ liệu dạng multipart/form-data, hỗ trợ cực tốt cho việc tải file (upload images, documents) từ phía client lên server.

datauri: Thư viện giúp chuyển đổi dữ liệu file nhị phân (buffer) nhận được từ multer thành chuỗi chuẩn Data URI (dạng base64), thường dùng trước khi đẩy ảnh lên các dịch vụ đám mây như Cloudinary.

googleapis: Thư viện chính thức của Google, cung cấp các công cụ để tích hợp các API của Google như Google OAuth 2.0, Google Drive, Google Maps,...

# --- stack

# --- more

The application supports multiple roles:
• Customer
• Restaurant (Seller)
• Delivery Partner (Rider)
• Admin (Verification & Management)

The backend is divided into 6 independent microservices:
• Auth Service
• Restaurant Service
• Rider Service
• Admin Service
• Realtime Service (Socket.IO)
• Utils Service (File Uploads & Payments)

For communication between services, RabbitMQ is used as a message broker and is deployed on AWS using Docker.

Real-time features include:
• Live order status updates
• Real-time rider location tracking
• Navigation for riders to delivery locations
• Customers can track the delivery partner live on the map
• Sound notifications for order received and delivery accepted

Payments are handled using two gateways:
• Razorpay (for Indian users)
• Stripe (for global users)

The entire project is dockerized and deployed:
• Backend microservices on Render
• Frontend on Vercel

This project is perfect for developers who want to learn:
• Microservices architecture in Node.js
• Real-time systems using Socket.IO
• Message queues using RabbitMQ
• Payment gateway integration
• Docker & production deployment
• How apps like Zomato work internally

# ---


