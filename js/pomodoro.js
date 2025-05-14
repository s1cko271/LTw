class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60;  // 5 minutes in seconds
        this.timeLeft = this.workTime;
        this.isRunning = false;
        this.isWorkMode = true;
        this.timerInterval = null;
        this.totalTime = this.workTime;

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

        this.initializeEventListeners();
        this.updateDisplay();
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
}); 