// Recursos Avançados do Dashboard Pessoal Inteligente

class AdvancedFeatures {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.trafficData = null;
        this.motivationalQuotes = [
            "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
            "A produtividade não é sobre fazer mais coisas, é sobre fazer as coisas certas.",
            "Cada pequeno passo te leva mais perto do seu objetivo.",
            "A disciplina é a ponte entre objetivos e conquistas.",
            "Foque no progresso, não na perfeição.",
            "O tempo que você gasta organizando é tempo que você economiza executando.",
            "Pequenas melhorias diárias levam a resultados impressionantes.",
            "A consistência é mais importante que a intensidade."
        ];
        this.init();
    }

    init() {
        this.addMotivationalQuote();
        this.setupNotifications();
        this.loadTrafficData();
        this.setupKeyboardShortcuts();
        this.addAdvancedAnalytics();
        
        // Update traffic data every hour
        setInterval(() => this.loadTrafficData(), 60 * 60 * 1000);
        
        // Show motivational quote every 2 hours
        setInterval(() => this.addMotivationalQuote(), 2 * 60 * 60 * 1000);
    }

    addMotivationalQuote() {
        const quote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        
        // Add quote to suggestions if not already present
        const suggestionsList = document.getElementById('suggestions-list');
        const quoteHTML = `
            <div class="suggestion-item motivational-quote" style="border-left-color: var(--accent-color);">
                <i class="fas fa-quote-left suggestion-icon"></i>
                <div class="suggestion-text">
                    <strong>Motivação do Dia</strong><br>
                    <em>${quote}</em>
                </div>
            </div>
        `;
        
        // Remove existing motivational quote if present
        const existingQuote = suggestionsList.querySelector('.motivational-quote');
        if (existingQuote) {
            existingQuote.remove();
        }
        
        // Add new quote at the beginning
        suggestionsList.insertAdjacentHTML('afterbegin', quoteHTML);
    }

    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Set up periodic reminders
        this.setupBreakReminders();
        this.setupTaskReminders();
    }

    setupBreakReminders() {
        // Remind user to take breaks every 90 minutes
        setInterval(() => {
            if (Notification.permission === 'granted') {
                new Notification('Hora da Pausa! 🧘‍♀️', {
                    body: 'Você está trabalhando há um tempo. Que tal uma pausa de 5 minutos?',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">☕</text></svg>'
                });
            }
        }, 90 * 60 * 1000); // 90 minutes
    }

    setupTaskReminders() {
        // Check for overdue high-priority tasks every 30 minutes
        setInterval(() => {
            const highPriorityTasks = this.dashboard.tasks.filter(t => 
                !t.completed && t.priority === 'high'
            );
            
            if (highPriorityTasks.length > 0 && Notification.permission === 'granted') {
                new Notification('Tarefas Prioritárias Pendentes! ⚡', {
                    body: `Você tem ${highPriorityTasks.length} tarefa(s) de alta prioridade aguardando.`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>'
                });
            }
        }, 30 * 60 * 1000); // 30 minutes
    }

    async loadTrafficData() {
        try {
            // Simulated traffic data (in real implementation, use traffic API)
            const trafficConditions = [
                { route: 'Casa → Trabalho', time: '25 min', status: 'normal', color: 'var(--success-color)' },
                { route: 'Centro → Shopping', time: '18 min', status: 'lento', color: 'var(--warning-color)' },
                { route: 'Aeroporto → Centro', time: '45 min', status: 'congestionado', color: 'var(--danger-color)' }
            ];
            
            this.trafficData = trafficConditions;
            this.updateTrafficDisplay();
        } catch (error) {
            console.error('Erro ao carregar dados de trânsito:', error);
        }
    }

    updateTrafficDisplay() {
        if (!this.trafficData) return;
        
        // Add traffic widget to dashboard
        const dashboardGrid = document.querySelector('.dashboard-grid');
        
        // Check if traffic card already exists
        let trafficCard = document.getElementById('traffic-card');
        if (!trafficCard) {
            trafficCard = document.createElement('div');
            trafficCard.id = 'traffic-card';
            trafficCard.className = 'card';
            dashboardGrid.appendChild(trafficCard);
        }
        
        trafficCard.innerHTML = `
            <div class="card-header">
                <i class="fas fa-route card-icon"></i>
                <h2 class="card-title">Condições de Trânsito</h2>
            </div>
            <div id="traffic-list">
                ${this.trafficData.map(route => `
                    <div class="traffic-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 3px solid ${route.color};">
                        <div>
                            <div style="font-weight: 600;">${route.route}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Status: ${route.status}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: ${route.color};">${route.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: Add task quickly
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const taskInput = document.getElementById('task-input');
                if (taskInput.value.trim()) {
                    this.dashboard.addTask();
                } else {
                    taskInput.focus();
                }
            }
            
            // Ctrl/Cmd + Shift + F: Start focus timer
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.dashboard.startFocusTimer();
            }
            
            // Ctrl/Cmd + Shift + B: Take break
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                this.dashboard.takeBreak();
            }
            
            // Escape: Stop focus timer
            if (e.key === 'Escape' && this.dashboard.isTimerRunning) {
                e.preventDefault();
                this.dashboard.stopFocusTimer();
            }
        });
        
        // Add keyboard shortcuts info to the dashboard
        this.addKeyboardShortcutsInfo();
    }

    addKeyboardShortcutsInfo() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        
        const shortcutsCard = document.createElement('div');
        shortcutsCard.className = 'card';
        shortcutsCard.innerHTML = `
            <div class="card-header">
                <i class="fas fa-keyboard card-icon"></i>
                <h2 class="card-title">Atalhos do Teclado</h2>
            </div>
            <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <span>Adicionar tarefa</span>
                    <kbd style="background: var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">Ctrl + Enter</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <span>Iniciar foco</span>
                    <kbd style="background: var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">Ctrl + Shift + F</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <span>Fazer pausa</span>
                    <kbd style="background: var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">Ctrl + Shift + B</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <span>Parar timer</span>
                    <kbd style="background: var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">Esc</kbd>
                </div>
            </div>
        `;
        
        dashboardGrid.appendChild(shortcutsCard);
    }

    addAdvancedAnalytics() {
        // Track user behavior and provide insights
        this.analytics = {
            sessionStart: Date.now(),
            tasksCreated: 0,
            tasksCompleted: 0,
            focusSessions: 0,
            mostProductiveHour: null
        };
        
        // Load existing analytics
        const savedAnalytics = localStorage.getItem('dashboard-analytics');
        if (savedAnalytics) {
            this.analytics = { ...this.analytics, ...JSON.parse(savedAnalytics) };
        }
        
        // Track task creation and completion
        const originalAddTask = this.dashboard.addTask.bind(this.dashboard);
        this.dashboard.addTask = () => {
            originalAddTask();
            this.analytics.tasksCreated++;
            this.saveAnalytics();
        };
        
        const originalToggleTask = this.dashboard.toggleTask.bind(this.dashboard);
        this.dashboard.toggleTask = (id) => {
            const task = this.dashboard.tasks.find(t => t.id === id);
            const wasCompleted = task ? task.completed : false;
            
            originalToggleTask(id);
            
            if (task && !wasCompleted && task.completed) {
                this.analytics.tasksCompleted++;
                this.saveAnalytics();
            }
        };
        
        // Track focus sessions
        const originalStartFocusTimer = this.dashboard.startFocusTimer.bind(this.dashboard);
        this.dashboard.startFocusTimer = () => {
            originalStartFocusTimer();
            this.analytics.focusSessions++;
            this.saveAnalytics();
        };
        
        // Generate weekly report
        this.generateWeeklyInsights();
    }

    saveAnalytics() {
        localStorage.setItem('dashboard-analytics', JSON.stringify(this.analytics));
    }

    generateWeeklyInsights() {
        const insights = [];
        
        if (this.analytics.tasksCompleted > 0) {
            const completionRate = (this.analytics.tasksCompleted / this.analytics.tasksCreated * 100).toFixed(1);
            insights.push(`Taxa de conclusão: ${completionRate}%`);
        }
        
        if (this.analytics.focusSessions > 0) {
            insights.push(`${this.analytics.focusSessions} sessões de foco realizadas`);
        }
        
        const sessionTime = Math.floor((Date.now() - this.analytics.sessionStart) / (1000 * 60));
        if (sessionTime > 0) {
            insights.push(`${sessionTime} minutos de uso hoje`);
        }
        
        // Add insights to suggestions
        if (insights.length > 0) {
            const suggestionsList = document.getElementById('suggestions-list');
            const insightsHTML = `
                <div class="suggestion-item analytics-insight" style="border-left-color: var(--primary-color);">
                    <i class="fas fa-chart-bar suggestion-icon"></i>
                    <div class="suggestion-text">
                        <strong>Insights da Semana</strong><br>
                        ${insights.join(' • ')}
                    </div>
                </div>
            `;
            
            // Remove existing insights if present
            const existingInsight = suggestionsList.querySelector('.analytics-insight');
            if (existingInsight) {
                existingInsight.remove();
            }
            
            suggestionsList.insertAdjacentHTML('beforeend', insightsHTML);
        }
    }

    // Pomodoro technique integration
    setupPomodoroMode() {
        let pomodoroCount = 0;
        const originalStopFocusTimer = this.dashboard.stopFocusTimer.bind(this.dashboard);
        
        this.dashboard.stopFocusTimer = () => {
            originalStopFocusTimer();
            pomodoroCount++;
            
            if (pomodoroCount % 4 === 0) {
                alert('Parabéns! Você completou 4 pomodoros. Hora de uma pausa longa (15-30 minutos)!');
            } else {
                alert('Pomodoro concluído! Faça uma pausa de 5 minutos antes do próximo.');
            }
        };
    }

    // Dark/Light theme toggle
    setupThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.className = 'btn btn-primary';
        themeToggle.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 10px; border-radius: 50%;';
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('dashboard-theme', isLight ? 'light' : 'dark');
        });
        
        document.body.appendChild(themeToggle);
        
        // Load saved theme
        const savedTheme = localStorage.getItem('dashboard-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

// Initialize advanced features when dashboard is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard) {
            window.advancedFeatures = new AdvancedFeatures(window.dashboard);
        }
    }, 1000);
});