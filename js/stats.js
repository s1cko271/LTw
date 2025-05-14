// Quản lý thống kê trong Daily Quest Hub

document.addEventListener('DOMContentLoaded', function() {
    initializeStats();
    
    // Thêm lắng nghe sự kiện khi đăng nhập/đăng xuất
    document.addEventListener('auth-state-changed', function() {
        initializeStats();
    });
});

// Khởi tạo và hiển thị thống kê
function initializeStats() {
    const currentUser = window.authManager?.getCurrentUser();
    const loginNotice = document.getElementById('login-notice');
    
    if (currentUser) {
        console.log('Initializing stats for user:', currentUser.username);
        // Ẩn thông báo đăng nhập
        if (loginNotice) loginNotice.style.display = 'none';
        
        updateUserStats(currentUser);
        loadAndDisplayChartData(currentUser);
        displayAchievements(currentUser.achievements || []);
    } else {
        console.log('No user logged in, showing sample stats');
        // Hiển thị thông báo đăng nhập
        if (loginNotice) loginNotice.style.display = 'block';
        
        displaySampleStats();
        displaySampleAchievements();
    }
}

// Cập nhật số liệu thống kê người dùng
function updateUserStats(user) {
    const totalQuests = user.quests ? user.quests.length : 0;
    const completedQuests = user.quests ? user.quests.filter(quest => quest.completed).length : 0;
    const xpPoints = user.xp || 0;
    const userLevel = user.level || 1;
    
    // Cập nhật giao diện
    document.getElementById('total-quests').textContent = totalQuests;
    document.getElementById('completed-quests').textContent = completedQuests;
    document.getElementById('xp-points').textContent = xpPoints;
    document.getElementById('user-level').textContent = userLevel;
}

// Hiển thị dữ liệu mẫu khi không đăng nhập
function displaySampleStats() {
    document.getElementById('total-quests').textContent = '0';
    document.getElementById('completed-quests').textContent = '0';
    document.getElementById('xp-points').textContent = '0';
    document.getElementById('user-level').textContent = '0';
    
    // Cập nhật biểu đồ với dữ liệu mẫu
    updateChart(
        ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        [0, 0, 0, 0, 0, 0, 0]
    );
}

// Tải và hiển thị dữ liệu biểu đồ cho người dùng
function loadAndDisplayChartData(user) {
    // Lấy quests từ người dùng
    const quests = user.quests || [];
    
    // Tạo dữ liệu theo ngày
    const last7Days = getLast7Days();
    const completedByDay = calculateCompletedByDay(quests, last7Days);
    
    // Cập nhật biểu đồ
    updateChart(
        last7Days.map(formatDayLabel),
        completedByDay
    );
}

// Lấy 7 ngày gần nhất
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(formatDate(date));
    }
    return days;
}

// Định dạng ngày thành chuỗi YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Định dạng label ngày cho biểu đồ
function formatDayLabel(dateStr) {
    const date = new Date(dateStr);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
}

// Tính toán số nhiệm vụ hoàn thành theo ngày
function calculateCompletedByDay(quests, days) {
    const completedByDay = Array(days.length).fill(0);
    
    quests.forEach(quest => {
        if (quest.completed && quest.completedAt) {
            const completedDate = formatDate(new Date(quest.completedAt));
            const dayIndex = days.indexOf(completedDate);
            if (dayIndex !== -1) {
                completedByDay[dayIndex]++;
            }
        }
    });
    
    return completedByDay;
}

// Hiển thị thành tích người dùng
function displayAchievements(achievements) {
    const container = document.getElementById('achievement-container');
    container.innerHTML = '';
    
    // Mảng thành tích mặc định để hiển thị (đã đạt được và chưa đạt được)
    const defaultAchievements = [
        {
            id: 'achievement-1',
            title: 'Người mới bắt đầu',
            description: 'Hoàn thành nhiệm vụ đầu tiên',
            icon: 'fa-award',
            condition: 'Hoàn thành 1 nhiệm vụ'
        },
        {
            id: 'achievement-2',
            title: 'Siêng năng',
            description: 'Hoàn thành 5 nhiệm vụ',
            icon: 'fa-medal',
            condition: 'Hoàn thành 5 nhiệm vụ'
        },
        {
            id: 'achievement-3',
            title: 'Chuyên nghiệp',
            description: 'Hoàn thành 10 nhiệm vụ',
            icon: 'fa-trophy',
            condition: 'Hoàn thành 10 nhiệm vụ'
        },
        {
            id: 'achievement-4',
            title: 'Bậc thầy',
            description: 'Hoàn thành 50 nhiệm vụ',
            icon: 'fa-crown',
            condition: 'Hoàn thành 50 nhiệm vụ'
        },
        {
            id: 'achievement-5',
            title: 'Người kiên trì',
            description: 'Đạt 100 điểm XP',
            icon: 'fa-star',
            condition: 'Đạt 100 XP'
        },
        {
            id: 'achievement-6',
            title: 'Kỷ luật',
            description: 'Hoàn thành nhiệm vụ 3 ngày liên tiếp',
            icon: 'fa-calendar-check',
            condition: '3 ngày liên tiếp'
        },
        {
            id: 'achievement-7',
            title: 'Thói quen tốt',
            description: 'Hoàn thành nhiệm vụ 7 ngày liên tiếp',
            icon: 'fa-calendar-week',
            condition: '7 ngày liên tiếp'
        },
        {
            id: 'achievement-8',
            title: 'Người có kế hoạch',
            description: 'Tạo 5 nhiệm vụ cùng lúc',
            icon: 'fa-clipboard-list',
            condition: 'Tạo 5 nhiệm vụ'
        },
        {
            id: 'achievement-9',
            title: 'Cao thủ',
            description: 'Đạt 500 điểm XP',
            icon: 'fa-gem',
            condition: 'Đạt 500 XP'
        },
        {
            id: 'achievement-10',
            title: 'Chuyên gia',
            description: 'Hoàn thành 100 nhiệm vụ',
            icon: 'fa-certificate',
            condition: 'Hoàn thành 100 nhiệm vụ'
        }
    ];
    
    // ID thành tích đã đạt được
    const achievedIds = achievements.map(achievement => achievement.id);
    
    // Hiển thị tất cả thành tích
    defaultAchievements.forEach(achievement => {
        const isAchieved = achievedIds.includes(achievement.id);
        const achievedData = isAchieved ? 
            achievements.find(a => a.id === achievement.id) : null;
        
        const card = document.createElement('div');
        card.className = `achievement-card ${isAchieved ? '' : 'locked'}`;
        
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.title}</div>
            <div class="achievement-desc">${achievement.description}</div>
            ${isAchieved && achievedData.date ? 
                `<div class="achievement-date">Đạt được: ${formatAchievementDate(achievedData.date)}</div>` : 
                `<div class="achievement-date">${achievement.condition}</div>`
            }
        `;
        
        container.appendChild(card);
    });
}

// Hiển thị thành tích mẫu khi chưa đăng nhập
function displaySampleAchievements() {
    const container = document.getElementById('achievement-container');
    container.innerHTML = '';
    
    // Thành tích mặc định khi chưa đăng nhập - hiển thị đầy đủ danh sách thành tựu
    const sampleAchievements = [
        {
            title: 'Người mới bắt đầu',
            description: 'Hoàn thành nhiệm vụ đầu tiên',
            icon: 'fa-award',
            condition: 'Hoàn thành 1 nhiệm vụ'
        },
        {
            title: 'Siêng năng',
            description: 'Hoàn thành 5 nhiệm vụ',
            icon: 'fa-medal',
            condition: 'Hoàn thành 5 nhiệm vụ'
        },
        {
            title: 'Chuyên nghiệp',
            description: 'Hoàn thành 10 nhiệm vụ',
            icon: 'fa-trophy',
            condition: 'Hoàn thành 10 nhiệm vụ'
        },
        {
            title: 'Bậc thầy',
            description: 'Hoàn thành 50 nhiệm vụ',
            icon: 'fa-crown',
            condition: 'Hoàn thành 50 nhiệm vụ'
        },
        {
            title: 'Người kiên trì',
            description: 'Đạt 100 điểm XP',
            icon: 'fa-star',
            condition: 'Đạt 100 XP'
        },
        {
            title: 'Kỷ luật',
            description: 'Hoàn thành nhiệm vụ 3 ngày liên tiếp',
            icon: 'fa-calendar-check',
            condition: '3 ngày liên tiếp'
        },
        {
            title: 'Thói quen tốt',
            description: 'Hoàn thành nhiệm vụ 7 ngày liên tiếp',
            icon: 'fa-calendar-week',
            condition: '7 ngày liên tiếp'
        },
        {
            title: 'Người có kế hoạch',
            description: 'Tạo 5 nhiệm vụ cùng lúc',
            icon: 'fa-clipboard-list',
            condition: 'Tạo 5 nhiệm vụ'
        },
        {
            title: 'Cao thủ',
            description: 'Đạt 500 điểm XP',
            icon: 'fa-gem',
            condition: 'Đạt 500 XP'
        },
        {
            title: 'Chuyên gia',
            description: 'Hoàn thành 100 nhiệm vụ',
            icon: 'fa-certificate',
            condition: 'Hoàn thành 100 nhiệm vụ'
        }
    ];
    
    // Hiển thị các thành tích mẫu (tất cả đều bị khóa)
    sampleAchievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = 'achievement-card locked';
        
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.title}</div>
            <div class="achievement-desc">${achievement.description}</div>
            <div class="achievement-date">${achievement.condition}</div>
        `;
        
        container.appendChild(card);
    });
}

// Định dạng ngày của thành tích
function formatAchievementDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Không xác định';
    }
    
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

// Cập nhật biểu đồ
function updateChart(labels, data) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Xóa biểu đồ cũ nếu có
    if (window.progressChart instanceof Chart) {
        window.progressChart.destroy();
    }
    
    // Tạo biểu đồ mới
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nhiệm vụ hoàn thành',
                data: data,
                borderColor: '#6a4c93',
                backgroundColor: 'rgba(106,76,147,0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(tooltipItem) {
                            return `${tooltipItem.formattedValue} nhiệm vụ hoàn thành`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}