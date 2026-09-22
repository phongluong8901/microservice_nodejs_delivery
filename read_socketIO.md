# ---
Luồng Thanh toán (Payment Flow)
Các bước hoạt động:
Người dùng bấm "Pay With Stripe" trên Frontend (Checkout.tsx):

Gọi API POST ${restaurantService}/api/order/new để tạo một bản ghi đơn hàng tạm thời trong cơ sở dữ liệu của Restaurant Service (với trạng thái chờ thanh toán). API này trả về orderId và tổng tiền amount.

Gọi Service thanh toán:

Frontend gọi tiếp POST ${utilsService}/api/payment/stripe/create kèm theo orderId.

Lấy thông tin từ Restaurant Service:

payWithStripe trong utils-service dùng axios.get kèm mã khóa bảo mật (x-internal-key) gọi sang Restaurant Service để lấy giá tiền (amount) chính xác của đơn hàng.

Tạo Stripe Session:

utils-service tạo một stripe.checkout.sessions.create với metadata: { orderId } và trả về url cho frontend.

Chuyển hướng (Redirect):

Frontend nhận url và thực hiện window.location.href = data.url để điều hướng người dùng sang cổng thanh toán bảo mật của Stripe.

# ---
Luồng Cập nhật trạng thái đơn hàng (Order Status & RabbitMQ Flow)

Luồng này hoạt động ngầm phía sau thông qua RabbitMQ khi người dùng thanh toán thành công, giúp cập nhật trạng thái đơn hàng mà không phụ thuộc vào việc client có gọi API xác thực hay không (giải quyết cả trường hợp Webhook của Stripe hoặc trang Return).

Các bước hoạt động:
Xác thực thanh toán thành công (verifyStripe):

Sau khi thanh toán ở Stripe, client được điều hướng về trang success (hoặc chạy hàm verifyStripe thông qua Session ID), utils-service gọi stripe.checkout.sessions.retrieve(sessionId) để kiểm tra tính hợp lệ và bóc tách orderId từ metadata.

Bắn sự kiện qua RabbitMQ:

utils-service gọi hàm publishPaymentSuccess để đẩy message dạng JSON vào RabbitMQ queue với cấu trúc:

JSON


{
    "type": "PAYMENT_SUCCESS",
    "data": {
        "orderId": "...",
        "paymentId": "...",
        "provider": "stripe"
    }
}
Restaurant Service nhận message:

Phía Restaurant Service có một RabbitMQ Consumer lắng nghe queue này. Khi nhận được tin nhắn PAYMENT_SUCCESS:

Tự động tìm đơn hàng dựa vào orderId.

Cập nhật trạng thái đơn hàng trong DB từ pending sang paid / placed (hoặc thông báo cho nhà hàng chuẩn bị món).

Phát sự kiện qua WebSocket (nếu có cấu hình Realtime Service) để đẩy thông báo màn hình quản lý đơn hàng của nhà hàng ngay lập tức.

# --- socket io
Tổng quan các thành phần tham gia
Client (Frontend React - OrderPage): Kết nối vào WebSocket Server để nghe thông báo thời gian thực.

Realtime Service: Chứa Socket.io Server, quản lý kết nối của các client và cung cấp endpoint nội bộ (/api/v1/internal/emit) để nhận lệnh phát sự kiện.

Restaurant Service: Chứa Business Logic (xử lý đơn hàng, kết nối RabbitMQ Consumer, gọi HTTP API sang Realtime Service).

1. Khởi tạo kết nối Socket
Khi người dùng mở trang web/ứng dụng, Client khởi tạo kết nối WebSocket kèm theo JWT Token qua socket.handshake.auth.token.

Realtime Service chạy Middleware xác thực (io.use):

Giải mã token bằng jwt.verify.

Lấy thông tin user._id và restaurantId (nếu user là chủ nhà hàng).

Sau khi xác thực thành công, client được tự động đưa vào các Room riêng biệt:

Join vào phòng cá nhân: user:{userId} (dùng để gửi thông báo riêng cho khách hàng đó).

Join vào phòng nhà hàng: restaurant:{restaurantId} (nếu là chủ quán, dùng để nhận đơn hàng mới).

2. Kích hoạt sự kiện từ Backend (Ví dụ: Thanh toán thành công hoặc Cập nhật trạng thái)

Khi có một hành động xảy ra ở Restaurant Service (ví dụ: Consumer nhận được message PAYMENT_SUCCESS từ RabbitMQ hoặc nhà hàng bấm cập nhật trạng thái đơn hàng trong updateOrderStatus):

Restaurant Service xử lý thay đổi dữ liệu trong MongoDB (cập nhật trạng thái đơn hàng thành placed, accepted,...).

Restaurant Service gọi HTTP POST sang Realtime Service thông qua endpoint nội bộ:

HTTP


POST ${process.env.REALTIME_SERVICE}/api/v1/internal/emit
Headers: x-internal-key: <INTERNAL_SERVICE_KEY>
Body: {
    "event": "order:update" (hoặc "order:new"),
    "room": "user:{userId}",
    "payload": { "orderId": "...", "status": "..." }
}
Realtime Service nhận request, kiểm tra khóa bảo mật x-internal-key. Nếu hợp lệ, nó gọi lệnh io.to(room).emit(event, payload) để đẩy thông báo tới phòng tương ứng trên WebSocket.

3. Client nhận thông báo và cập nhật giao diện (Realtime Update)

Client (OrderPage) đang mở trang chi tiết đơn hàng có gắn useEffect lắng nghe sự kiện:

TypeScript


socket.on("order:update", onOrderUpdate);
Ngay khi nhận được tín hiệu từ WebSocket Server, hàm onOrderUpdate được kích hoạt và gọi lại hàm fetchOrder().

Client gửi request HTTP GET lên Restaurant Service để lấy thông tin đơn hàng mới nhất.

Giao diện (OrderPage) được render lại (setOrder) ngay lập tức với trạng thái mới nhất mà không cần người dùng phải bấm nút F5 tải lại trang!

---
Tóm tắt ưu điểm của luồng này:
Bảo mật tuyệt đối: Các microservices liên lạc nội bộ với nhau qua x-internal-key, Client không thể tự ý gọi endpoint emit giả mạo.

Tách biệt trách nhiệm (Decoupled): Restaurant Service không giữ kết nối socket trực tiếp với hàng nghìn client mà ủy quyền việc đó cho Realtime Service thông qua cơ chế Pub/Sub / Internal HTTP API.

Realtime mượt mà: Khách hàng thấy ngay sự thay đổi trạng thái đơn hàng ngay khi chủ quán vừa bấm xác nhận.


# --- giai thich .md
