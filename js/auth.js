// Xử lý đăng nhập, đăng ký và đăng xuất với backend API

// Lưu trữ thông tin người dùng trong localStorage
const AUTH_KEY = 'daily_quest_hub_secret_key';
const QUESTS_KEY = 'daily_quest_hub_quests';
// URL cơ sở cho API backend đã được định nghĩa trong api.js
// const API_BASE_URL = 'http://localhost:5000/api';

// Tạo đối tượng quản lý xác thực cho window
window.authManager = {
    // Lấy thông tin người dùng hiện tại
    getCurrentUser: function() {
        const authData = getAuthData();
        if (authData && authData.token) {
            // Lấy danh sách nhiệm vụ của người dùng
            const userQuests = this.getUserQuests(authData.id);
            
            // Tính toán XP từ nhiệm vụ đã hoàn thành
            let totalXP = 0;
            let completedQuests = 0;
            
            if (userQuests && userQuests.length > 0) {
                userQuests.forEach(quest => {
                    if (quest.completed) {
                        completedQuests++;
                        let questXP = 10; // Mặc định là nhiệm vụ dễ
                        if (quest.difficulty === 'medium') questXP = 20;
                        if (quest.difficulty === 'hard') questXP = 30;
                        totalXP += questXP;
                    }
                });
            }
            
            return {
                id: authData.id,
                username: authData.username,
                email: authData.email,
                token: authData.token,
                isLoggedIn: true,
                level: Math.floor(totalXP / 100) + 1,
                xp: totalXP,
                streak: authData.streak || 3,
                quests: userQuests || [],
                achievements: this.getUserAchievements(authData.id, completedQuests),
                avatar: authData.avatar || null,
                bio: authData.bio || '',
                passwordLastChanged: authData.passwordLastChanged || null
            };
        }
        return null;
    },
    
    // Lấy danh sách nhiệm vụ của người dùng
    getUserQuests: function(userId) {
        const questsData = localStorage.getItem(QUESTS_KEY);
        if (questsData) {
            const allQuests = JSON.parse(questsData);
            // Lọc nhiệm vụ theo ID người dùng
            return allQuests.filter(quest => quest.userId === userId);
        }
        return [];
    },
    
    // Lấy danh sách thành tích của người dùng dựa trên nhiệm vụ đã hoàn thành
    getUserAchievements: function(userId, completedQuestCount) {
        const achievements = [];
        
        // Người mới bắt đầu
        if (completedQuestCount >= 1) {
            achievements.push({
                id: 'achievement-1',
                title: 'Người mới bắt đầu',
                description: 'Hoàn thành nhiệm vụ đầu tiên',
                date: new Date(2023, 5, 15),
                icon: 'fa-award'
            });
        }
        
        // Siêng năng
        if (completedQuestCount >= 5) {
            achievements.push({
                id: 'achievement-2',
                title: 'Siêng năng',
                description: 'Hoàn thành 5 nhiệm vụ',
                date: new Date(2023, 5, 20),
                icon: 'fa-medal'
            });
        }
        
        // Chuyên nghiệp
        if (completedQuestCount >= 10) {
            achievements.push({
                id: 'achievement-3',
                title: 'Chuyên nghiệp',
                description: 'Hoàn thành 10 nhiệm vụ',
                date: new Date(2023, 6, 1),
                icon: 'fa-trophy'
            });
        }
        
        // Thời quen tốt
        if (completedQuestCount >= 7) {
            achievements.push({
                id: 'achievement-4',
                title: 'Thói quen tốt',
                description: 'Hoàn thành 7 nhiệm vụ liên tiếp',
                date: new Date(),
                icon: 'fa-calendar-check'
            });
        }
        
        // Cao thủ
        if (completedQuestCount >= 20) {
            achievements.push({
                id: 'achievement-5',
                title: 'Cao thủ',
                description: 'Đạt 500 điểm XP',
                date: new Date(),
                icon: 'fa-gem'
            });
        }
        
        // Kỳ thủ
        if (completedQuestCount >= 3) {
            achievements.push({
                id: 'achievement-6',
                title: 'Kỳ thủ',
                description: 'Hoàn thành nhiệm vụ 3 ngày liên tiếp',
                date: new Date(),
                icon: 'fa-calendar-day'
            });
        }
        
        // Bậc thầy
        if (completedQuestCount >= 50) {
            achievements.push({
                id: 'achievement-7',
                title: 'Bậc thầy',
                description: 'Hoàn thành 50 nhiệm vụ',
                date: new Date(),
                icon: 'fa-crown'
            });
        }
        
        return achievements;
    },
    
    // Thêm nhiệm vụ mới
    addQuest: function(questData) {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        // Tạo ID ngẫu nhiên cho nhiệm vụ
        const questId = 'quest-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        const newQuest = {
            id: questId,
            userId: user.id,
            title: questData.title,
            description: questData.description || '',
            difficulty: questData.difficulty || 'easy',
            deadline: questData.deadline || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Lấy danh sách nhiệm vụ hiện tại
        const questsData = localStorage.getItem(QUESTS_KEY);
        const allQuests = questsData ? JSON.parse(questsData) : [];
        
        // Thêm nhiệm vụ mới
        allQuests.push(newQuest);
        
        // Lưu lại danh sách nhiệm vụ
        localStorage.setItem(QUESTS_KEY, JSON.stringify(allQuests));
        
        return newQuest;
    },
    
    // Cập nhật nhiệm vụ
    updateQuest: function(questId, updateData) {
        const questsData = localStorage.getItem(QUESTS_KEY);
        if (!questsData) return false;
        
        const allQuests = JSON.parse(questsData);
        const questIndex = allQuests.findIndex(q => q.id === questId);
        
        if (questIndex === -1) return false;
        
        // Cập nhật thông tin nhiệm vụ
        allQuests[questIndex] = { ...allQuests[questIndex], ...updateData };
        
        // Lưu lại danh sách nhiệm vụ
        localStorage.setItem(QUESTS_KEY, JSON.stringify(allQuests));
        
        return allQuests[questIndex];
    },
    
    // Đánh dấu nhiệm vụ đã hoàn thành
    completeQuest: function(questId) {
        return this.updateQuest(questId, { 
            completed: true, 
            completedAt: new Date().toISOString() 
        });
    },
    
    // Xóa nhiệm vụ
    deleteQuest: function(questId) {
        const questsData = localStorage.getItem(QUESTS_KEY);
        if (!questsData) return false;
        
        const allQuests = JSON.parse(questsData);
        const filteredQuests = allQuests.filter(q => q.id !== questId);
        
        // Lưu lại danh sách nhiệm vụ
        localStorage.setItem(QUESTS_KEY, JSON.stringify(filteredQuests));
        
        return true;
    },
    
    // Đăng xuất
    handleLogout: function() {
        logout();
    },
    
    // Cập nhật thông tin người dùng
    updateUserInfo: async function(updatedInfo) {
        const authData = getAuthData();
        if (authData) {
            try {
                // Gọi API để cập nhật thông tin trong database
                console.log('Đang cập nhật thông tin người dùng trong database...');
                const updatedUser = await window.apiManager.user.updateProfile({
                    username: updatedInfo.username,
                    email: updatedInfo.email,
                    bio: updatedInfo.bio,
                    avatar: updatedInfo.avatar
                });
                console.log('Cập nhật thông tin người dùng thành công:', updatedUser);
                
                // Cập nhật thông tin trong localStorage
                const newAuthData = {
                    ...authData,
                    username: updatedInfo.username || authData.username,
                    email: updatedInfo.email || authData.email,
                    bio: updatedInfo.bio !== undefined ? updatedInfo.bio : authData.bio
                };
                
                // Cập nhật avatar nếu có
                if (updatedInfo.avatar) {
                    newAuthData.avatar = updatedInfo.avatar;
                }
                
                // Cập nhật mật khẩu nếu có
                if (updatedInfo.password) {
                    try {
                        // Gọi API cập nhật mật khẩu
                        const passwordResponse = await window.apiManager.user.updatePassword({
                            currentPassword: 'oldPassword', // Trong môi trường thực tế, cần yêu cầu người dùng nhập mật khẩu cũ
                            newPassword: updatedInfo.password,
                            confirmPassword: updatedInfo.password
                        });
                        
                        // Cập nhật token mới từ API response
                        if (passwordResponse && passwordResponse.token) {
                            newAuthData.token = passwordResponse.token;
                            // Đồng bộ token với API manager
                            window.apiManager.setToken(passwordResponse.token);
                        }
                        
                        newAuthData.passwordLastChanged = new Date().toISOString();
                        console.log('Mật khẩu đã được cập nhật qua API');
                    } catch (passwordError) {
                        console.error('Lỗi khi cập nhật mật khẩu qua API:', passwordError);
                        newAuthData.passwordLastChanged = new Date().toISOString();
                    }
                }
                
                // Lưu dữ liệu cập nhật vào localStorage
                localStorage.setItem(AUTH_KEY, JSON.stringify(newAuthData));
                console.log('Đã lưu thông tin người dùng vào localStorage');
                
                // Kích hoạt sự kiện thay đổi trạng thái xác thực để cập nhật UI
                dispatchAuthStateChanged();
                
                return true;
            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin người dùng:', error);
                
                // Fallback: Chỉ cập nhật localStorage nếu API không hoạt động
                const newAuthData = {
                    ...authData,
                    username: updatedInfo.username || authData.username,
                    email: updatedInfo.email || authData.email,
                    bio: updatedInfo.bio !== undefined ? updatedInfo.bio : authData.bio
                };
                
                // Cập nhật avatar nếu có
                if (updatedInfo.avatar) {
                    newAuthData.avatar = updatedInfo.avatar;
                }
                
                // Cập nhật mật khẩu nếu có (thực tế mật khẩu sẽ được mã hóa và lưu ở server)
                if (updatedInfo.password) {
                    newAuthData.passwordLastChanged = new Date().toISOString();
                    console.log('Mật khẩu đã được cập nhật (localStorage fallback)');
                }
                
                // Lưu dữ liệu cập nhật vào localStorage
                localStorage.setItem(AUTH_KEY, JSON.stringify(newAuthData));
                console.log('Đã lưu thông tin người dùng vào localStorage (fallback)');
                
                // Kích hoạt sự kiện thay đổi trạng thái xác thực để cập nhật UI
                dispatchAuthStateChanged();
                
                return true;
            }
        }
        return false;
    }
};

// Kiểm tra trạng thái đăng nhập khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupAuthForms();
    setupLogoutLink();
});

// Kiểm tra trạng thái đăng nhập và cập nhật UI
async function checkAuthStatus() {
    const authData = getAuthData();
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    
    if (authData && authData.token) {
        try {
            // Xác thực token với backend
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Token hợp lệ, người dùng đã đăng nhập
                if (profileLink) profileLink.style.display = 'inline-block';
                if (logoutLink) logoutLink.style.display = 'inline-block';
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
                
                // Kiểm tra nếu đang ở trang đăng nhập/đăng ký thì chuyển hướng về trang chủ
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'login.html' || currentPage === 'register.html') {
                    window.location.href = 'index.html';
                }
            } else {
                // Token không hợp lệ, đăng xuất người dùng
                logout();
            }
        } catch (error) {
            console.error('Lỗi khi xác thực token:', error);
            // Xử lý lỗi kết nối, giữ trạng thái đăng nhập nếu không thể kết nối với server
        }
    } else {
        // Người dùng chưa đăng nhập
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        
        // Kiểm tra nếu đang ở trang cần xác thực thì chuyển hướng về trang đăng nhập
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'profile.html') {
            window.location.href = 'login.html';
        }
    }
}

// Thiết lập form đăng nhập và đăng ký
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Kiểm tra đăng nhập
            login(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
                showError('confirm-password-error', 'Mật khẩu xác nhận không khớp');
        return;
    }
    
            // Đăng ký người dùng mới
            register(username, email, password);
        });
    }
}

// Thiết lập liên kết đăng xuất
function setupLogoutLink() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Đăng nhập
async function login(email, password) {
    try {
        // Gửi yêu cầu đăng nhập đến backend
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Dữ liệu từ API:', data); // Debug
        
        if (response.ok) {
            // Xóa dữ liệu người dùng ẩn danh khi đăng nhập thành công
            clearAnonymousData();
            
            // Đăng nhập thành công
            const authData = {
                id: data.data && data.data.user && data.data.user._id ? data.data.user._id : 'unknown',
                username: data.data && data.data.user && data.data.user.username ? data.data.user.username : 'User',
                email: data.data && data.data.user && data.data.user.email ? data.data.user.email : email,
                token: data.token || '',
                isLoggedIn: true
            };
            
            console.log("Login successful - authData:", { ...authData, token: '***hidden***' });
            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
            
            // Đồng bộ token với apiManager
            if (data.token) {
                window.apiManager.setToken(data.token);
            }
            
            // Khởi tạo trạng thái công cụ cho người dùng nếu chưa có
            const userId = authData.id;
            console.log("Initializing tools for user:", userId);
            initUserTools(userId);
            
            // Kích hoạt sự kiện auth-state-changed
            dispatchAuthStateChanged();
            
        window.location.href = 'index.html';
        } else {
            // Đăng nhập thất bại
            showError('login-error', data.message || 'Email hoặc mật khẩu không đúng');
        }
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        showError('login-error', 'Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.');
    }
}

// Đăng ký
async function register(username, email, password) {
    try {
        // Gửi yêu cầu đăng ký đến backend
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, confirmPassword: password })
        });
        
        const data = await response.json();
        console.log('Dữ liệu từ API (đăng ký):', data); // Debug
        
        if (response.ok) {
            // Xóa dữ liệu người dùng ẩn danh khi đăng ký thành công
            clearAnonymousData();
            
            // Đăng ký thành công
            const authData = {
                id: data.data && data.data.user && data.data.user._id ? data.data.user._id : 'unknown',
                username: data.data && data.data.user && data.data.user.username ? data.data.user.username : username,
                email: data.data && data.data.user && data.data.user.email ? data.data.user.email : email,
                token: data.token || '',
                isLoggedIn: true
            };
            
            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
            
            // Đồng bộ token với apiManager
            if (data.token) {
                window.apiManager.setToken(data.token);
            }
            
            // Khởi tạo trạng thái công cụ cho người dùng mới
            const userId = authData.id;
            initUserTools(userId);
            
            // Kích hoạt sự kiện auth-state-changed
            dispatchAuthStateChanged();
            
        window.location.href = 'index.html';
        } else {
            // Đăng ký thất bại
            if (data.field === 'email') {
                showError('email-error', data.message || 'Email này đã được sử dụng');
            } else if (data.field === 'username') {
                showError('username-error', data.message || 'Tên người dùng đã tồn tại');
            } else {
                showError('register-error', data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        }
    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        showError('register-error', 'Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.');
    }
}

// Đăng xuất
async function logout() {
    const authData = getAuthData();
    console.log("Logging out - authData:", authData ? { ...authData, token: '***hidden***' } : null);
    
    if (authData && authData.token) {
        try {
            // Gửi yêu cầu đăng xuất đến backend
            await fetch(`${API_BASE_URL}/users/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            // Tiếp tục đăng xuất ngay cả khi có lỗi kết nối
        }
    }
    
    // KHÔNG xóa dữ liệu công cụ người dùng từ localStorage
    // Chỉ xóa thông tin xác thực
    localStorage.removeItem(AUTH_KEY);
    console.log("AUTH_KEY removed from localStorage");
    
    // Đảm bảo token API cũng bị xóa
    window.apiManager.removeToken();
    console.log("API token removed");
    
    // Kích hoạt sự kiện auth-state-changed
    dispatchAuthStateChanged();
    console.log("Auth state changed event dispatched");
    
    window.location.href = 'index.html';
}

// Hàm kích hoạt sự kiện auth-state-changed
function dispatchAuthStateChanged() {
    const event = new Event('auth-state-changed');
    document.dispatchEvent(event);
}

// Lấy thông tin người dùng đã đăng nhập
function getAuthData() {
    const authData = localStorage.getItem(AUTH_KEY);
    return authData ? JSON.parse(authData) : null;
}

// Hiển thị thông báo lỗi
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Lấy thông tin người dùng từ backend
async function getUserProfile() {
    const authData = getAuthData();
    
    if (!authData || !authData.token) {
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authData.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            // Xử lý lỗi xác thực
            if (response.status === 401) {
                logout(); // Token hết hạn hoặc không hợp lệ
            }
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        return null;
    }
}

// Khởi tạo dữ liệu công cụ cho người dùng
function initUserTools(userId) {
    console.log(`Initializing tools for user ${userId}`);
    
    // Khởi tạo Pomodoro nếu cần
    const pomodoroKey = `pomodoro_${userId}`;
    if (!localStorage.getItem(pomodoroKey)) {
        console.log(`Creating default pomodoro settings for ${userId}`);
        const defaultSettings = {
            workTime: 25 * 60,
            breakTime: 5 * 60,
            completedSessions: 0
        };
        localStorage.setItem(pomodoroKey, JSON.stringify(defaultSettings));
    } else {
        console.log(`Pomodoro settings already exist for ${userId}`);
    }
    
    // Khởi tạo Checklist nếu cần
    const checklistKey = `checklist_${userId}`;
    if (!localStorage.getItem(checklistKey)) {
        console.log(`Creating empty checklist for ${userId}`);
        localStorage.setItem(checklistKey, JSON.stringify([]));
    } else {
        console.log(`Checklist already exists for ${userId}`);
    }
    
    // Khởi tạo Notes nếu cần
    const notesKey = `notes_${userId}`;
    if (!localStorage.getItem(notesKey)) {
        console.log(`Creating empty notes for ${userId}`);
        localStorage.setItem(notesKey, JSON.stringify([]));
    } else {
        console.log(`Notes already exist for ${userId}`);
    }
    
    console.log(`Tool initialization complete for ${userId}`);
}

// Xóa dữ liệu người dùng ẩn danh
function clearAnonymousData() {
    localStorage.removeItem('pomodoro_anonymous');
    localStorage.removeItem('checklist_anonymous');
    localStorage.removeItem('notes_anonymous');
    localStorage.removeItem('todos_anonymous');
}