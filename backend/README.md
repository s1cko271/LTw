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

## Tích hợp với Frontend

Để tích hợp backend với frontend hiện có, bạn cần thực hiện các bước sau:

### 1. Cập nhật file auth.js

Thay thế việc sử dụng localStorage bằng các API calls đến backend:

```javascript
// Ví dụ cập nhật hàm đăng ký
async function handleRegister(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Kiểm tra mật khẩu xác nhận
  if (password !== confirmPassword) {
    alert('Mật khẩu xác nhận không khớp!');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, confirmPassword })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert(data.message || 'Đăng ký thất bại!');
      return;
    }
    
    // Lưu token vào localStorage
    localStorage.setItem('daily-quest-token', data.token);
    localStorage.setItem('daily-quest-current-user', JSON.stringify(data.data.user));
    
    // Cập nhật UI
    currentUser = data.data.user;
    updateNavigation();
    
    // Chuyển hướng đến trang chủ
    window.location.href = 'index.html';
  } catch (error) {
    alert('Có lỗi xảy ra khi đăng ký!');
    console.error(error);
  }
}
```

### 2. Cập nhật các hàm xử lý nhiệm vụ

Thay thế việc lưu trữ nhiệm vụ trong localStorage bằng các API calls đến backend:

```javascript
// Ví dụ hàm tạo nhiệm vụ mới
async function createQuest(questData) {
  try {
    const token = localStorage.getItem('daily-quest-token');
    
    if (!token) {
      alert('Bạn cần đăng nhập để tạo nhiệm vụ!');
      return null;
    }
    
    const response = await fetch('http://localhost:5000/api/quests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(questData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert(data.message || 'Tạo nhiệm vụ thất bại!');
      return null;
    }
    
    return data.data.quest;
  } catch (error) {
    alert('Có lỗi xảy ra khi tạo nhiệm vụ!');
    console.error(error);
    return null;
  }
}
```

### 3. Cập nhật hàm xử lý thành tích

Thay thế việc lưu trữ thành tích trong localStorage bằng các API calls đến backend:

```javascript
// Ví dụ hàm lấy danh sách thành tích
async function getAchievements() {
  try {
    const token = localStorage.getItem('daily-quest-token');
    
    if (!token) {
      return [];
    }
    
    const response = await fetch('http://localhost:5000/api/achievements', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(data.message || 'Lấy thành tích thất bại!');
      return [];
    }
    
    return data.data.achievements;
  } catch (error) {
    console.error('Có lỗi xảy ra khi lấy thành tích!');
    console.error(error);
    return [];
  }
}
```

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