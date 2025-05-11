document.addEventListener('DOMContentLoaded', function() {
    // Initialize habits array
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    const habitsContainer = document.getElementById('habits');
    const noHabits = document.getElementById('no-habits');
    
    // Set max start date to today
    document.getElementById('startDate').max = new Date().toISOString().split('T')[0];

    // Load initial habits
    renderHabits();

    // Add Habit Form Submission
    document.getElementById('addHabitForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('habitName').value;
        const startDate = document.getElementById('startDate').value;
        
        habits.push({
            id: Date.now(),
            name: name,
            startDate: startDate,
            history: {}
        });
        
        saveAndRender();
        bootstrap.Modal.getInstance(document.getElementById('addHabitModal')).hide();
        e.target.reset();
    });

    function saveAndRender() {
        localStorage.setItem('habits', JSON.stringify(habits));
        renderHabits();
    }

    function renderHabits() {
        habitsContainer.innerHTML = '';
        
        if (habits.length === 0) {
            noHabits.style.display = 'block';
            return;
        }
        
        noHabits.style.display = 'none';
        
        habits.forEach(habit => {
            const streak = calculateStreak(habit);
            const streakEmoji = streak > 7 ? '🔥🔥' : streak > 3 ? '🔥' : '';
            
            const habitEl = document.createElement('div');
            habitEl.className = 'habit-card';
            habitEl.innerHTML = `
                <div class="habit-header">
                    <div class="habit-name">${habit.name}</div>
                    <button class="btn-delete" data-id="${habit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="streak-count">${streakEmoji} Streak: ${streak} days ${streakEmoji}</div>
                <div class="calendar">${generateCalendarDays(habit)}</div>
            `;
            habitsContainer.appendChild(habitEl);
            
            // Add delete event
            habitEl.querySelector('.btn-delete').addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this habit?')) {
                    habits = habits.filter(h => h.id !== habit.id);
                    saveAndRender();
                }
            });
            
            // Add day click events
            habitEl.querySelectorAll('.day').forEach(day => {
                day.addEventListener('click', function() {
                    const date = this.dataset.date;
                    habit.history[date] = habit.history[date] === 'completed' ? 'missed' : 'completed';
                    saveAndRender();
                });
            });
        });
    }

    function generateCalendarDays(habit) {
        let html = '';
        const startDate = new Date(habit.startDate);
        const today = new Date();
        
        // Reset hours to avoid timezone issues
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        while (startDate <= today) {
            const dateStr = startDate.toISOString().split('T')[0];
            const status = habit.history[dateStr] || 'missed';
            const dayNum = startDate.getDate();
            
            html += `<div class="day ${status}" data-date="${dateStr}">${dayNum}</div>`;
            startDate.setDate(startDate.getDate() + 1);
        }
        return html;
    }

    function calculateStreak(habit) {
        let streak = 0;
        let currentStreak = 0;
        const startDate = new Date(habit.startDate);
        const today = new Date();
        
        // Reset hours to avoid timezone issues
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        while (startDate <= today) {
            const dateStr = startDate.toISOString().split('T')[0];
            if (habit.history[dateStr] === 'completed') {
                currentStreak++;
                streak = Math.max(streak, currentStreak);
            } else {
                currentStreak = 0;
            }
            startDate.setDate(startDate.getDate() + 1);
        }
        return streak;
    }
});