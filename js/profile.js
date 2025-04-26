// Quản lý trang hồ sơ người dùng cho Daily Quest Hub

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const currentUser = window.authManager.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Cập nhật thông tin hồ sơ
    updateProfileInfo(currentUser);
    
    // Xử lý chuyển tab
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa class active từ tất cả các tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Thêm class active cho tab được chọn
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Xử lý form cài đặt
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        // Điền thông tin hiện tại vào form
        document.getElementById('settings-username').value = currentUser.username;
        document.getElementById('settings-email').value = currentUser.email;
        
        // Xử lý sự kiện submit form
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('settings-username').value.trim();
            const email = document.getElementById('settings-email').value.trim();
            const password = document.getElementById('settings-password').value;
            const confirmPassword = document.getElementById('settings-confirm-password').value;
            
            // Kiểm tra mật khẩu nếu người dùng muốn thay đổi
            if (password && password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }
            
            // Cập nhật thông tin người dùng
            const updatedInfo = {
                username: username,
                email: email
            };
            
            // Cập nhật mật khẩu nếu có nhập
            if (password) {
                updatedInfo.password = password;
            }
            
            // Gọi hàm cập nhật từ auth.js
            const success = window.authManager.updateUserInfo(updatedInfo);
            
            if (success) {
                alert('Cập nhật thông tin thành công!');
                // Cập nhật lại thông tin hiển thị
                updateProfileInfo(window.authManager.getCurrentUser());
            } else {
                alert('Có lỗi xảy ra khi cập nhật thông tin!');
            }
        });
    }
    
    // Xử lý nút đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.authManager.handleLogout();
        });
    }
    
    // Tạo dữ liệu mẫu cho thành tích và nhiệm vụ gần đây
    loadAchievements(currentUser);
    loadRecentQuests(currentUser);
});

// Cập nhật thông tin hồ sơ người dùng
function updateProfileInfo(user) {
    // Cập nhật thông tin cơ bản
    document.getElementById('profile-name').textContent = user.username;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-level').textContent = user.level;
    
    // Cập nhật thống kê
    document.getElementById('profile-quests').textContent = user.quests ? user.quests.length : 0;
    document.getElementById('profile-xp').textContent = user.xp;
    document.getElementById('profile-streak').textContent = user.streak || 0;
    
    // Cập nhật tiến độ cấp độ
    const xpNeeded = user.level * 100;
    document.getElementById('current-xp').textContent = user.xp;
    document.getElementById('next-level-xp').textContent = xpNeeded;
    
    // Tính phần trăm tiến độ
    const progressPercent = (user.xp / xpNeeded) * 100;
    document.getElementById('xp-progress').style.width = `${progressPercent}%`;
}

// Tải và hiển thị thành tích
function loadAchievements(user) {
    const achievementsContainer = document.getElementById('achievements-list');
    achievementsContainer.innerHTML = '';
    
    // Kiểm tra xem người dùng có thành tích không
    if (!user.achievements || user.achievements.length === 0) {
        achievementsContainer.innerHTML = '<p>Bạn chưa có thành tích nào.</p>';
        return;
    }
    
    // Hiển thị danh sách thành tích
    user.achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.classList.add('achievement-item');
        
        const date = new Date(achievement.date);
        const formattedDate = date.toLocaleDateString('vi-VN');
        
        achievementEl.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon || 'fa-trophy'}"></i>
            </div>
            <div class="achievement-info">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <p class="achievement-date">Đạt được vào: ${formattedDate}</p>
            </div>
        `;
        
        achievementsContainer.appendChild(achievementEl);
    });
}

// Tải và hiển thị nhiệm vụ gần đây
function loadRecentQuests(user) {
    const recentQuestsContainer = document.getElementById('recent-quests');
    recentQuestsContainer.innerHTML = '';
    
    // Kiểm tra xem người dùng có nhiệm vụ không
    if (!user.quests || user.quests.length === 0) {
        recentQuestsContainer.innerHTML = '<p>Bạn chưa có nhiệm vụ nào.</p>';
        return;
    }
    
    // Lấy 5 nhiệm vụ gần nhất
    const recentQuests = [...user.quests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    // Hiển thị danh sách nhiệm vụ gần đây
    recentQuests.forEach(quest => {
        const questEl = document.createElement('div');
        questEl.classList.add('recent-quest-item');
        
        // Xác định XP dựa trên độ khó
        let xpValue = 10;
        if (quest.difficulty === 'medium') xpValue = 20;
        if (quest.difficulty === 'hard') xpValue = 30;
        
        // Định dạng ngày
        const createdDate = new Date(quest.createdAt);
        const formattedDate = createdDate.toLocaleDateString('vi-VN');
        
        // Tính tiến độ nếu có
        let progressHtml = '';
        if (quest.progress !== undefined) {
            const progressPercent = (quest.progress / 100) * 100;
            progressHtml = `
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercent}%"></div>
                </div>
            `;
        }
        
        questEl.innerHTML = `
            <h4>${quest.title}</h4>
            <div class="recent-quest-meta">
                <span>${quest.completed ? 'Hoàn thành' : 'Đang thực hiện'}</span>
                <span>${xpValue} XP</span>
                <span>${formattedDate}</span>
            </div>
            ${progressHtml}
        `;
        
        recentQuestsContainer.appendChild(questEl);
    });
}

// Tải và hiển thị lịch sử hoạt động
function loadActivityHistory(user) {
    const activityContainer = document.getElementById('activity-history');
    activityContainer.innerHTML = '';
    
    // Kiểm tra xem người dùng có lịch sử hoạt động không
    if (!user.activities || user.activities.length === 0) {
        activityContainer.innerHTML = '<p>Chưa có hoạt động nào được ghi lại.</p>';
        return;
    }
    
    // Hiển thị danh sách hoạt động
    user.activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.classList.add('activity-item');
        
        const date = new Date(activity.date);
        const formattedDate = date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        activityEl.innerHTML = `
            <div class="activity-info">
                <p>${activity.description}</p>
                <p class="activity-date">${formattedDate}</p>
            </div>
        `;
        
        activityContainer.appendChild(activityEl);
    });
}