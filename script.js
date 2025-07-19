// Dashboard Pessoal Inteligente - JavaScript
class PersonalDashboard {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('dashboard-tasks')) || [];
        this.focusTimer = null;
        this.focusTime = 0;
        this.isTimerRunning = false;
        this.weatherData = null;
        this.newsData = [];
        
        this.init();
    }

    init() {
        this.updateTime();
        this.loadWeather();
        this.loadNews();
        this.renderTasks();
        this.updateStats();
        this.generateSmartSuggestions();
        
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
        
        // Update weather every 30 minutes
        setInterval(() => this.loadWeather(), 30 * 60 * 1000);
        
        // Update news every 15 minutes
        setInterval(() => this.loadNews(), 15 * 60 * 1000);
        
        // Update suggestions every 5 minutes
        setInterval(() => this.generateSmartSuggestions(), 5 * 60 * 1000);
        
        // Setup task input enter key
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('current-time').innerHTML = `
            <div style="font-size: 1.5rem; margin-top: 10px;">
                <i class="fas fa-clock"></i> ${timeString}
            </div>
            <div style="color: var(--text-secondary); margin-top: 5px;">
                ${dateString}
            </div>
        `;
    }

    async loadWeather() {
        try {
            // Using Open-Meteo API (free, no key required)
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,visibility&timezone=America/Sao_Paulo');
            const data = await response.json();
            
            if (data.current_weather) {
                this.weatherData = data;
                this.updateWeatherDisplay(data);
                this.generateWeatherSuggestions(data.current_weather);
            }
        } catch (error) {
            console.error('Erro ao carregar clima:', error);
            this.displayWeatherError();
        }
    }

    updateWeatherDisplay(data) {
        const current = data.current_weather;
        const hourly = data.hourly;
        
        document.getElementById('temperature').textContent = `${Math.round(current.temperature)}°C`;
        document.getElementById('location').textContent = 'São Paulo, SP';
        
        // Weather description based on weather code
        const weatherDescriptions = {
            0: 'Céu limpo',
            1: 'Principalmente limpo',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Neblina',
            48: 'Neblina com geada',
            51: 'Garoa leve',
            53: 'Garoa moderada',
            55: 'Garoa intensa',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva intensa',
            80: 'Pancadas de chuva'
        };
        
        const description = weatherDescriptions[current.weathercode] || 'Condição desconhecida';
        document.getElementById('weather-description').textContent = description;
        
        // Weather icon based on weather code
        const weatherIcons = {
            0: 'fas fa-sun',
            1: 'fas fa-sun',
            2: 'fas fa-cloud-sun',
            3: 'fas fa-cloud',
            45: 'fas fa-smog',
            48: 'fas fa-smog',
            51: 'fas fa-cloud-rain',
            53: 'fas fa-cloud-rain',
            55: 'fas fa-cloud-showers-heavy',
            61: 'fas fa-cloud-rain',
            63: 'fas fa-cloud-rain',
            65: 'fas fa-cloud-showers-heavy',
            80: 'fas fa-cloud-showers-heavy'
        };
        
        const iconClass = weatherIcons[current.weathercode] || 'fas fa-question';
        document.getElementById('weather-icon').innerHTML = `<i class="${iconClass}"></i>`;
        
        // Additional weather details
        if (hourly) {
            const currentHour = new Date().getHours();
            document.getElementById('humidity').textContent = `${hourly.relative_humidity_2m[currentHour] || '--'}%`;
            document.getElementById('wind-speed').textContent = `${Math.round(current.windspeed)} km/h`;
            document.getElementById('visibility').textContent = `${(hourly.visibility[currentHour] / 1000).toFixed(1) || '--'} km`;
            document.getElementById('feels-like').textContent = `${Math.round(current.temperature)}°C`;
        }
    }

    displayWeatherError() {
        document.getElementById('temperature').textContent = '--°C';
        document.getElementById('weather-description').textContent = 'Erro ao carregar dados';
        document.getElementById('location').textContent = 'Localização indisponível';
    }

    generateWeatherSuggestions(weather) {
        const suggestions = [];
        
        if (weather.temperature > 25) {
            suggestions.push({
                icon: 'fas fa-tint',
                title: 'Hidratação',
                text: 'Temperatura alta! Lembre-se de beber água regularmente.'
            });
        }
        
        if (weather.temperature < 15) {
            suggestions.push({
                icon: 'fas fa-temperature-low',
                title: 'Agasalho',
                text: 'Está frio! Não esqueça de se agasalhar ao sair.'
            });
        }
        
        if (weather.windspeed > 20) {
            suggestions.push({
                icon: 'fas fa-wind',
                title: 'Vento forte',
                text: 'Vento intenso hoje. Cuidado com objetos soltos.'
            });
        }
        
        // Update weather suggestions in the UI
        const weatherSuggestions = document.getElementById('weather-suggestions');
        if (suggestions.length > 0) {
            weatherSuggestions.innerHTML = suggestions.map(s => `
                <div class="suggestion-item" style="margin-top: 15px;">
                    <i class="${s.icon} suggestion-icon"></i>
                    <div class="suggestion-text">
                        <strong>${s.title}</strong><br>
                        ${s.text}
                    </div>
                </div>
            `).join('');
        }
    }

    async loadNews() {
        try {
            // Simulated news data (in a real implementation, you'd use a news API)
            const simulatedNews = [
                {
                    title: "Novas tecnologias de IA revolucionam o mercado de trabalho",
                    source: "Tech News",
                    time: "2 horas atrás",
                    url: "#"
                },
                {
                    title: "Dicas de produtividade para trabalho remoto",
                    source: "Productivity Today",
                    time: "4 horas atrás",
                    url: "#"
                },
                {
                    title: "Mercado financeiro apresenta alta volatilidade",
                    source: "Financial Times",
                    time: "6 horas atrás",
                    url: "#"
                },
                {
                    title: "Sustentabilidade: empresas adotam práticas verdes",
                    source: "Green Business",
                    time: "8 horas atrás",
                    url: "#"
                },
                {
                    title: "Inovações em saúde digital ganham destaque",
                    source: "Health Tech",
                    time: "10 horas atrás",
                    url: "#"
                }
            ];
            
            this.newsData = simulatedNews;
            this.updateNewsDisplay();
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            this.displayNewsError();
        }
    }

    updateNewsDisplay() {
        const newsFeed = document.getElementById('news-feed');
        
        if (this.newsData.length === 0) {
            newsFeed.innerHTML = '<p>Nenhuma notícia disponível no momento.</p>';
            return;
        }
        
        newsFeed.innerHTML = this.newsData.map(news => `
            <div class="news-item">
                <div class="news-title">${news.title}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span class="news-source">${news.source}</span>
                    <span class="news-time">${news.time}</span>
                </div>
            </div>
        `).join('');
    }

    displayNewsError() {
        document.getElementById('news-feed').innerHTML = `
            <div class="news-item">
                <div class="news-title">Erro ao carregar notícias</div>
                <div class="news-source">Tente novamente mais tarde</div>
            </div>
        `;
    }

    addTask() {
        const input = document.getElementById('task-input');
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const dueDate = document.getElementById('task-due-date').value;
        const dueTime = document.getElementById('task-due-time').value;
        const text = input.value.trim();
        
        if (!text) return;
        
        // Criar data limite se fornecida
        let dueDateTime = null;
        if (dueDate) {
            dueDateTime = new Date(dueDate);
            if (dueTime) {
                const [hours, minutes] = dueTime.split(':');
                dueDateTime.setHours(parseInt(hours), parseInt(minutes));
            }
        }
        
        const task = {
            id: Date.now(),
            text: text,
            priority: priority,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDateTime ? dueDateTime.toISOString() : null,
            completedAt: null
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateTaskStats();
        
        // Limpar campos
        input.value = '';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-due-time').value = '';
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhuma tarefa adicionada ainda.</p>';
            return;
        }
        
        // Apply current filter
        const currentFilter = this.currentFilter || 'all';
        let filteredTasks = this.tasks;
        
        if (currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(t => t.completed);
        }
        
        // Sort tasks: incomplete first, then by priority, then by due date
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Sort by due date first (overdue tasks first)
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            // Then by priority
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        taskList.innerHTML = sortedTasks.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
            const categoryEmoji = this.getCategoryEmoji(task.category);
            const dueDateFormatted = task.dueDate ? this.formatDueDate(task.dueDate) : '';
            
            return `
                <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <input type="checkbox" class="task-checkbox" 
                           ${task.completed ? 'checked' : ''} 
                           onchange="dashboard.toggleTask(${task.id})">
                    
                    <div class="task-content">
                        <div class="task-main">
                            <span class="task-category">${categoryEmoji}</span>
                            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                            <span class="task-priority priority-${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                        </div>
                        
                        ${dueDateFormatted ? `
                            <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-clock"></i> ${dueDateFormatted}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-actions">
                        <button onclick="dashboard.editTask(${task.id})" 
                                style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-right: 5px;"
                                title="Editar tarefa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="dashboard.deleteTask(${task.id})" 
                                style="background: none; border: none; color: var(--danger-color); cursor: pointer;"
                                title="Excluir tarefa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateTaskStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // High priority tasks
        const highPriorityTasks = this.tasks.filter(t => !t.completed && t.priority === 'high').length;
        document.getElementById('tasks-high').textContent = highPriorityTasks;
        
        // Overdue tasks
        const overdueTasks = this.tasks.filter(t => 
            !t.completed && t.dueDate && new Date(t.dueDate) < now
        ).length;
        document.getElementById('tasks-overdue').textContent = overdueTasks;
        
        // Tasks for today
        const tasksToday = this.tasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.toDateString() === today.toDateString();
        }).length;
        document.getElementById('tasks-today').textContent = tasksToday;
        
        // Completion rate
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        
        // Productivity indicator
        const productivityIndicator = document.getElementById('productivity-indicator');
        if (completionRate >= 80) {
            productivityIndicator.textContent = '🔥';
        } else if (completionRate >= 60) {
            productivityIndicator.textContent = '⚡';
        } else if (completionRate >= 40) {
            productivityIndicator.textContent = '📈';
        } else {
            productivityIndicator.textContent = '📊';
        }
    }

    getCategoryEmoji(category) {
        const emojis = {
            work: '💼',
            personal: '👤',
            health: '🏥',
            study: '📚',
            finance: '💰',
            home: '🏠'
        };
        return emojis[category] || '📝';
    }

    formatDueDate(dueDateString) {
        const dueDate = new Date(dueDateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        if (dueDateOnly.getTime() === today.getTime()) {
            return `Hoje ${dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
            return `Amanhã ${dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return dueDate.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        // Preencher campos com dados da tarefa
        document.getElementById('task-input').value = task.text;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-category').value = task.category || 'work';
        
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            document.getElementById('task-due-date').value = dueDate.toISOString().split('T')[0];
            document.getElementById('task-due-time').value = dueDate.toTimeString().slice(0, 5);
        }
        
        // Remover tarefa atual e focar no input
        this.deleteTask(id);
        document.getElementById('task-input').focus();
    }

    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('Nenhuma tarefa concluída para limpar.');
            return;
        }
        
        if (confirm(`Tem certeza que deseja remover ${completedCount} tarefa(s) concluída(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateTaskStats();
        }
    }

    exportTasks() {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalTasks: this.tasks.length,
            completedTasks: this.tasks.filter(t => t.completed).length,
            pendingTasks: this.tasks.filter(t => !t.completed).length,
            tasks: this.tasks.map(task => ({
                ...task,
                categoryName: this.getCategoryName(task.category),
                priorityName: this.getPriorityLabel(task.priority),
                isOverdue: task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarefas-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showTaskAnalytics() {
        const analytics = this.generateTaskAnalytics();
        
        alert(`📊 Análise de Tarefas:
        
📈 Estatísticas Gerais:
• Total de tarefas: ${analytics.total}
• Concluídas: ${analytics.completed} (${analytics.completionRate}%)
• Pendentes: ${analytics.pending}
• Atrasadas: ${analytics.overdue}

⏰ Por Prioridade:
• Alta: ${analytics.byPriority.high}
• Média: ${analytics.byPriority.medium}  
• Baixa: ${analytics.byPriority.low}

📂 Por Categoria:
• Trabalho: ${analytics.byCategory.work}
• Pessoal: ${analytics.byCategory.personal}
• Saúde: ${analytics.byCategory.health}
• Estudos: ${analytics.byCategory.study}
• Finanças: ${analytics.byCategory.finance}
• Casa: ${analytics.byCategory.home}

🎯 Produtividade: ${analytics.productivityLevel}`);
    }

    generateTaskAnalytics() {
        const now = new Date();
        const completed = this.tasks.filter(t => t.completed);
        const pending = this.tasks.filter(t => !t.completed);
        const overdue = this.tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
        
        const byPriority = {
            high: this.tasks.filter(t => t.priority === 'high').length,
            medium: this.tasks.filter(t => t.priority === 'medium').length,
            low: this.tasks.filter(t => t.priority === 'low').length
        };
        
        const byCategory = {
            work: this.tasks.filter(t => t.category === 'work').length,
            personal: this.tasks.filter(t => t.category === 'personal').length,
            health: this.tasks.filter(t => t.category === 'health').length,
            study: this.tasks.filter(t => t.category === 'study').length,
            finance: this.tasks.filter(t => t.category === 'finance').length,
            home: this.tasks.filter(t => t.category === 'home').length
        };
        
        const completionRate = this.tasks.length > 0 ? Math.round((completed.length / this.tasks.length) * 100) : 0;
        
        let productivityLevel = 'Iniciante';
        if (completionRate >= 90) productivityLevel = 'Excepcional';
        else if (completionRate >= 80) productivityLevel = 'Excelente';
        else if (completionRate >= 70) productivityLevel = 'Muito Bom';
        else if (completionRate >= 60) productivityLevel = 'Bom';
        else if (completionRate >= 40) productivityLevel = 'Regular';
        
        return {
            total: this.tasks.length,
            completed: completed.length,
            pending: pending.length,
            overdue: overdue.length,
            completionRate,
            byPriority,
            byCategory,
            productivityLevel
        };
    }

    getCategoryName(category) {
        const names = {
            work: 'Trabalho',
            personal: 'Pessoal',
            health: 'Saúde',
            study: 'Estudos',
            finance: 'Finanças',
            home: 'Casa'
        };
        return names[category] || 'Outros';
    }

    getPriorityLabel(priority) {
        const labels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
        return labels[priority] || 'Média';
    }

    updateStats() {
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('task-progress').style.width = `${progress}%`;
        
        // Update productivity stats
        const today = new Date().toDateString();
        const tasksToday = this.tasks.filter(t => 
            new Date(t.createdAt).toDateString() === today
        ).length;
        
        document.getElementById('tasks-today').textContent = tasksToday;
        document.getElementById('focus-time').textContent = `${Math.floor(this.focusTime / 60)}h`;
        
        // Calculate productivity score based on completed tasks and focus time
        let baseProductivityScore = Math.min(100, Math.round(
            (completedTasks * 20) + (this.focusTime / 60 * 10)
        ));
        
        // Integrate traffic data into productivity calculations
        this.updateTrafficProductivityStats(baseProductivityScore);
        
        document.getElementById('productivity-score').textContent = `${baseProductivityScore}%`;
    }

    updateTrafficProductivityStats(baseScore) {
        // Get traffic data if available
        if (window.trafficManager && window.trafficManager.trafficData) {
            const trafficData = window.trafficManager.trafficData;
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            // Calculate departure time for 9 AM
            const workStartTime = 9 * 60; // 9:00 AM
            const departureTime = workStartTime - trafficData.homeToWork.duration;
            const departureHour = Math.floor(departureTime / 60);
            const departureMins = departureTime % 60;
            
            // Calculate arrival time if leaving work now
            const arrivalTime = currentTime + trafficData.workToHome.duration;
            const arrivalHour = Math.floor(arrivalTime / 60);
            const arrivalMins = arrivalTime % 60;
            
            // Update traffic stats display
            document.getElementById('commute-time').textContent = 
                `${trafficData.homeToWork.duration + trafficData.workToHome.duration} min`;
            
            document.getElementById('departure-time').textContent = 
                `${departureHour.toString().padStart(2, '0')}:${departureMins.toString().padStart(2, '0')}`;
            
            document.getElementById('arrival-home').textContent = 
                `${arrivalHour.toString().padStart(2, '0')}:${arrivalMins.toString().padStart(2, '0')}`;
            
            // Calculate time lost due to traffic
            const baseCommuteTime = 35 + 38; // Base times without traffic
            const actualCommuteTime = trafficData.homeToWork.duration + trafficData.workToHome.duration;
            const timeLost = Math.max(0, actualCommuteTime - baseCommuteTime);
            
            document.getElementById('time-lost').textContent = `${timeLost} min`;
            
            // Calculate traffic efficiency
            const trafficEfficiency = Math.round((baseCommuteTime / actualCommuteTime) * 100);
            const efficiencyElement = document.getElementById('traffic-efficiency');
            efficiencyElement.textContent = `${trafficEfficiency}%`;
            
            // Apply efficiency color coding
            efficiencyElement.className = '';
            if (trafficEfficiency >= 80) {
                efficiencyElement.classList.add('traffic-efficiency-high');
            } else if (trafficEfficiency >= 60) {
                efficiencyElement.classList.add('traffic-efficiency-medium');
            } else {
                efficiencyElement.classList.add('traffic-efficiency-low');
            }
            
            // Adjust productivity score based on traffic impact
            let trafficImpact = 0;
            if (timeLost > 30) {
                trafficImpact = -10; // Significant traffic reduces productivity
            } else if (timeLost > 15) {
                trafficImpact = -5; // Moderate traffic impact
            } else if (timeLost < 5) {
                trafficImpact = +5; // Good traffic conditions boost productivity
            }
            
            // Update productivity progress bar
            const adjustedScore = Math.max(0, Math.min(100, baseScore + trafficImpact));
            document.getElementById('productivity-progress').style.width = `${adjustedScore}%`;
            
            // Update productivity score with traffic consideration
            document.getElementById('productivity-score').textContent = `${adjustedScore}%`;
            
        } else {
            // Default values when traffic data is not available
            document.getElementById('commute-time').textContent = '--';
            document.getElementById('departure-time').textContent = '--:--';
            document.getElementById('arrival-home').textContent = '--:--';
            document.getElementById('time-lost').textContent = '0 min';
            document.getElementById('traffic-efficiency').textContent = '85%';
            document.getElementById('productivity-progress').style.width = `${baseScore}%`;
        }
    }

    generateSmartSuggestions() {
        const suggestions = [];
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;
        
        // Traffic-based suggestions (priority)
        if (window.trafficManager && window.trafficManager.trafficData) {
            const trafficRecommendations = window.trafficManager.getCurrentRecommendations();
            if (trafficRecommendations.length > 0) {
                // Add the most important traffic suggestion
                const primaryTrafficSuggestion = trafficRecommendations[0];
                suggestions.push({
                    icon: primaryTrafficSuggestion.icon,
                    title: primaryTrafficSuggestion.title,
                    text: primaryTrafficSuggestion.message
                });
            }
        }
        
        // Time-based suggestions
        if (hour >= 7 && hour <= 8) {
            suggestions.push({
                icon: 'fas fa-sun',
                title: 'Bom dia!',
                text: 'Hora de se preparar para o trabalho. Verifique o trânsito antes de sair.'
            });
        } else if (hour >= 9 && hour <= 11) {
            suggestions.push({
                icon: 'fas fa-rocket',
                title: 'Horário produtivo',
                text: 'Este é um ótimo momento para tarefas que exigem mais concentração.'
            });
        } else if (hour >= 14 && hour <= 16) {
            suggestions.push({
                icon: 'fas fa-coffee',
                title: 'Pausa estratégica',
                text: 'Que tal uma pausa para recarregar as energias?'
            });
        } else if (hour >= 17 && hour <= 19) {
            suggestions.push({
                icon: 'fas fa-home',
                title: 'Fim do expediente',
                text: 'Hora de revisar o dia e verificar o trânsito para casa.'
            });
        }
        
        // Task-based suggestions
        const incompleteTasks = this.tasks.filter(t => !t.completed);
        const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
        
        if (highPriorityTasks.length > 0) {
            suggestions.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'Tarefas prioritárias',
                text: `Você tem ${highPriorityTasks.length} tarefa(s) de alta prioridade pendente(s).`
            });
        }
        
        if (incompleteTasks.length > 5) {
            suggestions.push({
                icon: 'fas fa-filter',
                title: 'Organização',
                text: 'Muitas tarefas pendentes. Considere priorizar as mais importantes.'
            });
        }
        
        // Weather-based suggestions (if weather data is available)
        if (this.weatherData && this.weatherData.current_weather) {
            const temp = this.weatherData.current_weather.temperature;
            if (temp > 25) {
                suggestions.push({
                    icon: 'fas fa-home',
                    title: 'Trabalho interno',
                    text: 'Temperatura alta. Ideal para atividades em ambiente climatizado.'
                });
            }
        }
        
        // Update suggestions display
        this.updateSuggestionsDisplay(suggestions.slice(0, 3)); // Show max 3 suggestions
    }

    updateSuggestionsDisplay(suggestions) {
        const suggestionsList = document.getElementById('suggestions-list');
        
        if (suggestions.length === 0) {
            suggestionsList.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-check-circle suggestion-icon"></i>
                    <div class="suggestion-text">
                        <strong>Tudo em ordem!</strong><br>
                        Continue com o bom trabalho.
                    </div>
                </div>
            `;
            return;
        }
        
        suggestionsList.innerHTML = suggestions.map(s => `
            <div class="suggestion-item">
                <i class="${s.icon} suggestion-icon"></i>
                <div class="suggestion-text">
                    <strong>${s.title}</strong><br>
                    ${s.text}
                </div>
            </div>
        `).join('');
    }

    startFocusTimer() {
        if (this.isTimerRunning) return;
        
        this.isTimerRunning = true;
        let timeLeft = 25 * 60; // 25 minutes in seconds
        
        document.getElementById('focus-timer').style.display = 'block';
        
        this.focusTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            document.getElementById('timer-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                this.stopFocusTimer();
                this.focusTime += 25;
                this.updateStats();
                alert('Sessão de foco concluída! Parabéns!');
            }
            
            timeLeft--;
        }, 1000);
    }

    stopFocusTimer() {
        if (this.focusTimer) {
            clearInterval(this.focusTimer);
            this.focusTimer = null;
        }
        this.isTimerRunning = false;
        document.getElementById('focus-timer').style.display = 'none';
        document.getElementById('timer-display').textContent = '25:00';
    }

    takeBreak() {
        alert('Hora da pausa! Levante-se, estique-se e hidrate-se. Volte em 5-10 minutos.');
    }

    exportData() {
        const data = {
            tasks: this.tasks,
            focusTime: this.focusTime,
            exportDate: new Date().toISOString(),
            stats: {
                totalTasks: this.tasks.length,
                completedTasks: this.tasks.filter(t => t.completed).length,
                focusHours: Math.floor(this.focusTime / 60)
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    resetDay() {
        if (confirm('Tem certeza que deseja resetar os dados do dia? Esta ação não pode ser desfeita.')) {
            this.tasks = [];
            this.focusTime = 0;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.generateSmartSuggestions();
        }
    }

    saveTasks() {
        localStorage.setItem('dashboard-tasks', JSON.stringify(this.tasks));
        localStorage.setItem('dashboard-focus-time', this.focusTime.toString());
    }
}

// Global functions for HTML onclick events
let dashboard;

function addTask() {
    dashboard.addTask();
}

function startFocusTimer() {
    dashboard.startFocusTimer();
}

function stopFocusTimer() {
    dashboard.stopFocusTimer();
}

function takeBreak() {
    dashboard.takeBreak();
}

function exportData() {
    dashboard.exportData();
}

function resetDay() {
    dashboard.resetDay();
}

function filterTasks(filter) {
    dashboard.currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.task-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Re-render tasks with filter
    dashboard.renderTasks();
}

function clearCompletedTasks() {
    dashboard.clearCompletedTasks();
}

function exportTasks() {
    dashboard.exportTasks();
}

function showTaskAnalytics() {
    dashboard.showTaskAnalytics();
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new PersonalDashboard();
});