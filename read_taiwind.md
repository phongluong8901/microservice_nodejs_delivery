1. Các class trong Login.tsx
flex: Bật kiểu hiển thị Flexbox.

min-h-screen: Chiều cao tối thiểu bằng 100% màn hình (100vh).

items-center / justify-center: Canh giữa các phần tử con theo trục dọc và ngang.

bg-white: Màu nền trắng.

px-4: Khoảng cách đệm (padding) bên trái và phải 1rem (~16px).

w-full: Chiều rộng 100%.

max-w-sm: Giới hạn chiều rộng tối đa ở kích thước small (~384px).

space-y-6: Tạo khoảng cách đều theo chiều dọc giữa các phần tử con là 1.5rem (~24px).

text-center: Canh chữ ra giữa.

text-3xl / text-sm / text-xs: Cỡ chữ lớn (30px), chữ nhỏ, hoặc chữ cực nhỏ.

font-bold: Độ đậm của chữ (bold).

gap-3: Khoảng cách giữa các phần tử bên trong flex là 0.75rem (~12px).

rounded-xl: Bo góc viền ngoại cỡ (extra-large).

border / border-gray-300: Thiết lập khung viền với màu xám nhạt.

py-3: Khoảng cách đệm trên và dưới 0.75rem.

2. Các class trong Restaurant.tsx
bg-gray-50: Màu nền xám cực nhạt.

py-6: Khoảng cách đệm trên và dưới 1.5rem.

rounded-xl: Bo góc viền.

shadow-sm: Đổ bóng nhẹ cho khối.

border-b: Tạo đường viền ở cạnh dưới.

flex-1: Chia đều không gian cho các phần tử trong flex container.

border-b-2 / border-red-500: Viền dưới dày 2px với màu đỏ chủ đạo.

transition: Tạo hiệu ứng chuyển động mượt mà khi thay đổi trạng thái (hover, active).

hover:text-gray-700: Đổi màu chữ sang xám đậm hơn khi di chuột vào.

3. Các class trong SelectRole.tsx
text-2xl: Cỡ chữ lớn vừa (~24px).

space-y-4: Khoảng cách dọc giữa các nút là 1rem.

capitalize: Viết hoa chữ cái đầu tiên của từ.

hover:bg-gray-50: Đổi màu nền sang xám rất nhạt khi rê chuột vào.

bg-[#E23744] / text-white: Dùng mã màu HEX tùy chỉnh cho nền và chữ trắng.

bg-gray-200 / text-gray-400 / cursor-not-allowed: Thiết lập giao diện nút khi bị vô hiệu hóa (disabled) với nền xám, chữ mờ và con trỏ hình dấu cấm.


1. Các class trong AddMenuItem.tsx
max-w-md: Giới hạn chiều rộng tối đa ở kích thước medium (~448px).

space-y-4: Khoảng cách đều theo chiều dọc giữa các phần tử con là 1rem (~16px).

m-auto: Canh giữa tự động theo cả chiều ngang và dọc (margin: auto).

w-full: Chiều rộng 100%.

rounded-lg: Bo góc viền cỡ lớn vừa (0.5rem).

border: Tạo đường viền cho khung.

px-4 / py-2: Khoảng cách đệm trái/phải (1rem) và trên/dưới (0.5rem).

text-sm / text-lg: Cỡ chữ nhỏ (14px) và chữ lớn (18px).

outline-none: Loại bỏ viền xanh mặc định khi bấm vào ô input/textarea.

flex: Bật kiểu hiển thị Flexbox.

cursor-poniter (lưu ý viết chính tả): Đổi con trỏ chuột thành dạng bàn tay.

items-center: Canh giữa các phần tử theo trục dọc.

gap-3: Khoảng cách giữa các phần tử flex là 0.75rem (~12px).

p-4: Khoảng cách đệm xung quanh 1rem (~16px).

text-gray-600: Màu chữ xám.

hover:bg-gray-50: Đổi màu nền sang xám rất nhạt khi rê chuột.

bg-[#e23744]: Dùng mã màu HEX tùy chỉnh cho nền đỏ.

text-white: Màu chữ trắng.

font-semibold: Độ đậm chữ trung bình (semi-bold).

2. Các class trong Addrestaurant.tsx
min-h-screen: Chiều cao tối thiểu bằng 100vh (toàn màn hình).

bg-gray-50: Màu nền xám cực nhạt.

px-4 / py-6: Khoảng cách đệm ngang (1rem) và dọc (1.5rem).

mx-auto: Canh giữa theo chiều ngang.

max-w-lg: Giới hạn chiều rộng tối đa ở kích thước large (~512px).

rounded-xl: Bo góc viền ngoại cỡ (0.75rem).

bg-white: Màu nền trắng.

p-6: Khoảng cách đệm xung quanh 1.5rem.

shadow-sm: Đổ bóng nhẹ.

space-y-5: Khoảng cách dọc giữa các phần tử là 1.25rem.

text-xl: Cỡ chữ lớn (~20px).

mt-0.5: Khoảng cách lề trên nhỏ (0.125rem).

truncate: Cắt ngắn văn bản tràn bằng dấu ba chấm (...).

3. Các class trong MenuItems.tsx
grid: Bật kiểu hiển thị lưới (Grid).

grid-cols-1: Mặc định hiển thị 1 cột trên màn hình nhỏ.

sm:grid-cols-2: Từ màn hình small trở lên hiển thị 2 cột.

md:grid-cols-3: Từ màn hình medium trở lên hiển thị 3 cột.

lg:grid-cols-4: Từ màn hình large trở lên hiển thị 4 cột.

gap-4: Khoảng cách giữa các ô trong lưới là 1rem.

relative: Thiết lập vị trí tương đối (làm gốc tọa độ cho phần tử con tuyệt đối).

flex: Bật Flexbox.

transition: Tạo hiệu ứng chuyển động mượt mà.

opacity-70: Giảm độ mờ xuống 70% (khi món ăn không khả dụng).

shrink-0: Ngăn không cho phần tử co lại trong flex container.

h-20 / w-20: Chiều cao và chiều rộng cố định 5rem (~80px).

rounded: Bo góc viền cơ bản.

object-cover: Cắt và phóng to ảnh để lấp đầy khung mà không méo hình.

grayscale: Chuyển ảnh sang dạng trắng đen.

brightness-75: Giảm độ sáng của ảnh xuống 75%.

absolute: Định vị tuyệt đối đè lên trên phần tử cha.

inset-0: Trải dài toàn bộ kích thước phần tử cha (top:0, right:0, bottom:0, left:0).

bg-black/60: Màu nền đen với độ trong suốt 60%.

text-xs: Cỡ chữ cực nhỏ (12px).

flex-1: Chia đều không gian trống.

flex-col: Xếp các phần tử con theo chiều dọc.

justify-between: Canh các phần tử cách đều nhau (đẩy ra hai đầu).

line-clamp-2: Giới hạn hiển thị văn bản tối đa 2 dòng, phần thừa tự động thêm dấu ....

font-medium: Độ đậm chữ mức trung bình.

hover:bg-gray-100: Đổi màu nền xám nhạt khi rê chuột.

animate-spin: Tạo hiệu ứng xoay tròn liên tục (cho icon loading).

hover:bg-red-50: Đổi màu nền sang đỏ nhạt khi rê chuột.

cursor-not-allowed: Đổi con trỏ chuột thành hình dấu cấm.

text-gray-400: Màu chữ xám mờ

4. Các class trong Navbar.tsx
w-full: Chiều rộng 100%.

bg-white: Màu nền trắng.

shadow-sm: Đổ bóng nhẹ.

max-w-7xl: Giới hạn chiều rộng tối đa lớn (~1280px).

items-center: Canh giữa theo trục dọc.

justify-between: Canh đều hai đầu.

px-4 / py-3: Khoảng cách đệm ngang và dọc.

text-2xl: Cỡ chữ lớn (~24px).

font-bold: Chữ in đậm.

text-[#E23744]: Màu chữ mã HEX đỏ đặc trưng.

cursor-pointer: Đổi con trỏ thành hình bàn tay khi bấm.

relative: Đặt khung tham chiếu định vị cho huy hiệu số lượng.

h-6 / w-6 / h-5 / w-5: Kích thước cố định cho icon.

-top-2 / -right-2: Dịch chuyển vị trí vượt ra ngoài khung biên trên và phải.

rounded-full: Bo tròn hoàn toàn (tạo hình vòng tròn số lượng giỏ hàng).

border-t: Viền mảnh ở cạnh trên.

border-r: Viền mảnh ở cạnh phải.

text-gray-700: Màu chữ xám đậm.

max-w-35: Giới hạn chiều rộng tối đa (35 đơn vị tailwind).


5. Các class trong RestaurantCard.tsx
overflow-hidden: Ẩn phần nội dung bị tràn ra ngoài khung (giúp bo góc ảnh khớp với khung).

hover:shadow-md: Tăng mức độ đổ bóng khi rê chuột vào thẻ.

h-40: Chiều cao cố định 10rem (~160px).

duration-300: Thời gian chạy hiệu ứng chuyển động trong 300ms.

hover:scale-105: Phóng to kích thước lên 105% khi rê chuột.

pointer-events-none: Vô hiệu hóa mọi thao tác chuột đi xuyên qua lớp phủ.

6. Các class trong RestaurantProfile.tsx
max-w-xl: Giới hạn chiều rộng tối đa ở mức extra-large (~576px).

h-48: Chiều cao cố định 12rem (~192px).

p-5: Khoảng cách đệm xung quanh 1.25rem.

pt-3: Khoảng cách đệm phía trên 0.75rem.

text-green-600 / text-red-500: Màu chữ xanh lá (mở cửa) và đỏ (đóng cửa).

bg-blue-600 / hover:bg-blue-700: Màu nền nút xanh dương và đổi màu đậm hơn khi rê chuột.

text-xs: Cỡ chữ cực nhỏ (10-12px).

text-gray-400: Màu chữ xám nhạt.








