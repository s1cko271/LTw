class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60;  // 5 minutes in seconds
        this.timeLeft = this.workTime;
        this.isRunning = false;
        this.isWorkMode = true;
        this.timerInterval = null;
        this.totalTime = this.workTime;
        this.completedSessions = 0;
        this.currentUserId = null;

        // DOM elements
        this.display = document.getElementById('timer-display');
        this.progressBar = document.getElementById('progress-bar');
        this.statusText = document.getElementById('timer-status');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.workModeBtn = document.getElementById('work-mode');
        this.breakModeBtn = document.getElementById('break-mode');
        this.container = document.getElementById('pomodoro-container');

        this.addStyles();
        this.initializeEventListeners();
        this.loadSettings();
        
        // Thêm lắng nghe sự kiện khi localStorage thay đổi để phát hiện đăng nhập/đăng xuất
        window.addEventListener('storage', (event) => {
            if (event.key === 'daily_quest_hub_secret_key') {
                // Kiểm tra thay đổi người dùng
                const newUserId = window.authManager?.getCurrentUser()?.id || 'anonymous';
                if (this.currentUserId !== newUserId) {
                    this.currentUserId = newUserId;
                    this.loadSettings();
                }
            }
        });
        
        // Kiểm tra người dùng hiện tại
        this.currentUserId = window.authManager?.getCurrentUser()?.id || 'anonymous';
    }

    addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .pomodoro-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
            }
            
            .timer-mode {
                display: flex;
                margin-bottom: 15px;
            }
            
            .mode-btn {
                padding: 8px 16px;
                border: none;
                background-color: #e0d0f7;
                color: #6a4c93;
                cursor: pointer;
                transition: background-color 0.2s;
                border-radius: 20px;
                margin: 0 5px;
                font-weight: 500;
            }
            
            .mode-btn.active {
                background-color: #6a4c93;
                color: white;
            }
            
            .timer-display {
                font-size: 3.5rem;
                font-weight: bold;
                color: #6a4c93;
                margin: 15px 0;
                font-family: 'Courier New', monospace;
                letter-spacing: 2px;
            }
            
            .timer-progress {
                width: 100%;
                height: 6px;
                background-color: #e0d0f7;
                border-radius: 3px;
                margin: 10px 0;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background-color: #6a4c93;
                width: 0%;
                transition: width 1s linear;
            }
            
            .timer-status {
                font-size: 1.1rem;
                color: #666;
                margin-bottom: 15px;
            }
            
            .timer-controls {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .timer-active {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(106, 76, 147, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(106, 76, 147, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(106, 76, 147, 0);
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    async loadSettings() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        
        if (currentUser && window.toolsAPI) {
            try {
                // Lấy cài đặt từ API
                const settings = await window.toolsAPI.pomodoro.getSettings();
                
                // Cập nhật cài đặt
                this.workTime = settings.workTime || this.workTime;
                this.breakTime = settings.breakTime || this.breakTime;
                this.completedSessions = settings.completedSessions || 0;
                
                // Cập nhật thời gian còn lại dựa trên chế độ hiện tại
                this.timeLeft = this.isWorkMode ? this.workTime : this.breakTime;
                this.totalTime = this.timeLeft;
                
                // Cập nhật currentUserId
                this.currentUserId = currentUser.id;
            } catch (error) {
                console.error('Không thể tải cài đặt Pomodoro:', error);
            }
        } else {
            // Đặt lại giá trị mặc định nếu không đăng nhập
            this.workTime = 25 * 60;
            this.breakTime = 5 * 60;
            this.completedSessions = 0;
            this.timeLeft = this.isWorkMode ? this.workTime : this.breakTime;
            this.totalTime = this.timeLeft;
            this.currentUserId = 'anonymous';
        }
        
        this.updateDisplay();
    }
    
    async saveSettings() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        
        if (currentUser && window.toolsAPI) {
            try {
                // Lưu cài đặt qua API
                await window.toolsAPI.pomodoro.updateSettings({
                    workTime: this.workTime,
                    breakTime: this.breakTime
                });
            } catch (error) {
                console.error('Không thể lưu cài đặt Pomodoro:', error);
            }
        }
    }
    
    async incrementCompletedSessions() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = window.authManager?.getCurrentUser();
        
        if (currentUser && window.toolsAPI) {
            try {
                // Tăng số phiên đã hoàn thành qua API
                const result = await window.toolsAPI.pomodoro.incrementSessions();
                this.completedSessions = result.completedSessions;
            } catch (error) {
                console.error('Không thể cập nhật số phiên Pomodoro:', error);
                // Tăng số phiên cục bộ nếu API thất bại
                this.completedSessions++;
            }
        } else {
            // Tăng số phiên cục bộ nếu không đăng nhập
            this.completedSessions++;
        }
    }
    
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.workModeBtn.addEventListener('click', () => this.switchMode(true));
        this.breakModeBtn.addEventListener('click', () => this.switchMode(false));
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.container.classList.add('timer-active');
            this.timerInterval = setInterval(() => this.tick(), 1000);
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'inline-flex';
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.container.classList.remove('timer-active');
            clearInterval(this.timerInterval);
            this.startBtn.style.display = 'inline-flex';
            this.pauseBtn.style.display = 'none';
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.isWorkMode ? this.workTime : this.breakTime;
        this.totalTime = this.timeLeft;
        this.updateDisplay();
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
        } else {
            this.playAlarm();
            
            // Nếu kết thúc một phiên làm việc, tăng số phiên đã hoàn thành
            if (this.isWorkMode) {
                this.incrementCompletedSessions();
            }
            
            this.switchMode(!this.isWorkMode);
        }
    }

    switchMode(isWork) {
        this.isWorkMode = isWork;
        this.timeLeft = isWork ? this.workTime : this.breakTime;
        this.totalTime = this.timeLeft;
        
        // Update mode buttons
        this.workModeBtn.classList.toggle('active', isWork);
        this.breakModeBtn.classList.toggle('active', !isWork);
        
        // Update status text
        this.statusText.textContent = isWork ? 'Thời gian làm việc' : 'Thời gian nghỉ ngơi';
        
        this.updateDisplay();
        this.pause();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Update progress bar
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    playAlarm() {
        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.play();
        
        // Show notification if browser supports it
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(
                        this.isWorkMode ? 'Đã đến lúc nghỉ ngơi!' : 'Đã đến lúc làm việc!',
                        {
                            body: this.isWorkMode ? 'Hãy nghỉ ngơi 5 phút.' : 'Hãy bắt đầu làm việc.',
                            icon: '/path/to/icon.png'
                        }
                    );
                }
            });
        }
    }
}

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
    // Thêm lắng nghe sự kiện khi đăng nhập/đăng xuất thay đổi
    document.addEventListener('auth-state-changed', () => {
        timer.loadSettings();
    });
});