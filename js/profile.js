// Quản lý trang hồ sơ người dùng cho Daily Quest Hub

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const currentUser = window.authManager.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Tải thông tin người dùng:', { 
        username: currentUser.username, 
        email: currentUser.email,
        hasAvatar: !!currentUser.avatar,
        bio: currentUser.bio ? 'Có' : 'Không'
    });
    
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
    
    // Xử lý nút chỉnh sửa hồ sơ
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Chuyển đến tab cài đặt
            document.querySelector('.tab-btn[data-tab="settings"]').click();
        });
    }
    
    // Xử lý form cài đặt
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        // Điền thông tin hiện tại vào form
        document.getElementById('settings-username').value = currentUser.username || '';
        document.getElementById('settings-email').value = currentUser.email || '';
        
        // Điền thông tin tiểu sử nếu có
        if (document.getElementById('settings-bio')) {
            document.getElementById('settings-bio').value = currentUser.bio || '';
        }
        
        // Thêm ảnh đại diện nếu có
        const avatarPreview = document.getElementById('avatar-preview');
        const avatarPlaceholder = document.getElementById('avatar-placeholder');
        
        if (currentUser.avatar) {
            console.log('Hiển thị avatar người dùng');
            if (avatarPreview) {
                avatarPreview.src = currentUser.avatar;
                avatarPreview.style.display = 'block';
            }
            
            if (avatarPlaceholder) {
                avatarPlaceholder.style.display = 'none';
            }
        } else {
            console.log('Không có avatar người dùng');
            if (avatarPreview) {
                avatarPreview.style.display = 'none';
            }
            
            if (avatarPlaceholder) {
                avatarPlaceholder.style.display = 'block';
            }
        }
        
        // Xử lý tải lên ảnh đại diện
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput) {
            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Kiểm tra loại file
                    if (!file.type.match('image.*')) {
                        showFormError('Vui lòng chọn file hình ảnh!');
                        return;
                    }
                    
                    // Kiểm tra kích thước file (tối đa 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        showFormError('Kích thước file quá lớn! Vui lòng chọn file nhỏ hơn 2MB.');
                        return;
                    }
                    
                    // Hiển thị ảnh xem trước
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        const avatarPreview = document.getElementById('avatar-preview');
                        const avatarPlaceholder = document.getElementById('avatar-placeholder');
                        const avatarData = e.target.result;
                        
                        if (avatarPreview) {
                            avatarPreview.src = avatarData;
                            avatarPreview.style.display = 'block';
                        }
                        
                        // Ẩn placeholder nếu có
                        if (avatarPlaceholder) {
                            avatarPlaceholder.style.display = 'none';
                        }
                        
                        try {
                            // Cập nhật avatar qua API
                            console.log('Cập nhật avatar qua API');
                            await window.apiManager.user.updateProfile({
                                avatar: avatarData
                            });
                            console.log('Cập nhật avatar thành công qua API');
                            
                            // Cập nhật UI
                            await updateProfileAvatar(avatarData);
                            
                            // Hiển thị thông báo thành công
                            showFormSuccess('Cập nhật ảnh đại diện thành công!');
                        } catch (apiError) {
                            console.error('Lỗi khi cập nhật avatar qua API:', apiError);
                            
                            // Fallback đến phương thức localStorage nếu API không hoạt động
                            const AUTH_KEY = 'daily_quest_hub_secret_key';
                            const authData = JSON.parse(localStorage.getItem(AUTH_KEY));
                            
                            if (authData) {
                                // Cập nhật avatar trong localStorage
                                authData.avatar = avatarData;
                                localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
                                console.log('Đã lưu avatar mới vào localStorage (fallback)');
                                
                                // Cập nhật avatar trong sidebar
                                await updateProfileAvatar(avatarData);
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Xử lý sự kiện submit form
        settingsForm.addEventListener('submit', async function(e) {
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
            
            try {
                // Cập nhật thông tin người dùng
                const userData = {
                    username: username,
                    email: email,
                    bio: bio
                };
                
                // Lấy ảnh đại diện từ preview
                const avatarPreview = document.getElementById('avatar-preview');
                // Chỉ cập nhật avatar nếu nó đang được hiển thị (tức là đã được tải lên hoặc đã có từ trước)
                if (avatarPreview && avatarPreview.style.display !== 'none') {
                    userData.avatar = avatarPreview.src;
                } else {
                    // Nếu không có avatar mới, giữ nguyên avatar cũ nếu có
                    const currentUser = window.authManager.getCurrentUser();
                    if (currentUser && currentUser.avatar) {
                        userData.avatar = currentUser.avatar;
                    }
                }
                
                console.log('Cập nhật thông tin người dùng vào database:', { 
                    ...userData, 
                    avatar: userData.avatar ? 'Có avatar' : 'Không có avatar'
                });
                
                // Gọi API để cập nhật thông tin người dùng
                let updatedUser;
                
                // Sử dụng API để cập nhật thông tin người dùng
                try {
                    updatedUser = await window.apiManager.user.updateProfile(userData);
                    console.log('Cập nhật thông tin thành công:', updatedUser);
                } catch (apiError) {
                    console.error('Lỗi khi gọi API cập nhật thông tin:', apiError);
                    // Fallback đến phương thức localStorage nếu API không hoạt động
                    if (password) {
                        userData.password = password;
                    }
                    const success = window.authManager.updateUserInfo(userData);
                    if (!success) {
                        throw new Error('Không thể cập nhật thông tin người dùng');
                    }
                }
                
                // Cập nhật mật khẩu nếu có nhập
                if (password) {
                    try {
                        console.log('Cập nhật mật khẩu người dùng');
                        // Gọi API cập nhật mật khẩu
                        const passwordResponse = await window.apiManager.user.updatePassword({
                            currentPassword: 'oldPassword', // Trong môi trường thực tế, cần yêu cầu người dùng nhập mật khẩu cũ
                            newPassword: password,
                            confirmPassword: confirmPassword
                        });
                        
                        // Lưu token mới vào localStorage - quan trọng để duy trì đăng nhập sau khi đổi mật khẩu
                        const AUTH_KEY = 'daily_quest_hub_secret_key';
                        const authData = JSON.parse(localStorage.getItem(AUTH_KEY));
                        if (authData && passwordResponse && passwordResponse.token) {
                            // Cập nhật token mới từ API response
                            authData.token = passwordResponse.token;
                            authData.passwordLastChanged = new Date().toISOString();
                            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
                            
                            // Cập nhật token trong apiManager
                            window.apiManager.setToken(passwordResponse.token);
                            
                            console.log('Token đã được cập nhật sau khi đổi mật khẩu');
                        }
                        
                        console.log('Cập nhật mật khẩu thành công');
                    } catch (passwordError) {
                        console.error('Lỗi khi cập nhật mật khẩu:', passwordError);
                        // Fallback đến phương thức localStorage nếu API không hoạt động
                        const authData = JSON.parse(localStorage.getItem('daily_quest_hub_secret_key'));
                        if (authData) {
                            authData.passwordLastChanged = new Date().toISOString();
                            localStorage.setItem('daily_quest_hub_secret_key', JSON.stringify(authData));
                        }
                    }
                }
                
                // Xóa giá trị mật khẩu đã nhập
                document.getElementById('settings-password').value = '';
                document.getElementById('settings-confirm-password').value = '';
                
                // Cập nhật lại thông tin hiển thị
                const currentUser = window.authManager.getCurrentUser();
                updateProfileInfo(currentUser);
                
                // Kích hoạt sự kiện auth-state-changed để cập nhật UI trên toàn ứng dụng
                const event = new Event('auth-state-changed');
                document.dispatchEvent(event);
                
                // Hiển thị thông báo thành công
                showFormSuccess('Cập nhật thông tin thành công!');
            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin:', error);
                showFormError('Có lỗi xảy ra: ' + error.message);
            } finally {
                // Khôi phục trạng thái nút submit
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
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
    
    // Tải dữ liệu cho các tab
    loadAchievements(currentUser);
    loadRecentQuests(currentUser);
    loadActivityHistory(currentUser);
});

// Cập nhật thông tin hồ sơ người dùng
function updateProfileInfo(user) {
    // Cập nhật thông tin cơ bản
    document.getElementById('profile-name').textContent = user.username;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-level').textContent = user.level || 1;
    
    // Cập nhật avatar nếu có
    if (user.avatar) {
        updateProfileAvatar(user.avatar);
    }
    
    // Cập nhật thống kê
    document.getElementById('profile-quests').textContent = user.quests ? user.quests.length : 0;
    document.getElementById('profile-xp').textContent = user.xp || 0;
    document.getElementById('profile-streak').textContent = user.streak || 0;
    
    // Cập nhật tiến độ cấp độ
    const xpNeeded = (user.level || 1) * 100;
    document.getElementById('current-xp').textContent = user.xp || 0;
    document.getElementById('next-level-xp').textContent = xpNeeded;
    
    // Tính phần trăm tiến độ
    const progressPercent = ((user.xp || 0) / xpNeeded) * 100;
    document.getElementById('xp-progress').style.width = `${progressPercent}%`;
    
    // Cập nhật hiển thị thành tích trên trang tổng quan
    updateAchievementBadges(user.achievements || []);
}

// Cập nhật avatar trong sidebar và các nơi khác
async function updateProfileAvatar(avatarUrl) {
    console.log('Cập nhật avatar với URL:', avatarUrl ? 'Có avatar' : 'Không có avatar');
    
    // Cập nhật avatar trong database qua API
    try {
        await window.apiManager.user.updateProfile({
            avatar: avatarUrl
        });
        console.log('Đã cập nhật avatar trong database');
        
        // Cập nhật localStorage sau khi API thành công
        const AUTH_KEY = 'daily_quest_hub_secret_key';
        const authData = JSON.parse(localStorage.getItem(AUTH_KEY));
        
        if (authData) {
            authData.avatar = avatarUrl;
            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
            console.log('Đã đồng bộ avatar vào localStorage');
        }
    } catch (apiError) {
        console.error('Lỗi khi cập nhật avatar trong database:', apiError);
        
        // Fallback: Lưu vào localStorage nếu API không hoạt động
        const AUTH_KEY = 'daily_quest_hub_secret_key';
        const authData = JSON.parse(localStorage.getItem(AUTH_KEY));
        
        if (authData) {
            authData.avatar = avatarUrl;
            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
            console.log('Đã lưu avatar vào localStorage (fallback)');
        }
    }
    
    // Cập nhật avatar trong sidebar
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
        // Xóa icon cũ nếu có
        const oldIcon = profileAvatar.querySelector('i');
        if (oldIcon) {
            oldIcon.remove();
        }
        
        // Kiểm tra xem đã có ảnh avatar chưa
        let avatarImg = profileAvatar.querySelector('img');
        
        if (!avatarImg) {
            // Tạo phần tử img mới nếu chưa có
            avatarImg = document.createElement('img');
            avatarImg.style.width = '100%';
            avatarImg.style.height = '100%';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            profileAvatar.appendChild(avatarImg);
        }
        
        // Cập nhật URL ảnh
        avatarImg.src = avatarUrl;
    }
    
    // Cập nhật ảnh xem trước trong form settings
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    
    if (avatarPreview) {
        avatarPreview.src = avatarUrl;
        avatarPreview.style.display = 'block';
    }
    
    if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'none';
    }
    
    // Kích hoạt sự kiện auth-state-changed để cập nhật UI trên toàn ứng dụng
    const event = new Event('auth-state-changed');
    document.dispatchEvent(event);
}

// Tải và hiển thị thành tích
function loadAchievements(user) {
    const achievementsContainer = document.getElementById('achievements-list');
    achievementsContainer.innerHTML = '';
    
    // Kiểm tra xem người dùng có thành tích hay không
    if (!user.achievements || user.achievements.length === 0) {
        achievementsContainer.innerHTML = `
            <p class="no-data-message">
                <i class="fas fa-trophy" style="display: block; font-size: 2rem; margin-bottom: 10px; color: #ddd;"></i>
                Bạn chưa đạt được thành tích nào. Hoàn thành nhiệm vụ để mở khóa thành tích!
            </p>`;
        return;
    }
    
    // Hiển thị danh sách thành tích
    user.achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.classList.add('achievement-item');
        
        // Kiểm tra nếu là thành tích mới (id 4, 5, 6, 7) thì thêm class 'new'
        if (achievement.id === 'achievement-4' || achievement.id === 'achievement-5' || 
            achievement.id === 'achievement-6' || achievement.id === 'achievement-7') {
            achievementEl.classList.add('new');
        }
        
        const date = new Date(achievement.date);
        const formattedDate = date.toLocaleDateString('vi-VN');
        
        // Thêm hiệu ứng màu sắc cho icon dựa trên loại thành tích
        let iconColor = '#6a4c93'; // Màu mặc định
        
        if (achievement.id === 'achievement-4') {
            iconColor = '#4caf50'; // Màu xanh lá cho thành tích "Thói quen tốt"
        } else if (achievement.id === 'achievement-5') {
            iconColor = '#ff9800'; // Màu cam cho thành tích "Cao thủ"
        } else if (achievement.id === 'achievement-6') {
            iconColor = '#2196f3'; // Màu xanh dương cho thành tích "Kỳ thủ"
        } else if (achievement.id === 'achievement-7') {
            iconColor = '#e91e63'; // Màu hồng đậm cho thành tích "Bậc thầy"
        }
        
        achievementEl.innerHTML = `
            <div class="achievement-icon" style="background-color: ${iconColor}">
                <i class="fas ${achievement.icon || 'fa-trophy'}"></i>
            </div>
            <div class="achievement-info">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <small>Đạt được vào: ${formattedDate}</small>
            </div>
        `;
        
        achievementsContainer.appendChild(achievementEl);
    });
}

// Tải và hiển thị nhiệm vụ gần đây
function loadRecentQuests(user) {
    const recentQuestsContainer = document.getElementById('recent-quests');
    recentQuestsContainer.innerHTML = '';
    
    // Kiểm tra xem người dùng có nhiệm vụ hay không
    if (!user.quests || user.quests.length === 0) {
        recentQuestsContainer.innerHTML = `
            <p class="no-data-message">
                <i class="fas fa-clipboard-list" style="display: block; font-size: 2rem; margin-bottom: 10px; color: #ddd;"></i>
                Bạn chưa có nhiệm vụ nào. Hãy tạo nhiệm vụ mới để bắt đầu!
            </p>`;
        return;
    }
    
    // Sử dụng 3 nhiệm vụ gần nhất
    const recentQuests = user.quests.slice(0, 3);
    
    // Hiển thị danh sách nhiệm vụ
    recentQuests.forEach(quest => {
        const questEl = document.createElement('div');
        questEl.classList.add('recent-quest-item');
        
        const date = new Date(quest.date);
        const formattedDate = date.toLocaleDateString('vi-VN');
        
        let difficultyText = '';
        let difficultyColor = '';
        
        switch(quest.difficulty) {
            case 'easy':
                difficultyText = 'Dễ';
                difficultyColor = '#4caf50';
                break;
            case 'medium':
                difficultyText = 'Trung bình';
                difficultyColor = '#ff9800';
                break;
            case 'hard':
                difficultyText = 'Khó';
                difficultyColor = '#f44336';
                break;
            default:
                difficultyText = 'Không xác định';
                difficultyColor = '#999';
        }
        
        questEl.innerHTML = `
            <h4>${quest.title}</h4>
            <div class="recent-quest-meta">
                <span>Ngày: ${formattedDate}</span>
                <span style="color: ${difficultyColor}">Độ khó: ${difficultyText}</span>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: 100%"></div>
            </div>
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
        activityContainer.innerHTML = `
            <p class="no-data-message">
                <i class="fas fa-history" style="display: block; font-size: 2rem; margin-bottom: 10px; color: #ddd;"></i>
                Chưa có hoạt động nào được ghi lại. Các hoạt động của bạn sẽ xuất hiện ở đây.
            </p>`;
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

// Cập nhật hiển thị huy hiệu thành tích trên trang tổng quan
function updateAchievementBadges(achievements) {
    const achievementBadges = document.querySelectorAll('.achievement-badge');
    
    // Mặc định tất cả huy hiệu đều mờ
    achievementBadges.forEach(badge => {
        badge.style.opacity = '0.4';
    });
    
    // Kiểm tra từng thành tích và làm sáng huy hiệu tương ứng
    achievements.forEach(achievement => {
        if (achievement.id === 'achievement-1' && achievementBadges[0]) {
            achievementBadges[0].style.opacity = '1';
        }
        if (achievement.id === 'achievement-2' && achievementBadges[1]) {
            achievementBadges[1].style.opacity = '1';
        }
        if (achievement.id === 'achievement-4' && achievementBadges[2]) {
            achievementBadges[2].style.opacity = '1';
        }
        if (achievement.id === 'achievement-5' && achievementBadges[3]) {
            achievementBadges[3].style.opacity = '1';
        }
        if (achievement.id === 'achievement-6' && achievementBadges[4]) {
            achievementBadges[4].style.opacity = '1';
        }
        if (achievement.id === 'achievement-7' && achievementBadges[5]) {
            achievementBadges[5].style.opacity = '1';
        }
    });
}

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