// Khởi tạo dữ liệu
let quests = JSON.parse(localStorage.getItem('daily-quests')) || [];
let xpPoints = parseInt(localStorage.getItem('xp-points')) || 0;

// Các phần tử DOM
const questForm = document.getElementById('quest-form');
const questsContainer = document.getElementById('quests-container');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const xpCountEl = document.getElementById('xp-count');
const filterButtons = document.querySelectorAll('.filter-btn');

// Cập nhật thống kê
function updateStats() {
    const pendingQuests = quests.filter(quest => !quest.completed);
    const completedQuests = quests.filter(quest => quest.completed);
    
    pendingCountEl.textContent = pendingQuests.length;
    completedCountEl.textContent = completedQuests.length;
    xpCountEl.textContent = xpPoints;
    
    // Lưu dữ liệu vào localStorage
    localStorage.setItem('daily-quests', JSON.stringify(quests));
    localStorage.setItem('xp-points', xpPoints);
}

// Tạo thẻ nhiệm vụ
function createQuestElement(quest) {
    const questEl = document.createElement('div');
    questEl.classList.add('quest-card');
    if (quest.completed) {
        questEl.classList.add('completed');
    }
    questEl.dataset.id = quest.id;
    
    // Xác định XP dựa trên độ khó
    let xpValue = 10;
    if (quest.difficulty === 'medium') xpValue = 20;
    if (quest.difficulty === 'hard') xpValue = 30;
    
    // Định dạng ngày
    const deadlineDate = quest.deadline ? new Date(quest.deadline) : null;
    const formattedDate = deadlineDate ? deadlineDate.toLocaleDateString('vi-VN') : 'Không có hạn';
    
    // Xác định trạng thái hạn chót
    let deadlineStatus = '';
    if (deadlineDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today && !quest.completed) {
            deadlineStatus = '<span class="overdue"><i class="fas fa-exclamation-circle"></i> Quá hạn</span>';
        } else if (deadlineDate.getTime() === today.getTime() && !quest.completed) {
            deadlineStatus = '<span class="due-today"><i class="fas fa-clock"></i> Hôm nay</span>';
        }
    }
    
    // Xác định nhãn độ khó
    let difficultyLabel = 'Dễ';
    let difficultyClass = 'easy';
    if (quest.difficulty === 'medium') {
        difficultyLabel = 'Trung bình';
        difficultyClass = 'medium';
    } else if (quest.difficulty === 'hard') {
        difficultyLabel = 'Khó';
        difficultyClass = 'hard';
    }
    
    questEl.innerHTML = `
        <div class="quest-info">
            <h3>${quest.title}</h3>
            <p>${quest.description || 'Không có mô tả'}</p>
            <div class="quest-meta">
                <span class="difficulty ${difficultyClass}"><i class="fas fa-signal"></i> ${difficultyLabel} (${xpValue} XP)</span>
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                ${deadlineStatus}
            </div>
        </div>
        <div class="quest-actions">
            ${!quest.completed ? `<button class="btn-complete" title="Đánh dấu hoàn thành"><i class="fas fa-check-circle"></i></button>` : ''}
            <button class="btn-delete" title="Xóa nhiệm vụ"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Thêm sự kiện cho nút hoàn thành
    const completeBtn = questEl.querySelector('.btn-complete');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            completeQuest(quest.id);
        });
    }
    
    // Thêm sự kiện cho nút xóa
    const deleteBtn = questEl.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        deleteQuest(quest.id);
    });
    
    return questEl;
}

// Hiển thị danh sách nhiệm vụ
function renderQuests(filter = 'all') {
    questsContainer.innerHTML = '';
    
    let filteredQuests = quests;
    if (filter === 'pending') {
        filteredQuests = quests.filter(quest => !quest.completed);
    } else if (filter === 'completed') {
        filteredQuests = quests.filter(quest => quest.completed);
    }
    
    if (filteredQuests.length === 0) {
        questsContainer.innerHTML = '<p class="no-quests">Không có nhiệm vụ nào.</p>';
        return;
    }
    
    // Sắp xếp nhiệm vụ: chưa hoàn thành lên trước, sau đó sắp xếp theo deadline
    filteredQuests.sort((a, b) => {
        // Nhiệm vụ chưa hoàn thành lên trước
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Nếu cả hai cùng trạng thái, sắp xếp theo deadline
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    filteredQuests.forEach(quest => {
        questsContainer.appendChild(createQuestElement(quest));
    });
}

// Thêm nhiệm vụ mới
function addQuest(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('quest-title');
    const descriptionInput = document.getElementById('quest-description');
    const difficultyInput = document.getElementById('quest-difficulty');
    const deadlineInput = document.getElementById('quest-deadline');
    
    const newQuest = {
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        difficulty: difficultyInput.value,
        deadline: deadlineInput.value || null,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    quests.push(newQuest);
    
    // Reset form
    questForm.reset();
    
    // Cập nhật UI
    renderQuests(getCurrentFilter());
    updateStats();
    
    // Hiệu ứng thông báo
    showNotification('Nhiệm vụ mới đã được thêm!');
}

// Hoàn thành nhiệm vụ
function completeQuest(id) {
    const questIndex = quests.findIndex(q => q.id === id);
    if (questIndex !== -1) {
        quests[questIndex].completed = true;
        
        // Tính XP dựa trên độ khó
        let xpGained = 10;
        if (quests[questIndex].difficulty === 'medium') xpGained = 20;
        if (quests[questIndex].difficulty === 'hard') xpGained = 30;
        
        xpPoints += xpGained;
        
        // Cập nhật UI
        renderQuests(getCurrentFilter());
        updateStats();
        
        // Hiệu ứng thông báo
        showNotification(`Nhiệm vụ hoàn thành! +${xpGained} XP`);
    }
}

// Xóa nhiệm vụ
function deleteQuest(id) {
    quests = quests.filter(quest => quest.id !== id);
    
    // Cập nhật UI
    renderQuests(getCurrentFilter());
    updateStats();
    
    // Hiệu ứng thông báo
    showNotification('Nhiệm vụ đã bị xóa!');
}

// Hiển thị thông báo
function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Hiệu ứng hiển thị
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Lấy bộ lọc hiện tại
function getCurrentFilter() {
    const activeFilter = document.querySelector('.filter-btn.active');
    return activeFilter ? activeFilter.dataset.filter : 'all';
}

// Sự kiện
questForm.addEventListener('submit', addQuest);

// Sự kiện cho các nút lọc
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Xóa class active từ tất cả các nút
        filterButtons.forEach(b => b.classList.remove('active'));
        // Thêm class active cho nút được click
        btn.classList.add('active');
        // Render lại danh sách với bộ lọc mới
        renderQuests(btn.dataset.filter);
    });
});

// Khởi tạo ứng dụng
function initApp() {
    renderQuests();
    updateStats();
}

// Chạy ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', initApp);

// Thêm CSS cho thông báo
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification {
    position: fixed;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #6a4c93;
    color: white;
    padding: 12px 25px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: bottom 0.3s ease;
    z-index: 1000;
}

.notification.show {
    bottom: 20px;
}

.difficulty.easy {
    color: #4caf50;
}

.difficulty.medium {
    color: #ff9800;
}

.difficulty.hard {
    color: #f44336;
}

.overdue {
    color: #f44336;
}

.due-today {
    color: #ff9800;
}

.no-quests {
    text-align: center;
    color: #777;
    padding: 20px;
    font-style: italic;
}
`;

document.head.appendChild(notificationStyle);