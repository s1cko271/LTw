// Quản lý xác thực người dùng cho Daily Quest Hub

// Khởi tạo biến người dùng hiện tại
let currentUser = null;

// Tạo đối tượng authManager để quản lý xác thực và thông tin người dùng
window.authManager = {
    // Lấy thông tin người dùng hiện tại
    getCurrentUser: function() {
        return currentUser;
    },
    
    // Khởi tạo thông tin người dùng từ token
    initUser: async function() {
        const token = apiManager.getToken();
        if (token) {
            try {
                currentUser = await apiManager.user.getProfile();
                return currentUser;
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                apiManager.removeToken();
                return null;
            }
        }
        return null;
    },
    
    // Cập nhật thông tin người dùng
    updateUserInfo: async function(updatedInfo) {
        if (!currentUser) return false;
        
        try {
            // Gọi API cập nhật thông tin người dùng
            currentUser = await apiManager.user.updateProfile(updatedInfo);
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin người dùng:', error);
            return false;
        }
    },
    
    // Xử lý đăng xuất
    handleLogout: function() {
        // Xóa thông tin người dùng hiện tại và token
        currentUser = null;
        apiManager.user.logout();
        
        // Cập nhật UI
        updateNavigation();
        
        // Chuyển hướng đến trang chủ
        window.location.href = 'index.html';
    },
    
    // Thêm XP cho người dùng hiện tại
    addUserXP: async function(xpAmount) {
        if (!currentUser) return;
        
        try {
            // Gọi API thêm XP cho người dùng
            const result = await apiManager.user.addXP(xpAmount);
            currentUser = result.user;
            
            // Kiểm tra lên cấp
            checkLevelUp();
            
            return currentUser;
        } catch (error) {
            console.error('Lỗi khi thêm XP cho người dùng:', error);
        }
    }
};

// Kiểm tra trạng thái đăng nhập khi trang web được tải
document.addEventListener('DOMContentLoaded', async function() {
    // Khởi tạo thông tin người dùng từ token
    await authManager.initUser();
    
    // Cập nhật UI dựa trên trạng thái đăng nhập
    updateNavigation();
    
    // Kiểm tra và chuyển hướng người dùng dựa trên trạng thái đăng nhập
    checkAuthAndRedirect();
    
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
        logoutBtn.addEventListener('click', authManager.handleLogout);
    }
    
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            authManager.handleLogout();
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
        // Gọi API đăng ký
        const userData = {
            username,
            email,
            password,
            confirmPassword
        };
        
        // Sử dụng API để đăng ký
        currentUser = await apiManager.user.register(userData);
        
        // Hiển thị thông báo thành công
        alert('Đăng ký thành công!');
        
        // Cập nhật UI
        updateNavigation();
        
        // Chuyển hướng đến trang chủ
        window.location.href = 'index.html';
    } catch (error) {
        // Hiển thị thông báo lỗi
        alert(error.message || 'Đăng ký thất bại!');
        console.error(error);
    }
}

// Xử lý đăng nhập
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    try {
        // Sử dụng API để đăng nhập
        currentUser = await apiManager.user.login(email, password);
        
        // Hiển thị thông báo thành công
        alert('Đăng nhập thành công!');
        
        // Cập nhật UI
        updateNavigation();
        
        // Chuyển hướng đến trang chủ
        window.location.href = 'index.html';
    } catch (error) {
        // Hiển thị thông báo lỗi
        alert(error.message || 'Email hoặc mật khẩu không đúng!');
        console.error(error);
    }
}

// Kiểm tra trạng thái đăng nhập và chuyển hướng người dùng phù hợp
function checkAuthAndRedirect() {
    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;
    
    // Các trang không yêu cầu đăng nhập
    const publicPages = ['login.html', 'register.html', 'landing.html'];
    
    // Kiểm tra xem đường dẫn hiện tại có phải là trang công khai không
    const isPublicPage = publicPages.some(page => currentPath.includes(page));
    
    // Nếu người dùng chưa đăng nhập và đang ở trang index.html hoặc các trang yêu cầu đăng nhập
    if (!currentUser && !isPublicPage) {
        // Chuyển hướng đến trang landing
        window.location.href = 'landing.html';
        return;
    }
    
    // Nếu người dùng đã đăng nhập và đang ở trang landing, login hoặc register
    if (currentUser && isPublicPage) {
        // Chuyển hướng đến trang chủ
        window.location.href = 'index.html';
        return;
    }
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