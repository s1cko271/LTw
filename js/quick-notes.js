class QuickNotes {
    constructor() {
        this.notes = [];
        this.input = document.getElementById('quick-note');
        this.list = document.getElementById('note-list');
        this.editingId = null;
        this.currentUserId = null;
        
        this.addStyles();
        this.initializeEventListeners();
        this.loadNotes();
        
        // Thêm lắng nghe sự kiện khi localStorage thay đổi để phát hiện đăng nhập/đăng xuất
        window.addEventListener('storage', (event) => {
            if (event.key === 'daily_quest_hub_secret_key') {
                // Kiểm tra thay đổi người dùng
                const newUserId = window.authManager?.getCurrentUser()?.id || 'anonymous';
                if (this.currentUserId !== newUserId) {
                    this.currentUserId = newUserId;
                    this.loadNotes();
                }
            }
        });
        
        // Kiểm tra người dùng hiện tại
        this.currentUserId = window.authManager?.getCurrentUser()?.id || 'anonymous';
    }
    
    addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .note-item {
                background-color: #fff;
                border-radius: 8px;
                margin-bottom: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                padding: 15px;
                position: relative;
                transition: transform 0.2s, box-shadow 0.2s;
                border-left: 3px solid #6a4c93;
            }
            
            .note-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .note-content {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-size: 1rem;
                color: #333;
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .note-date {
                font-size: 0.8rem;
                color: #888;
                margin-bottom: 10px;
            }
            
            .note-actions {
                display: flex;
                justify-content: flex-end;
                gap: 5px;
            }
            
            .note-action-btn {
                background: none;
                border: none;
                color: #6a4c93;
                cursor: pointer;
                padding: 5px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .note-action-btn:hover {
                opacity: 1;
            }
            
            .note-action-btn.delete-note:hover {
                color: #f44336;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    async loadNotes() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        console.log("QuickNotes - loadNotes - currentUser:", currentUser);
        
        if (currentUser && window.toolsAPI) {
            try {
                // Lấy ghi chú từ API
                this.notes = await window.toolsAPI.notes.getAll();
                console.log("QuickNotes - loadNotes - notes loaded using API:", this.notes);
                // Cập nhật currentUserId
                this.currentUserId = currentUser.id;
            } catch (error) {
                console.error('Không thể tải ghi chú:', error);
                // Nếu API thất bại, thử lấy từ localStorage theo userId
                const key = `notes_${currentUser.id}`;
                const savedNotes = localStorage.getItem(key);
                console.log("QuickNotes - loadNotes - fallback to localStorage with key:", key);
                this.notes = savedNotes ? JSON.parse(savedNotes) : [];
            }
        } else {
            // Nếu chưa đăng nhập, tải dữ liệu anonymous
            this.currentUserId = 'anonymous';
            const key = 'notes_anonymous';
            const savedNotes = localStorage.getItem(key);
            console.log("QuickNotes - loadNotes - anonymous mode with key:", key);
            this.notes = savedNotes ? JSON.parse(savedNotes) : [];
        }
        
        this.renderNotes();
    }

    initializeEventListeners() {
        // Save note when Save button is clicked
        document.getElementById('save-note').addEventListener('click', () => {
            this.saveNote();
        });

        // Clear note when Clear button is clicked
        document.getElementById('clear-note').addEventListener('click', () => {
            this.clearInput();
        });
    }

    async saveNote() {
        const content = this.input.value.trim();
        if (content) {
            // Kiểm tra xem người dùng đã đăng nhập chưa
            const currentUser = window.authManager?.getCurrentUser();
            
            if (this.editingId) {
                // Cập nhật ghi chú hiện có
                if (currentUser && window.toolsAPI) {
                    try {
                        // Cập nhật qua API
                        const updatedNote = await window.toolsAPI.notes.update(this.editingId, content);
                        
                        // Cập nhật danh sách ghi chú cục bộ
                        this.notes = this.notes.map(note => {
                            if (note._id === this.editingId || note.id === this.editingId) {
                                return updatedNote;
                            }
                            return note;
                        });
                    } catch (error) {
                        console.error('Không thể cập nhật ghi chú:', error);
                        // Cập nhật cục bộ nếu API thất bại
                        this.notes = this.notes.map(note => {
                            if (note.id === this.editingId) {
                                return {
                                    ...note,
                                    content: content,
                                    updatedAt: new Date().toISOString()
                                };
                            }
                            return note;
                        });
                    }
                } else {
                    // Cập nhật cục bộ nếu không đăng nhập
                    this.notes = this.notes.map(note => {
                        if (note.id === this.editingId) {
                            return {
                                ...note,
                                content: content,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return note;
                    });
                }
                
                this.editingId = null;
            } else {
                // Thêm ghi chú mới
                if (currentUser && window.toolsAPI) {
                    try {
                        // Tạo ghi chú mới qua API
                        const newNote = await window.toolsAPI.notes.create(content);
                        this.notes.unshift(newNote);
                    } catch (error) {
                        console.error('Không thể tạo ghi chú mới:', error);
                        // Thêm cục bộ nếu API thất bại
                        const note = {
                            id: Date.now(),
                            content: content,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        this.notes.unshift(note);
                    }
                } else {
                    // Thêm cục bộ nếu không đăng nhập
                    const note = {
                        id: Date.now(),
                        content: content,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    this.notes.unshift(note);
                }
            }
            
            // Lưu vào localStorage
            this.saveNotes();
            this.renderNotes();
            this.clearInput();
        }
    }

    editNote(id) {
        const note = this.notes.find(note => note._id === id || note.id === id);
        if (note) {
            this.input.value = note.content;
            this.editingId = note._id || note.id;
            this.input.focus();
        }
    }

    async deleteNote(id) {
        if (confirm('Bạn có chắc muốn xóa ghi chú này?')) {
            // Kiểm tra xem người dùng đã đăng nhập chưa
            const currentUser = window.authManager?.getCurrentUser();
            
            if (currentUser && window.toolsAPI) {
                try {
                    // Xóa ghi chú qua API
                    await window.toolsAPI.notes.delete(id);
                } catch (error) {
                    console.error('Không thể xóa ghi chú:', error);
                }
            }
            
            // Xóa khỏi danh sách cục bộ
            this.notes = this.notes.filter(note => note._id !== id && note.id !== id);
            this.saveNotes();
            this.renderNotes();
        }
    }

    clearInput() {
        this.input.value = '';
        this.editingId = null;
    }

    saveNotes() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        console.log("QuickNotes - saveNotes - currentUser:", currentUser);
        
        if (currentUser && window.toolsAPI) {
            try {
                // Lưu qua API
                const key = `notes_${currentUser.id}`;
                console.log("QuickNotes - saveNotes - saving with key:", key, this.notes);
                localStorage.setItem(key, JSON.stringify(this.notes));
            } catch (error) {
                console.error('Không thể lưu ghi chú:', error);
            }
        } else if (this.currentUserId === 'anonymous') {
            // Nếu là người dùng ẩn danh, lưu vào storage dành riêng cho anonymous
            const key = 'notes_anonymous';
            console.log("QuickNotes - saveNotes - saving anonymous with key:", key);
            localStorage.setItem(key, JSON.stringify(this.notes));
        } else {
            console.warn("QuickNotes - saveNotes - skipped saving because no valid user ID");
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderNotes() {
        this.list.innerHTML = '';
        
        this.notes.forEach(note => {
            const li = document.createElement('li');
            li.className = 'note-item';
            
            const isEdited = note.createdAt !== note.updatedAt;
            const dateText = isEdited ? 'Cập nhật: ' : 'Tạo: ';
            const dateValue = isEdited ? note.updatedAt : note.createdAt;
            
            li.innerHTML = `
                <div class="note-content">${note.content}</div>
                <div class="note-date">${dateText}${this.formatDate(dateValue)}</div>
                <div class="note-actions">
                    <button class="note-action-btn edit-note" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-action-btn delete-note" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const editBtn = li.querySelector('.edit-note');
            editBtn.addEventListener('click', () => this.editNote(note.id));
            
            const deleteBtn = li.querySelector('.delete-note');
            deleteBtn.addEventListener('click', () => this.deleteNote(note.id));
            
            this.list.appendChild(li);
        });
    }
}

// Initialize notes when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const notes = new QuickNotes();
    
    // Thêm lắng nghe sự kiện khi đăng nhập/đăng xuất thay đổi
    document.addEventListener('auth-state-changed', () => {
        notes.loadNotes();
    });
});