# Hướng dẫn kiểm tra và khắc phục vấn đề kết nối API

## Vấn đề hiện tại

Dựa vào hình ảnh được cung cấp, có thể thấy lỗi "Cannot GET /api" khi truy cập vào địa chỉ `localhost:5000/api`. Điều này cho thấy server backend có thể chưa được khởi động hoặc có vấn đề với cấu hình API.

## Các thay đổi đã thực hiện

1. Đã cập nhật các đường dẫn API trong file `auth.js` để phù hợp với cấu trúc backend thực tế:
   - Thay đổi từ `/auth/verify` thành `/users/me`
   - Thay đổi từ `/auth/login` thành `/users/login`
   - Thay đổi từ `/auth/register` thành `/users/register`
   - Thay đổi từ `/auth/logout` thành `/users/logout`

2. Đã tạo hai trang HTML để kiểm tra kết nối API:
   - `api-test.html`: Công cụ kiểm tra đầy đủ các endpoint API
   - `check-api-connection.html`: Công cụ đơn giản để kiểm tra kết nối cơ bản

## Cách khắc phục vấn đề

### 1. Khởi động server backend

Để khởi động server backend, hãy thực hiện các bước sau:

```bash
# Di chuyển đến thư mục backend
cd "D:\Downloads\Du an\LTw-main\LTw\backend"

# Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# Khởi động server
npm start
```

### 2. Kiểm tra cấu hình MongoDB

Đảm bảo MongoDB đã được cài đặt và đang chạy. Kiểm tra file `.env` trong thư mục backend có chứa thông tin kết nối MongoDB đúng không:

```
MONGODB_URI=mongodb://localhost:27017/daily-quest-hub
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
PORT=5000
```

### 3. Kiểm tra kết nối API

Sau khi khởi động server backend, mở file `check-api-connection.html` trong trình duyệt để kiểm tra kết nối API. Nếu kết nối thành công, bạn sẽ thấy thông báo "Kết nối thành công! Server API đang hoạt động."

### 4. Kiểm tra chi tiết các endpoint API

Sử dụng file `api-test.html` để kiểm tra chi tiết từng endpoint API. Công cụ này sẽ giúp bạn xác định chính xác endpoint nào đang gặp vấn đề.

## Cấu trúc API

Dựa trên mã nguồn, API của Daily Quest Hub có cấu trúc như sau:

### Người dùng
- `POST /api/users/register` - Đăng ký người dùng mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/me` - Lấy thông tin người dùng hiện tại
- `PATCH /api/users/updateMe` - Cập nhật thông tin người dùng
- `PATCH /api/users/updatePassword` - Cập nhật mật khẩu
- `POST /api/users/addXP` - Thêm XP cho người dùng

### Nhiệm vụ
- `GET /api/quests` - Lấy tất cả nhiệm vụ
- `GET /api/quests/:id` - Lấy thông tin một nhiệm vụ
- `POST /api/quests` - Tạo nhiệm vụ mới
- `PATCH /api/quests/:id` - Cập nhật nhiệm vụ
- `DELETE /api/quests/:id` - Xóa nhiệm vụ
- `PATCH /api/quests/:id/progress` - Cập nhật tiến độ nhiệm vụ
- `PATCH /api/quests/:id/complete` - Đánh dấu nhiệm vụ hoàn thành

### Thành tích
- `GET /api/achievements` - Lấy tất cả thành tích
- `GET /api/achievements/:id` - Lấy thông tin một thành tích
- `GET /api/achievements/category/:category` - Lấy thành tích theo danh mục

## Lưu ý quan trọng

Nếu sau khi thực hiện các bước trên mà vẫn gặp vấn đề, hãy kiểm tra:

1. Cổng (port) 5000 có đang được sử dụng bởi ứng dụng khác không
2. Tường lửa có đang chặn kết nối không
3. Các lỗi trong console của trình duyệt
4. Log của server backend để xem chi tiết lỗi

Nếu cần thiết, bạn có thể thay đổi cổng trong file `.env` và cập nhật lại URL API trong các file frontend tương ứng.