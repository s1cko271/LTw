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
        
        // Thêm ảnh đại diện nếu có
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview && currentUser.avatar) {
            avatarPreview.src = currentUser.avatar;
            avatarPreview.style.display = 'block';
        }
        
        // Xử lý tải lên ảnh đại diện
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput) {
            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Kiểm tra loại file
                    if (!file.type.match('image.*')) {
                        alert('Vui lòng chọn file hình ảnh!');
                        return;
                    }
                    
                    // Kiểm tra kích thước file (tối đa 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        alert('Kích thước file quá lớn! Vui lòng chọn file nhỏ hơn 2MB.');
                        return;
                    }
                    
                    // Hiển thị ảnh xem trước
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        avatarPreview.src = e.target.result;
                        avatarPreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Xử lý sự kiện submit form
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('settings-username').value.trim();
            const email = document.getElementById('settings-email').value.trim();
            const password = document.getElementById('settings-password').value;
            const confirmPassword = document.getElementById('settings-confirm-password').value;
            const bio = document.getElementById('settings-bio') ? document.getElementById('settings-bio').value.trim() : '';
            
            // Xác thực dữ liệu
            if (!username) {
                showFormError('Tên người dùng không được để trống!');
                return;
            }
            
            if (!email) {
                showFormError('Email không được để trống!');
                return;
            }
            
            // Kiểm tra định dạng email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormError('Email không hợp lệ!');
                return;
            }
            
            // Kiểm tra mật khẩu nếu người dùng muốn thay đổi
            if (password) {
                if (password.length < 6) {
                    showFormError('Mật khẩu phải có ít nhất 6 ký tự!');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showFormError('Mật khẩu xác nhận không khớp!');
                    return;
                }
            }
            
            // Hiển thị trạng thái đang cập nhật
            const submitBtn = settingsForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
            submitBtn.disabled = true;
            
            // Cập nhật thông tin người dùng
            const updatedInfo = {
                username: username,
                email: email,
                bio: bio
            };
            
            // Thêm avatar nếu có thay đổi
            if (avatarPreview && avatarPreview.style.display !== 'none') {
                updatedInfo.avatar = avatarPreview.src;
            }
            
            // Cập nhật mật khẩu nếu có nhập
            if (password) {
                updatedInfo.password = password;
            }
            
            // Gọi hàm cập nhật từ auth.js hoặc API
            try {
                // Nếu có API thực tế, sử dụng window.apiManager.user.updateProfile(updatedInfo)
                const success = window.authManager.updateUserInfo(updatedInfo);
                
                if (success) {
                    showFormSuccess('Cập nhật thông tin thành công!');
                    // Cập nhật lại thông tin hiển thị
                    updateProfileInfo(window.authManager.getCurrentUser());
                } else {
                    showFormError('Có lỗi xảy ra khi cập nhật thông tin!');
                }
            } catch (error) {
                showFormError('Có lỗi xảy ra: ' + error.message);
            } finally {
                // Khôi phục trạng thái nút submit
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
        
        // Hàm hiển thị lỗi
        function showFormError(message) {
            const errorElement = document.getElementById('settings-error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                
                // Tự động ẩn thông báo sau 5 giây
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 5000);
            } else {
                alert(message);
            }
        }
        
        // Hàm hiển thị thành công
        function showFormSuccess(message) {
            const successElement = document.getElementById('settings-success');
            if (successElement) {
                successElement.textContent = message;
                successElement.style.display = 'block';
                
                // Tự động ẩn thông báo sau 5 giây
                setTimeout(() => {
                    successElement.style.display = 'none';
                }, 5000);
            } else {
                alert(message);
            }
        }
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