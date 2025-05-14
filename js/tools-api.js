// API cho các công cụ trong Daily Quest Hub

// Sử dụng API Manager từ api.js
const toolsAPI = {
    // API cho Pomodoro Timer
    pomodoro: {
        // Lấy cài đặt Pomodoro
        getSettings: async function() {
            try {
                const response = await apiManager.request('/tools/pomodoro');
                return response.data.pomodoro;
            } catch (error) {
                console.error('Lỗi khi lấy cài đặt Pomodoro:', error);
                // Trả về cài đặt mặc định nếu có lỗi
                return {
                    workTime: 25 * 60,
                    breakTime: 5 * 60,
                    completedSessions: 0
                };
            }
        },
        
        // Cập nhật cài đặt Pomodoro
        updateSettings: async function(settings) {
            try {
                const response = await apiManager.request('/tools/pomodoro', 'PATCH', settings);
                return response.data.pomodoro;
            } catch (error) {
                console.error('Lỗi khi cập nhật cài đặt Pomodoro:', error);
                throw error;
            }
        },
        
        // Tăng số phiên đã hoàn thành
        incrementSessions: async function() {
            try {
                const response = await apiManager.request('/tools/pomodoro/increment', 'POST');
                return response.data.pomodoro;
            } catch (error) {
                console.error('Lỗi khi cập nhật số phiên Pomodoro:', error);
                throw error;
            }
        }
    },
    
    // API cho Quick Checklist
    checklist: {
        // Lấy danh sách kiểm tra
        getItems: async function() {
            try {
                const response = await apiManager.request('/tools/checklist');
                return response.data.checklist.items || [];
            } catch (error) {
                console.error('Lỗi khi lấy danh sách kiểm tra:', error);
                // Trả về mảng trống nếu có lỗi
                return [];
            }
        },
        
        // Cập nhật danh sách kiểm tra
        updateItems: async function(items) {
            try {
                const response = await apiManager.request('/tools/checklist', 'PATCH', { items });
                return response.data.checklist;
            } catch (error) {
                console.error('Lỗi khi cập nhật danh sách kiểm tra:', error);
                throw error;
            }
        }
    },
    
    // API cho Quick Notes
    notes: {
        // Lấy tất cả ghi chú
        getAll: async function() {
            try {
                const response = await apiManager.request('/tools/notes');
                return response.data.notes || [];
            } catch (error) {
                console.error('Lỗi khi lấy ghi chú:', error);
                // Trả về mảng trống nếu có lỗi
                return [];
            }
        },
        
        // Tạo ghi chú mới
        create: async function(content) {
            try {
                const response = await apiManager.request('/tools/notes', 'POST', { content });
                return response.data.note;
            } catch (error) {
                console.error('Lỗi khi tạo ghi chú:', error);
                throw error;
            }
        },
        
        // Cập nhật ghi chú
        update: async function(id, content) {
            try {
                const response = await apiManager.request(`/tools/notes/${id}`, 'PATCH', { content });
                return response.data.note;
            } catch (error) {
                console.error('Lỗi khi cập nhật ghi chú:', error);
                throw error;
            }
        },
        
        // Xóa ghi chú
        delete: async function(id) {
            try {
                await apiManager.request(`/tools/notes/${id}`, 'DELETE');
                return true;
            } catch (error) {
                console.error('Lỗi khi xóa ghi chú:', error);
                throw error;
            }
        }
    }
};

// Thêm vào window để có thể truy cập từ các file khác
window.toolsAPI = toolsAPI;