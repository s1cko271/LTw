// Quản lý xác thực người dùng cho Daily Quest Hub

// Khởi tạo dữ liệu người dùng từ localStorage hoặc tạo mảng rỗng nếu chưa có
let users = JSON.parse(localStorage.getItem('daily-quest-users')) || [];
let currentUser = JSON.parse(localStorage.getItem('daily-quest-current-user')) || null;

// Tạo đối tượng authManager để quản lý xác thực và thông tin người dùng
window.authManager = {
    // Lấy thông tin người dùng hiện tại
    getCurrentUser: function() {
        return currentUser;
    },
    
    // Cập nhật thông tin người dùng
    updateUserInfo: function(updatedInfo) {
        if (!currentUser) return false;
        
        // Cập nhật thông tin người dùng
        Object.assign(currentUser, updatedInfo);
        
        // Cập nhật trong mảng users
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            
            // Lưu vào localStorage
            localStorage.setItem('daily-quest-users', JSON.stringify(users));
            localStorage.setItem('daily-quest-current-user', JSON.stringify(currentUser));
            
            return true;
        }
        
        return false;
    },
    
    // Xử lý đăng xuất
    handleLogout: function() {
        // Xóa thông tin người dùng hiện tại
        currentUser = null;
        localStorage.removeItem('daily-quest-current-user');
        
        // Cập nhật UI
        updateNavigation();
        
        // Chuyển hướng đến trang chủ
        window.location.href = 'index.html';
    },
    
    // Thêm XP cho người dùng hiện tại
    addUserXP: function(xpAmount) {
        if (!currentUser) return;
        
        currentUser.xp += xpAmount;
        
        // Kiểm tra lên cấp
        checkLevelUp();
        
        // Cập nhật trong mảng users
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            
            // Lưu vào localStorage
            localStorage.setItem('daily-quest-users', JSON.stringify(users));
            localStorage.setItem('daily-quest-current-user', JSON.stringify(currentUser));
        }
    }
};

// Kiểm tra trạng thái đăng nhập khi trang web được tải
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Xử lý form đăng ký nếu đang ở trang đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Xử lý form đăng nhập nếu đang ở trang đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Xử lý nút đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Nếu đang ở trang profile, kiểm tra xem người dùng đã đăng nhập chưa
    if (window.location.pathname.includes('profile.html') && !currentUser) {
        window.location.href = 'login.html';
    }
});

// Cập nhật hiển thị thanh điều hướng dựa trên trạng thái đăng nhập
function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const profileLink = document.getElementById('profile-link');
    
    if (currentUser) {
        // Người dùng đã đăng nhập
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'block';
    } else {
        // Người dùng chưa đăng nhập
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Xử lý đăng ký người dùng mới
function handleRegister(e) {
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
    
    // Kiểm tra email đã tồn tại chưa
    if (users.some(user => user.email === email)) {
        alert('Email này đã được sử dụng!');
        return;
    }
    
    // Tạo người dùng mới
    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        password: password, // Trong ứng dụng thực tế, cần mã hóa mật khẩu
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        streak: 0,
        quests: [],
        achievements: []
    };
    
    // Thêm người dùng vào mảng và lưu vào localStorage
    users.push(newUser);
    localStorage.setItem('daily-quest-users', JSON.stringify(users));
    
    // Đăng nhập người dùng mới
    currentUser = newUser;
    localStorage.setItem('daily-quest-current-user', JSON.stringify(currentUser));
    
    // Chuyển hướng đến trang chủ
    window.location.href = 'index.html';
}

// Xử lý đăng nhập
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Tìm người dùng với email đã nhập
    const user = users.find(user => user.email === email);
    
    // Kiểm tra người dùng và mật khẩu
    if (!user || user.password !== password) {
        alert('Email hoặc mật khẩu không đúng!');
        return;
    }
    
    // Đăng nhập thành công
    currentUser = user;
    localStorage.setItem('daily-quest-current-user', JSON.stringify(currentUser));
    
    // Chuyển hướng đến trang chủ
    window.location.href = 'index.html';
}

// Xử lý đăng xuất
function handleLogout() {
    // Xóa thông tin người dùng hiện tại
    currentUser = null;
    localStorage.removeItem('daily-quest-current-user');
    
    // Cập nhật UI
    updateNavigation();
    
    // Chuyển hướng đến trang chủ
    window.location.href = 'index.html';
}

// Lấy thông tin người dùng hiện tại
function getCurrentUser() {
    return currentUser;
}

// Cập nhật thông tin người dùng
function updateUserInfo(updatedInfo) {
    if (!currentUser) return false;
    
    // Cập nhật thông tin người dùng
    Object.assign(currentUser, updatedInfo);
    
    // Cập nhật trong mảng users
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        
        // Lưu vào localStorage
        localStorage.setItem('daily-quest-users', JSON.stringify(users));
        localStorage.setItem('daily-quest-current-user', JSON.stringify(currentUser));
        
        return true;
    }
    
    return false;
}

// Thêm XP cho người dùng hiện tại
function addUserXP(xpAmount) {
    if (!currentUser) return;
    
    currentUser.xp += xpAmount;
    
    // Kiểm tra lên cấp
    checkLevelUp();
    
    // Cập nhật trong mảng users
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        
        // Lưu vào localStorage
        localStorage.setItem('daily-quest-users', JSON.stringify(users));
        localStorage.setItem('daily-quest-current-user', JSON.stringify(currentUser));
    }
}

// Kiểm tra và xử lý lên cấp
function checkLevelUp() {
    if (!currentUser) return;
    
    // Công thức tính XP cần thiết để lên cấp: level * 100
    const xpNeeded = currentUser.level * 100;
    
    if (currentUser.xp >= xpNeeded) {
        currentUser.level += 1;
        currentUser.xp -= xpNeeded;
        
        // Thêm thành tích lên cấp
        const achievement = {
            id: Date.now().toString(),
            title: `Đạt cấp độ ${currentUser.level}`,
            description: `Bạn đã đạt đến cấp độ ${currentUser.level}!`,
            icon: 'fa-trophy',
            date: new Date().toISOString()
        };
        
        if (!currentUser.achievements) {
            currentUser.achievements = [];
        }
        
        currentUser.achievements.push(achievement);
        
        // Kiểm tra tiếp nếu XP vẫn đủ để lên cấp tiếp
        checkLevelUp();
    }
}

// Xuất các hàm để sử dụng trong các file JS khác
window.authManager = {
    getCurrentUser,
    updateUserInfo,
    addUserXP,
    handleLogout
};