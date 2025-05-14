class QuickNotes {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
        this.input = document.getElementById('quick-note');
        this.list = document.getElementById('note-list');
        this.editingId = null;
        
        this.initializeEventListeners();
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

    saveNote() {
        const content = this.input.value.trim();
        if (content) {
            if (this.editingId) {
                // Update existing note
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
                this.editingId = null;
            } else {
                // Add new note
                const note = {
                    id: Date.now(),
                    content: content,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                this.notes.unshift(note); // Add to beginning of array
            }
            
            this.saveNotes();
            this.renderNotes();
            this.clearInput();
        }
    }

    editNote(id) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            this.input.value = note.content;
            this.editingId = id;
            this.input.focus();
        }
    }

    deleteNote(id) {
        if (confirm('Bạn có chắc muốn xóa ghi chú này?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveNotes();
            this.renderNotes();
        }
    }

    clearInput() {
        this.input.value = '';
        this.editingId = null;
    }

    saveNotes() {
        localStorage.setItem('quickNotes', JSON.stringify(this.notes));
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
}); 