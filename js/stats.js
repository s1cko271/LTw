// Quản lý trang thống kê cho Daily Quest Hub

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập và cập nhật UI
    const currentUser = window.authManager.getCurrentUser();
    updateNavigation(currentUser);
    
    // Nếu người dùng đã đăng nhập, tải dữ liệu thống kê
    if (currentUser) {
        loadUserStats(currentUser);
    }
});

// Cập nhật hiển thị thanh điều hướng
function updateNavigation(user) {
    const profileLink = document.getElementById('profile-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const loginRequired = document.getElementById('login-required');
    const statsData = document.getElementById('stats-data');
    
    if (user) {
        // Người dùng đã đăng nhập
        profileLink.style.display = 'inline-block';
        logoutLink.style.display = 'inline-block';
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        
        if (loginRequired && statsData) {
            loginRequired.style.display = 'none';
            statsData.style.display = 'block';
        }
    } else {
        // Người dùng chưa đăng nhập
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
        
        if (loginRequired && statsData) {
            loginRequired.style.display = 'block';
            statsData.style.display = 'none';
        }
    }
    
    // Xử lý sự kiện đăng xuất
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.authManager.handleLogout();
        });
    }
}

// Hàm tải dữ liệu thống kê người dùng
function loadUserStats(user) {
    // Trong phiên bản thực tế, dữ liệu này sẽ được lấy từ API
    // Hiện tại, chúng ta sẽ sử dụng dữ liệu từ localStorage hoặc dữ liệu mẫu
    
    // Lấy dữ liệu nhiệm vụ từ localStorage
    const quests = JSON.parse(localStorage.getItem('daily-quests')) || [];
    
    // Lọc nhiệm vụ của người dùng hiện tại (trong phiên bản thực tế)
    // const userQuests = quests.filter(quest => quest.userId === user.id);
    const userQuests = quests; // Trong phiên bản demo, sử dụng tất cả nhiệm vụ
    
    // Tính toán thống kê
    const totalQuests = userQuests.length;
    const completedQuests = userQuests.filter(quest => quest.completed).length;
    const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
    
    // Lấy số lượng thành tích (trong phiên bản thực tế sẽ lấy từ API)
    const achievementsCount = user.achievements ? user.achievements.length : Math.floor(Math.random() * 5) + 1;
    
    // Cập nhật thống kê tổng quan
    document.getElementById('total-quests').textContent = totalQuests;
    document.getElementById('completed-quests').textContent = completedQuests;
    document.getElementById('completion-rate').textContent = completionRate + '%';
    document.getElementById('achievements-count').textContent = achievementsCount;
    
    // Tạo biểu đồ tiến độ theo thời gian
    createProgressChart(userQuests);
    
    // Tạo biểu đồ phân loại nhiệm vụ
    createCategoriesChart(userQuests);
    
    // Tạo bảng lịch sử hoạt động
    createActivityTable(user, userQuests);
}

// Hàm tạo biểu đồ tiến độ theo thời gian
function createProgressChart(quests) {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Tạo dữ liệu cho 7 ngày gần nhất
    const labels = [];
    const completedData = [];
    const addedData = [];
    
    // Lấy ngày hiện tại và 6 ngày trước đó
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));
        
        // Trong phiên bản thực tế, sẽ đếm nhiệm vụ hoàn thành và thêm mới theo ngày
        // Hiện tại, tạo dữ liệu mẫu
        const dateStr = date.toDateString();
        
        // Đếm nhiệm vụ hoàn thành trong ngày
        const completedCount = quests.filter(quest => {
            if (!quest.completed) return false;
            const questDate = quest.completedDate ? new Date(quest.completedDate) : null;
            return questDate && questDate.toDateString() === dateStr;
        }).length;
        
        // Đếm nhiệm vụ thêm mới trong ngày
        const addedCount = quests.filter(quest => {
            const questDate = quest.createdDate ? new Date(quest.createdDate) : null;
            return questDate && questDate.toDateString() === dateStr;
        }).length;
        
        // Nếu không có dữ liệu thực tế, tạo dữ liệu mẫu
        completedData.push(completedCount || Math.floor(Math.random() * 3));
        addedData.push(addedCount || Math.floor(Math.random() * 4) + 1);
    }
    
    // Tạo biểu đồ
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Nhiệm vụ hoàn thành',
                    data: completedData,
                    borderColor: '#6a4c93',
                    backgroundColor: 'rgba(106, 76, 147, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Nhiệm vụ thêm mới',
                    data: addedData,
                    borderColor: '#38b000',
                    backgroundColor: 'rgba(56, 176, 0, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Hàm tạo biểu đồ phân loại nhiệm vụ
function createCategoriesChart(quests) {
    const ctx = document.getElementById('categories-chart').getContext('2d');
    
    // Đếm số lượng nhiệm vụ theo độ khó
    const easyQuests = quests.filter(quest => quest.difficulty === 'easy').length || Math.floor(Math.random() * 10) + 5;
    const mediumQuests = quests.filter(quest => quest.difficulty === 'medium').length || Math.floor(Math.random() * 8) + 3;
    const hardQuests = quests.filter(quest => quest.difficulty === 'hard').length || Math.floor(Math.random() * 5) + 1;
    
    // Tạo biểu đồ
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dễ', 'Trung bình', 'Khó'],
            datasets: [{
                label: 'Số lượng nhiệm vụ',
                data: [easyQuests, mediumQuests, hardQuests],
                backgroundColor: ['#38b000', '#f77f00', '#d62828']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Hàm tạo bảng lịch sử hoạt động
function createActivityTable(user, quests) {
    const tableBody = document.querySelector('#activity-table tbody');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ
    
    // Tạo dữ liệu mẫu cho 5 hoạt động gần nhất
    const activities = [
        { date: new Date(), type: 'Hoàn thành nhiệm vụ', details: 'Hoàn thành bài tập về nhà', xp: 10 },
        { date: new Date(Date.now() - 86400000), type: 'Thêm nhiệm vụ', details: 'Đọc sách 30 phút', xp: 0 },
        { date: new Date(Date.now() - 172800000), type: 'Hoàn thành nhiệm vụ', details: 'Tập thể dục buổi sáng', xp: 20 },
        { date: new Date(Date.now() - 259200000), type: 'Đạt thành tích', details: 'Người mới bắt đầu', xp: 50 },
        { date: new Date(Date.now() - 345600000), type: 'Hoàn thành nhiệm vụ', details: 'Học từ vựng tiếng Anh', xp: 10 }
    ];
    
    // Trong phiên bản thực tế, sẽ lấy dữ liệu từ API
    // Hiện tại, sử dụng dữ liệu mẫu
    activities.forEach(activity => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = activity.date.toLocaleDateString('vi-VN');
        row.appendChild(dateCell);
        
        const typeCell = document.createElement('td');
        typeCell.textContent = activity.type;
        row.appendChild(typeCell);
        
        const detailsCell = document.createElement('td');
        detailsCell.textContent = activity.details;
        row.appendChild(detailsCell);
        
        const xpCell = document.createElement('td');
        xpCell.textContent = activity.xp > 0 ? `+${activity.xp} XP` : '-';
        row.appendChild(xpCell);
        
        tableBody.appendChild(row);
    });
}