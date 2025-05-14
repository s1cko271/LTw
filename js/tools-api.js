// Quản lý dữ liệu công cụ với localStorage

// Lấy ID người dùng từ authManager
function getUserId() {
    const user = window.authManager?.getCurrentUser();
    return user ? user.id : 'anonymous';
}

// Tạo key cho localStorage dựa trên loại công cụ và ID người dùng
function getStorageKey(toolType) {
    return `${toolType}_${getUserId()}`;
}

// Kiểm tra trạng thái đăng nhập
function isLoggedIn() {
    return window.authManager?.getCurrentUser() !== null;
}

// Lấy key với ID người dùng cụ thể (dùng cho trường hợp người dùng đã đăng xuất)
function getKeyForUser(toolType, userId) {
    return `${toolType}_${userId}`;
}

// Quản lý công cụ cho Daily Quest Hub
window.toolsAPI = {
    // Các hàm công cụ chung
    getStorageKey: getStorageKey,
    getKeyForUser: getKeyForUser,
    
    // API cho Pomodoro Timer
    pomodoro: {
        // Lấy cài đặt Pomodoro
        getSettings: async function() {
            const key = getStorageKey('pomodoro');
            const savedSettings = localStorage.getItem(key);
            
            // Cài đặt mặc định
            const defaultSettings = {
                workTime: 25 * 60,  // 25 phút tính bằng giây
                breakTime: 5 * 60,  // 5 phút tính bằng giây
                completedSessions: 0
            };
            
            return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        },
        
        // Cập nhật cài đặt Pomodoro
        updateSettings: async function(settings) {
            const key = getStorageKey('pomodoro');
            const currentSettings = await this.getSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            
            localStorage.setItem(key, JSON.stringify(updatedSettings));
            return updatedSettings;
        },
        
        // Tăng số phiên đã hoàn thành
        incrementSessions: async function() {
            const key = getStorageKey('pomodoro');
            const currentSettings = await this.getSettings();
            
            const updatedSettings = {
                ...currentSettings,
                completedSessions: (currentSettings.completedSessions || 0) + 1
            };
            
            localStorage.setItem(key, JSON.stringify(updatedSettings));
            return updatedSettings;
        }
    },
    
    // API cho Quick Checklist
    checklist: {
        // Lấy danh sách kiểm tra
        getItems: async function() {
            const key = getStorageKey('checklist');
            const savedItems = localStorage.getItem(key);
            
            return savedItems ? JSON.parse(savedItems) : [];
        },
        
        // Cập nhật danh sách kiểm tra
        updateItems: async function(items) {
            const key = getStorageKey('checklist');
            localStorage.setItem(key, JSON.stringify(items));
            
            return { items };
        },
        
        // Lấy danh sách kiểm tra cho người dùng cụ thể
        getItemsForUser: async function(userId) {
            const key = getKeyForUser('checklist', userId);
            const savedItems = localStorage.getItem(key);
            
            return savedItems ? JSON.parse(savedItems) : [];
        }
    },
    
    // API cho Quick Notes
    notes: {
        // Lấy tất cả ghi chú
        getAll: async function() {
            const key = getStorageKey('notes');
            console.log("toolsAPI.notes.getAll - using key:", key);
            const savedNotes = localStorage.getItem(key);
            console.log("toolsAPI.notes.getAll - raw saved data:", savedNotes);
            
            const result = savedNotes ? JSON.parse(savedNotes) : [];
            console.log("toolsAPI.notes.getAll - returning:", result);
            return result;
        },
        
        // Lấy ghi chú cho người dùng cụ thể
        getAllForUser: async function(userId) {
            const key = getKeyForUser('notes', userId);
            const savedNotes = localStorage.getItem(key);
            
            return savedNotes ? JSON.parse(savedNotes) : [];
        },
        
        // Tạo ghi chú mới
        create: async function(content) {
            const key = getStorageKey('notes');
            const notes = await this.getAll();
            
            const newNote = {
                id: `note-${Date.now()}`,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            notes.unshift(newNote);
            localStorage.setItem(key, JSON.stringify(notes));
            
            return newNote;
        },
        
        // Cập nhật ghi chú
        update: async function(id, content) {
            const key = getStorageKey('notes');
            const notes = await this.getAll();
            
            const updatedNotes = notes.map(note => {
                if (note.id === id) {
                    return {
                        ...note,
                        content,
                        updatedAt: new Date().toISOString()
                    };
                }
                return note;
            });
            
            localStorage.setItem(key, JSON.stringify(updatedNotes));
            
            return updatedNotes.find(note => note.id === id);
        },
        
        // Xóa ghi chú
        delete: async function(id) {
            const key = getStorageKey('notes');
            const notes = await this.getAll();
            
            const filteredNotes = notes.filter(note => note.id !== id);
            localStorage.setItem(key, JSON.stringify(filteredNotes));
            
            return true;
        }
    }
};