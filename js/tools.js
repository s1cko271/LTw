// JavaScript cho các công cụ hỗ trợ của Daily Quest Hub

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dữ liệu
    let habits = JSON.parse(localStorage.getItem('daily-quest-habits')) || [];
    
    // Lấy các phần tử modal
    const timerModal = document.getElementById('timer-modal');
    const pomodoroModal = document.getElementById('pomodoro-modal');
    const habitModal = document.getElementById('habit-modal');
    const notesModal = document.getElementById('notes-modal');
    
    // Lấy các nút mở modal
    const openTimerBtn = document.getElementById('open-timer-btn');
    const openPomodoroBtn = document.getElementById('open-pomodoro-btn');
    const openHabitBtn = document.getElementById('open-habit-btn');
    const openNotesBtn = document.getElementById('open-notes-btn');
    
    // Lấy các nút đóng modal
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Thêm sự kiện cho các nút mở modal
    if (openTimerBtn) {
        openTimerBtn.addEventListener('click', function() {
            timerModal.style.display = 'flex';
        });
    }
    
    if (openPomodoroBtn) {
        openPomodoroBtn.addEventListener('click', function() {
            pomodoroModal.style.display = 'flex';
        });
    }
    
    if (openHabitBtn) {
        openHabitBtn.addEventListener('click', function() {
            habitModal.style.display = 'flex';
            renderHabits();
        });
    }
    
    if (openNotesBtn) {
        openNotesBtn.addEventListener('click', function() {
            notesModal.style.display = 'flex';
            // Tải ghi chú đã lưu (nếu có)
            const savedNotes = localStorage.getItem('quick-notes') || '';
            document.getElementById('notes-textarea').value = savedNotes;
        });
    }
    
    // Thêm sự kiện cho các nút đóng modal
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            timerModal.style.display = 'none';
            pomodoroModal.style.display = 'none';
            habitModal.style.display = 'none';
            notesModal.style.display = 'none';
        });
    });
    
    // Đóng modal khi nhấp vào bên ngoài
    window.addEventListener('click', function(event) {
        if (event.target === timerModal) {
            timerModal.style.display = 'none';
        }
        if (event.target === pomodoroModal) {
            pomodoroModal.style.display = 'none';
        }
        if (event.target === habitModal) {
            habitModal.style.display = 'none';
        }
        if (event.target === notesModal) {
            notesModal.style.display = 'none';
        }
    });
    
    // Xử lý lưu ghi chú
    const saveNotesBtn = document.getElementById('save-notes-btn');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', function() {
            const notes = document.getElementById('notes-textarea').value;
            localStorage.setItem('quick-notes', notes);
            alert('Ghi chú đã được lưu!');
        });
    }
    
    // Xử lý đồng hồ đếm ngược
    let timerInterval;
    let timerSeconds = 25 * 60;
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    const setTimerBtn = document.getElementById('set-timer-btn');
    if (setTimerBtn) {
        setTimerBtn.addEventListener('click', function() {
            const timerMinutes = document.getElementById('timer-minutes');
            if (timerMinutes) {
                const minutes = parseInt(timerMinutes.value);
                if (minutes > 0) {
                    timerSeconds = minutes * 60;
                    updateTimerDisplay();
                }
            }
        });
    }
    
    const startTimerBtn = document.getElementById('start-timer');
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            timerInterval = setInterval(function() {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    alert('Thời gian đã hết!');
                }
            }, 1000);
        });
    }
    
    const pauseTimerBtn = document.getElementById('pause-timer');
    if (pauseTimerBtn) {
        pauseTimerBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
        });
    }
    
    const resetTimerBtn = document.getElementById('reset-timer');
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            timerSeconds = 25 * 60;
            updateTimerDisplay();
        });
    }
    
    // Xử lý Pomodoro Timer
    let pomodoroInterval;
    let pomodoroSeconds = 25 * 60;
    let isWorkPhase = true;
    let currentCycle = 1;
    let totalCycles = 4;
    let workDuration = 25;
    let breakDuration = 5;
    let longBreakDuration = 15;
    
    function updatePomodoroDisplay() {
        const minutes = Math.floor(pomodoroSeconds / 60);
        const seconds = pomodoroSeconds % 60;
        const pomodoroDisplay = document.getElementById('pomodoro-display');
        const pomodoroStatus = document.getElementById('pomodoro-status');
        
        if (pomodoroDisplay) {
            pomodoroDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (pomodoroStatus) {
            if (isWorkPhase) {
                pomodoroStatus.textContent = `Làm việc - Chu kỳ ${currentCycle}/${totalCycles}`;
            } else {
                if (currentCycle >= totalCycles) {
                    pomodoroStatus.textContent = 'Nghỉ dài';
                } else {
                    pomodoroStatus.textContent = 'Nghỉ ngắn';
                }
            }
        }
    }
    
    const savePomodoroSettingsBtn = document.getElementById('save-pomodoro-settings');
    if (savePomodoroSettingsBtn) {
        savePomodoroSettingsBtn.addEventListener('click', function() {
            const workDurationEl = document.getElementById('work-duration');
            const breakDurationEl = document.getElementById('break-duration');
            const longBreakDurationEl = document.getElementById('long-break-duration');
            const pomodoroCyclesEl = document.getElementById('pomodoro-cycles');
            
            if (workDurationEl && breakDurationEl && longBreakDurationEl && pomodoroCyclesEl) {
                workDuration = parseInt(workDurationEl.value) || 25;
                breakDuration = parseInt(breakDurationEl.value) || 5;
                longBreakDuration = parseInt(longBreakDurationEl.value) || 15;
                totalCycles = parseInt(pomodoroCyclesEl.value) || 4;
                
                // Reset timer với cài đặt mới
                clearInterval(pomodoroInterval);
                isWorkPhase = true;
                currentCycle = 1;
                pomodoroSeconds = workDuration * 60;
                updatePomodoroDisplay();
                
                alert('Đã lưu cài đặt Pomodoro!');
            }
        });
    }
    
    const startPomodoroBtn = document.getElementById('start-pomodoro');
    if (startPomodoroBtn) {
        startPomodoroBtn.addEventListener('click', function() {
            clearInterval(pomodoroInterval);
            pomodoroInterval = setInterval(function() {
                if (pomodoroSeconds > 0) {
                    pomodoroSeconds--;
                    updatePomodoroDisplay();
                } else {
                    // Kết thúc một pha
                    if (isWorkPhase) {
                        // Chuyển từ làm việc sang nghỉ
                        isWorkPhase = false;
                        
                        // Kiểm tra xem có phải nghỉ dài không
                        if (currentCycle >= totalCycles) {
                            pomodoroSeconds = longBreakDuration * 60;
                            alert('Đã hoàn thành chu kỳ làm việc! Bắt đầu nghỉ dài.');
                            currentCycle = 1; // Reset chu kỳ
                        } else {
                            pomodoroSeconds = breakDuration * 60;
                            alert('Đã hoàn thành phiên làm việc! Bắt đầu nghỉ ngắn.');
                        }
                    } else {
                        // Chuyển từ nghỉ sang làm việc
                        isWorkPhase = true;
                        if (currentCycle < totalCycles) {
                            currentCycle++;
                        }
                        pomodoroSeconds = workDuration * 60;
                        alert('Thời gian nghỉ đã kết thúc! Bắt đầu phiên làm việc mới.');
                    }
                    updatePomodoroDisplay();
                }
            }, 1000);
        });
    }
    
    const pausePomodoroBtn = document.getElementById('pause-pomodoro');
    if (pausePomodoroBtn) {
        pausePomodoroBtn.addEventListener('click', function() {
            clearInterval(pomodoroInterval);
        });
    }
    
    const resetPomodoroBtn = document.getElementById('reset-pomodoro');
    if (resetPomodoroBtn) {
        resetPomodoroBtn.addEventListener('click', function() {
            clearInterval(pomodoroInterval);
            isWorkPhase = true;
            currentCycle = 1;
            pomodoroSeconds = workDuration * 60;
            updatePomodoroDisplay();
        });
    }
    
    // Xử lý theo dõi thói quen
    function renderHabits() {
        const habitList = document.getElementById('habit-list');
        if (!habitList) return;
        
        // Xóa danh sách hiện tại
        habitList.innerHTML = '';
        
        if (habits.length === 0) {
            habitList.innerHTML = '<p>Bạn chưa có thói quen nào. Hãy thêm thói quen mới!</p>';
            return;
        }
        
        // Hiển thị danh sách thói quen
        habits.forEach((habit, index) => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `habit-${index}`;
            checkbox.checked = habit.completed;
            checkbox.addEventListener('change', function() {
                toggleHabitCompletion(index);
            });
            
            const habitName = document.createElement('span');
            habitName.classList.add('habit-name');
            habitName.textContent = habit.name;
            
            const habitStreak = document.createElement('span');
            habitStreak.classList.add('habit-streak');
            habitStreak.textContent = `${habit.streak} ngày`;
            
            habitItem.appendChild(checkbox);
            habitItem.appendChild(habitName);
            habitItem.appendChild(habitStreak);
            
            habitList.appendChild(habitItem);
        });
    }
    
    function addHabit(name) {
        const newHabit = {
            name: name,
            streak: 0,
            completed: false,
            lastCompleted: null
        };
        
        habits.push(newHabit);
        saveHabits();
        renderHabits();
    }
    
    function toggleHabitCompletion(index) {
        if (index >= 0 && index < habits.length) {
            const today = new Date().toDateString();
            const habit = habits[index];
            
            habit.completed = !habit.completed;
            
            if (habit.completed) {
                // Nếu hoàn thành, cập nhật chuỗi ngày
                if (habit.lastCompleted !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayString = yesterday.toDateString();
                    
                    if (habit.lastCompleted === yesterdayString) {
                        // Nếu hoàn thành liên tiếp
                        habit.streak++;
                    } else {
                        // Nếu bỏ lỡ một ngày, đặt lại chuỗi
                        habit.streak = 1;
                    }
                    
                    habit.lastCompleted = today;
                }
            } else {
                // Nếu bỏ đánh dấu hoàn thành trong ngày hôm nay
                if (habit.lastCompleted === today) {
                    habit.streak = Math.max(0, habit.streak - 1);
                    
                    // Đặt lại ngày hoàn thành cuối cùng
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    habit.lastCompleted = yesterday.toDateString();
                }
            }
            
            saveHabits();
            renderHabits();
        }
    }
    
    function saveHabits() {
        localStorage.setItem('daily-quest-habits', JSON.stringify(habits));
    }
    
    // Thêm sự kiện cho nút thêm thói quen
    const addHabitBtn = document.getElementById('add-habit-btn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', function() {
            const habitNameInput = document.getElementById('habit-name');
            if (habitNameInput && habitNameInput.value.trim() !== '') {
                addHabit(habitNameInput.value.trim());
                habitNameInput.value = '';
            } else {
                alert('Vui lòng nhập tên thói quen!');
            }
        });
    }
    
    // Khởi tạo hiển thị
    updateTimerDisplay();
    updatePomodoroDisplay();
});