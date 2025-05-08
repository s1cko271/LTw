# Daily Quest Hub - Backend

## Giới thiệu

Đây là phần backend cho ứng dụng Daily Quest Hub, được xây dựng bằng Node.js, Express và MongoDB. Backend cung cấp các API để quản lý người dùng, nhiệm vụ và thành tích.

## Cài đặt

1. Cài đặt các gói phụ thuộc:
   ```
   cd backend
   npm install
   ```
2. Cấu hình các biến môi trường trong file `.env`:
   - Cấu hình chuỗi kết nối MongoDB
   - Cấu hình JWT secret key
   - Cấu hình CORS origin

## Khởi động server

```
npm run dev
```

Server sẽ chạy trên cổng 5000.

## API Endpoints

### Người dùng
- `POST /api/users/register` - Đăng ký người dùng mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/me` - Lấy thông tin người dùng hiện tại
- `PATCH /api/users/updateMe` - Cập nhật thông tin người dùng
- `PATCH /api/users/updatePassword` - Cập nhật mật khẩu
- `POST /api/users/addXP` - Thêm XP cho người dùng

### Nhiệm vụ
- `GET /api/quests` - Lấy tất cả nhiệm vụ của người dùng
- `POST /api/quests` - Tạo nhiệm vụ mới
- `GET /api/quests/:id` - Lấy thông tin một nhiệm vụ
- `PATCH /api/quests/:id` - Cập nhật nhiệm vụ
- `DELETE /api/quests/:id` - Xóa nhiệm vụ
- `PATCH /api/quests/:id/progress` - Cập nhật tiến độ nhiệm vụ
- `PATCH /api/quests/:id/complete` - Đánh dấu nhiệm vụ hoàn thành

### Thành tích
- `GET /api/achievements` - Lấy tất cả thành tích của người dùng
- `GET /api/achievements/:id` - Lấy thông tin một thành tích
- `GET /api/achievements/category/:category` - Lấy thành tích theo danh mục
