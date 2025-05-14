// Xử lý hiển thị thanh điều hướng dựa trên trạng thái đăng nhập

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
});

// Cập nhật thanh điều hướng dựa trên trạng thái đăng nhập
function updateNavbar() {
    const authData = getAuthData();
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    
    if (authData && authData.token) {
        // Người dùng đã đăng nhập
        if (profileLink) profileLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'inline-block';
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
    } else {
        // Người dùng chưa đăng nhập
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
    }
}

// Lấy thông tin người dùng đã đăng nhập từ auth.js
function getAuthData() {
    const AUTH_KEY = 'daily_quest_hub_secret_key';
    const authData = localStorage.getItem(AUTH_KEY);
    return authData ? JSON.parse(authData) : null;
}