class QuickChecklist {
    constructor() {
        this.items = [];
        this.input = document.getElementById('quick-check-input');
        this.list = document.getElementById('quick-check-list');
        this.currentUserId = null;
        
        this.addStyles();
        this.initializeEventListeners();
        this.loadItems();
        
        // Thêm lắng nghe sự kiện khi localStorage thay đổi để phát hiện đăng nhập/đăng xuất
        window.addEventListener('storage', (event) => {
            if (event.key === 'daily_quest_hub_secret_key') {
                // Kiểm tra thay đổi người dùng
                const newUserId = window.authManager?.getCurrentUser()?.id || 'anonymous';
                if (this.currentUserId !== newUserId) {
                    this.currentUserId = newUserId;
                    this.loadItems();
                }
            }
        });
        
        // Kiểm tra người dùng hiện tại
        this.currentUserId = window.authManager?.getCurrentUser()?.id || 'anonymous';
    }
    
    addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .checklist-item {
                display: flex;
                align-items: center;
                padding: 8px 10px;
                border-bottom: 1px solid #eee;
                transition: background-color 0.2s;
            }
            
            .checklist-item:hover {
                background-color: #f8f6fc;
            }
            
            .checklist-item.completed .checklist-text {
                text-decoration: line-through;
                color: #aaa;
            }
            
            .checklist-checkbox {
                margin-right: 10px;
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: #6a4c93;
            }
            
            .checklist-text {
                flex: 1;
                font-size: 1rem;
                color: #333;
            }
            
            .delete-item {
                background: none;
                border: none;
                color: #ccc;
                cursor: pointer;
                font-size: 0.9rem;
                padding: 5px;
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            
            .delete-item:hover {
                opacity: 1;
                color: #f44336;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    async loadItems() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        
        if (currentUser && window.toolsAPI) {
            try {
                // Lấy danh sách từ API
                this.items = await window.toolsAPI.checklist.getItems();
                // Cập nhật currentUserId
                this.currentUserId = currentUser.id;
            } catch (error) {
                console.error('Không thể tải danh sách kiểm tra:', error);
                // Nếu API thất bại, thử lấy từ localStorage theo userId
                const key = `checklist_${currentUser.id}`;
                const savedItems = localStorage.getItem(key);
                this.items = savedItems ? JSON.parse(savedItems) : [];
            }
        } else {
            // Nếu chưa đăng nhập, tải dữ liệu anonymous
            this.currentUserId = 'anonymous';
            const key = 'checklist_anonymous';
            const savedItems = localStorage.getItem(key);
            this.items = savedItems ? JSON.parse(savedItems) : [];
        }
        
        this.renderItems();
    }

    initializeEventListeners() {
        // Add new item when Enter is pressed
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addItem();
            }
        });

        // Add new item when Add button is clicked
        document.getElementById('add-check-item').addEventListener('click', () => {
            this.addItem();
        });
    }

    async addItem() {
        const text = this.input.value.trim();
        if (text) {
            const item = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            this.items.push(item);
            await this.saveItems();
            this.renderItems();
            this.input.value = '';
        }
    }

    async toggleItem(id) {
        this.items = this.items.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        
        await this.saveItems();
        this.renderItems();
    }

    async deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        await this.saveItems();
        this.renderItems();
    }

    async saveItems() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        
        if (currentUser && window.toolsAPI) {
            try {
                // Lưu danh sách qua API
                await window.toolsAPI.checklist.updateItems(this.items);
            } catch (error) {
                console.error('Không thể lưu danh sách kiểm tra:', error);
                // Nếu API thất bại, lưu theo ID người dùng
                const key = `checklist_${currentUser.id}`;
                localStorage.setItem(key, JSON.stringify(this.items));
            }
        } else if (this.currentUserId === 'anonymous') {
            // Nếu là người dùng ẩn danh, lưu vào storage dành riêng cho anonymous
            const key = 'checklist_anonymous';
            localStorage.setItem(key, JSON.stringify(this.items));
        }
    }

    renderItems() {
        this.list.innerHTML = '';
        
        this.items.forEach(item => {
            const li = document.createElement('li');
            li.className = `checklist-item ${item.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" 
                       class="checklist-checkbox" 
                       ${item.completed ? 'checked' : ''}>
                <span class="checklist-text">${item.text}</span>
                <button class="delete-item">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add event listeners
            const checkbox = li.querySelector('.checklist-checkbox');
            checkbox.addEventListener('change', () => this.toggleItem(item.id));
            
            const deleteBtn = li.querySelector('.delete-item');
            deleteBtn.addEventListener('click', () => this.deleteItem(item.id));
            
            this.list.appendChild(li);
        });
    }
}

// Initialize checklist when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const checklist = new QuickChecklist();
    
    // Thêm lắng nghe sự kiện khi đăng nhập/đăng xuất thay đổi
    document.addEventListener('auth-state-changed', () => {
        checklist.loadItems();
    });
});