// Tích hợp API cho Daily Quest Hub

// URL cơ sở cho API
const API_BASE_URL = 'http://localhost:5000/api';

// Đối tượng quản lý API
window.apiManager = {
    // Lấy token từ localStorage
    getToken: function() {
        // Kiểm tra cả hai nơi lưu trữ token
        const apiToken = localStorage.getItem('daily-quest-token');
        const authData = localStorage.getItem('daily_quest_hub_secret_key');
        
        if (apiToken) {
            return apiToken;
        } else if (authData) {
            const parsedAuthData = JSON.parse(authData);
            if (parsedAuthData && parsedAuthData.token) {
                // Đồng bộ token giữa hai nơi lưu trữ
                this.setToken(parsedAuthData.token);
                return parsedAuthData.token;
            }
        }
        return null;
    },
    
    // Lưu token vào localStorage
    setToken: function(token) {
        if (!token) return;
        
        // Lưu vào API token storage
        localStorage.setItem('daily-quest-token', token);
        
        // Đồng bộ với auth data
        const authData = localStorage.getItem('daily_quest_hub_secret_key');
        if (authData) {
            const parsedAuthData = JSON.parse(authData);
            parsedAuthData.token = token;
            localStorage.setItem('daily_quest_hub_secret_key', JSON.stringify(parsedAuthData));
        }
    },
    
    // Xóa token khỏi localStorage
    removeToken: function() {
        localStorage.removeItem('daily-quest-token');
        
        // Đồng bộ với auth data
        const authData = localStorage.getItem('daily_quest_hub_secret_key');
        if (authData) {
            const parsedAuthData = JSON.parse(authData);
            parsedAuthData.token = '';
            localStorage.setItem('daily_quest_hub_secret_key', JSON.stringify(parsedAuthData));
        }
    },
    
    // Gửi yêu cầu API với xác thực
    request: async function(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Thêm token xác thực nếu có
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Thêm dữ liệu nếu có
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Có lỗi xảy ra');
            }
            
            return responseData;
        } catch (error) {
            console.error(`Lỗi API (${endpoint}):`, error);
            throw error;
        }
    },
    
    // API người dùng
    user: {
        // Đăng ký người dùng mới
        register: async function(userData) {
            const response = await apiManager.request('/users/register', 'POST', userData);
            apiManager.setToken(response.token);
            return response.data.user;
        },
        
        // Đăng nhập
        login: async function(email, password) {
            const response = await apiManager.request('/users/login', 'POST', { email, password });
            apiManager.setToken(response.token);
            return response.data.user;
        },
        
        // Đăng xuất
        logout: function() {
            apiManager.removeToken();
            return true;
        },
        
        // Lấy thông tin người dùng hiện tại
        getProfile: async function() {
            const response = await apiManager.request('/users/me');
            return response.data.user;
        },
        
        // Cập nhật thông tin người dùng
        updateProfile: async function(userData) {
            const response = await apiManager.request('/users/updateMe', 'PATCH', userData);
            return response.data.user;
        },
        
        // Cập nhật mật khẩu
        updatePassword: async function(passwordData) {
            const response = await apiManager.request('/users/updatePassword', 'PATCH', passwordData);
            apiManager.setToken(response.token);
            return response.data.user;
        },
        
        // Thêm XP cho người dùng
        addXP: async function(xpAmount) {
            const response = await apiManager.request('/users/addXP', 'POST', { xpAmount });
            return response.data;
        }
    },
    
    // API nhiệm vụ
    quest: {
        // Lấy tất cả nhiệm vụ của người dùng
        getAll: async function() {
            const response = await apiManager.request('/quests');
            return response.data.quests;
        },
        
        // Lấy thông tin một nhiệm vụ
        getById: async function(questId) {
            const response = await apiManager.request(`/quests/${questId}`);
            return response.data.quest;
        },
        
        // Tạo nhiệm vụ mới
        create: async function(questData) {
            const response = await apiManager.request('/quests', 'POST', questData);
            return response.data.quest;
        },
        
        // Cập nhật nhiệm vụ
        update: async function(questId, questData) {
            const response = await apiManager.request(`/quests/${questId}`, 'PATCH', questData);
            return response.data.quest;
        },
        
        // Xóa nhiệm vụ
        delete: async function(questId) {
            await apiManager.request(`/quests/${questId}`, 'DELETE');
            return true;
        },
        
        // Cập nhật tiến độ nhiệm vụ
        updateProgress: async function(questId, progress) {
            const response = await apiManager.request(`/quests/${questId}/progress`, 'PATCH', { progress });
            return response.data;
        },
        
        // Đánh dấu nhiệm vụ hoàn thành
        complete: async function(questId) {
            const response = await apiManager.request(`/quests/${questId}/complete`, 'PATCH');
            return response.data;
        }
    },
    
    // API thành tích
    achievement: {
        // Lấy tất cả thành tích của người dùng
        getAll: async function() {
            const response = await apiManager.request('/achievements');
            return response.data.achievements;
        },
        
        // Lấy thông tin một thành tích
        getById: async function(achievementId) {
            const response = await apiManager.request(`/achievements/${achievementId}`);
            return response.data.achievement;
        },
        
        // Lấy thành tích theo danh mục
        getByCategory: async function(category) {
            const response = await apiManager.request(`/achievements/category/${category}`);
            return response.data.achievements;
        }
    }
};