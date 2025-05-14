class QuickChecklist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('quickChecklist')) || [];
        this.input = document.getElementById('quick-check-input');
        this.list = document.getElementById('quick-check-list');
        
        this.initializeEventListeners();
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

    addItem() {
        const text = this.input.value.trim();
        if (text) {
            const item = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            this.items.push(item);
            this.saveItems();
            this.renderItems();
            this.input.value = '';
        }
    }

    toggleItem(id) {
        this.items = this.items.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        
        this.saveItems();
        this.renderItems();
    }

    deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveItems();
        this.renderItems();
    }

    saveItems() {
        localStorage.setItem('quickChecklist', JSON.stringify(this.items));
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
}); 