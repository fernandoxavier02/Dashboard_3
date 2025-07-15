// Integração Trânsito-Produtividade
class ProductivityTrafficIntegration {
    constructor() {
        this.productivityData = this.loadProductivityData();
        this.trafficImpactHistory = this.loadTrafficImpactHistory();
        this.init();
    }

    init() {
        // Update integration every minute
        setInterval(() => this.updateIntegration(), 60 * 1000);
        
        // Calculate daily impact at end of day
        setInterval(() => this.calculateDailyImpact(), 60 * 60 * 1000);
        
        // Initial update
        setTimeout(() => this.updateIntegration(), 2000);
    }

    updateIntegration() {
        if (!window.dashboard || !window.trafficManager) return;
        
        const trafficData = window.trafficManager.trafficData;
        if (!trafficData) return;
        
        // Calculate current productivity impact
        const impact = this.calculateProductivityImpact(trafficData);
        
        // Update dashboard displays
        this.updateProductivityDisplay(impact);
        
        // Store impact data
        this.storeImpactData(impact);
        
        // Generate smart suggestions
        this.generateProductivitySuggestions(impact);
    }

    calculateProductivityImpact(trafficData) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Base commute times (ideal conditions)
        const baseHomeToWork = 35;
        const baseWorkToHome = 38;
        const baseTotalCommute = baseHomeToWork + baseWorkToHome;
        
        // Current commute times
        const currentHomeToWork = trafficData.homeToWork.duration;
        const currentWorkToHome = trafficData.workToHome.duration;
        const currentTotalCommute = currentHomeToWork + currentWorkToHome;
        
        // Calculate time lost/gained
        const timeDifference = currentTotalCommute - baseTotalCommute;
        const timeLost = Math.max(0, timeDifference);
        const timeGained = Math.max(0, -timeDifference);
        
        // Calculate efficiency metrics
        const commuteEfficiency = Math.round((baseTotalCommute / currentTotalCommute) * 100);
        const trafficStress = this.calculateTrafficStress(trafficData);
        
        // Calculate departure and arrival times
        const workStartTime = 9 * 60;
        const departureTime = workStartTime - currentHomeToWork;
        const arrivalTime = currentTime + currentWorkToHome;
        
        // Productivity impact score (-20 to +10)
        let productivityImpact = 0;
        
        // Time impact
        if (timeLost > 45) productivityImpact -= 15;
        else if (timeLost > 30) productivityImpact -= 10;
        else if (timeLost > 15) productivityImpact -= 5;
        else if (timeGained > 10) productivityImpact += 5;
        
        // Stress impact
        if (trafficStress > 80) productivityImpact -= 5;
        else if (trafficStress < 30) productivityImpact += 3;
        
        // Time of day impact
        if (currentTime < 8 * 60 && timeLost < 10) {
            productivityImpact += 2; // Early start with good traffic
        }
        
        return {
            timeLost,
            timeGained,
            commuteEfficiency,
            trafficStress,
            productivityImpact,
            departureTime,
            arrivalTime,
            currentTotalCommute,
            recommendations: this.generateRecommendations(timeLost, trafficStress, currentTime)
        };
    }

    calculateTrafficStress(trafficData) {
        let stress = 0;
        
        // Base stress from traffic conditions
        if (trafficData.homeToWork.condition.status === "Congestionado") stress += 40;
        else if (trafficData.homeToWork.condition.status === "Lento") stress += 20;
        
        if (trafficData.workToHome.condition.status === "Congestionado") stress += 40;
        else if (trafficData.workToHome.condition.status === "Lento") stress += 20;
        
        // Additional stress from long commute times
        if (trafficData.homeToWork.duration > 50) stress += 15;
        if (trafficData.workToHome.duration > 55) stress += 15;
        
        // Weather stress
        if (window.dashboard && window.dashboard.weatherData) {
            const weather = window.dashboard.weatherData.current_weather;
            if (weather.weathercode >= 51 && weather.weathercode <= 67) stress += 10; // Rain
            if (weather.weathercode >= 80) stress += 20; // Heavy rain
        }
        
        return Math.min(100, stress);
    }

    generateRecommendations(timeLost, trafficStress, currentTime) {
        const recommendations = [];
        
        // Time-based recommendations
        if (timeLost > 30) {
            recommendations.push({
                type: 'time-optimization',
                priority: 'high',
                message: 'Considere sair 15 min mais cedo para compensar o trânsito intenso',
                action: 'adjust-schedule'
            });
        }
        
        // Stress-based recommendations
        if (trafficStress > 70) {
            recommendations.push({
                type: 'stress-reduction',
                priority: 'medium',
                message: 'Trânsito estressante detectado. Pratique respiração profunda durante o trajeto',
                action: 'stress-management'
            });
        }
        
        // Productivity recommendations
        if (currentTime > 17 * 60 && timeLost > 20) {
            recommendations.push({
                type: 'productivity',
                priority: 'medium',
                message: 'Use o tempo extra no trânsito para ouvir podcasts educativos',
                action: 'productive-commute'
            });
        }
        
        // Schedule optimization
        if (timeLost > 45) {
            recommendations.push({
                type: 'schedule',
                priority: 'high',
                message: 'Considere trabalho remoto ou horário flexível em dias de trânsito intenso',
                action: 'flexible-work'
            });
        }
        
        return recommendations;
    }

    updateProductivityDisplay(impact) {
        // Update commute time display
        document.getElementById('commute-time').textContent = `${impact.currentTotalCommute} min`;
        
        // Update departure time
        const depHour = Math.floor(impact.departureTime / 60);
        const depMin = impact.departureTime % 60;
        document.getElementById('departure-time').textContent = 
            `${depHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;
        
        // Update arrival time
        const arrHour = Math.floor(impact.arrivalTime / 60);
        const arrMin = impact.arrivalTime % 60;
        document.getElementById('arrival-home').textContent = 
            `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;
        
        // Update time lost
        document.getElementById('time-lost').textContent = `${impact.timeLost} min`;
        
        // Update efficiency with color coding
        const efficiencyElement = document.getElementById('traffic-efficiency');
        efficiencyElement.textContent = `${impact.commuteEfficiency}%`;
        
        // Remove existing classes
        efficiencyElement.classList.remove('traffic-efficiency-high', 'traffic-efficiency-medium', 'traffic-efficiency-low');
        
        // Add appropriate class
        if (impact.commuteEfficiency >= 85) {
            efficiencyElement.classList.add('traffic-efficiency-high');
        } else if (impact.commuteEfficiency >= 70) {
            efficiencyElement.classList.add('traffic-efficiency-medium');
        } else {
            efficiencyElement.classList.add('traffic-efficiency-low');
        }
        
        // Update productivity progress bar
        const currentProductivity = this.getCurrentProductivityScore();
        const adjustedProductivity = Math.max(0, Math.min(100, currentProductivity + impact.productivityImpact));
        
        document.getElementById('productivity-progress').style.width = `${adjustedProductivity}%`;
        
        // Update main productivity score
        document.getElementById('productivity-score').textContent = `${adjustedProductivity}%`;
        
        // Add traffic impact indicator
        this.addTrafficImpactIndicator(impact.productivityImpact);
    }

    addTrafficImpactIndicator(impact) {
        const productivityCard = document.querySelector('#productivity-score').closest('.stat-item');
        
        // Remove existing indicator
        const existingIndicator = productivityCard.querySelector('.traffic-impact-indicator');
        if (existingIndicator) existingIndicator.remove();
        
        // Add new indicator if there's significant impact
        if (Math.abs(impact) >= 3) {
            const indicator = document.createElement('div');
            indicator.className = 'traffic-impact-indicator';
            indicator.style.cssText = `
                font-size: 0.7rem;
                margin-top: 2px;
                color: ${impact > 0 ? 'var(--success-color)' : 'var(--danger-color)'};
            `;
            indicator.innerHTML = `
                <i class="fas fa-${impact > 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(impact)} pts (trânsito)
            `;
            productivityCard.appendChild(indicator);
        }
    }

    getCurrentProductivityScore() {
        // Get base productivity score from main dashboard
        if (window.dashboard) {
            const completedTasks = window.dashboard.tasks.filter(t => t.completed).length;
            const focusTime = window.dashboard.focusTime;
            return Math.min(100, Math.round((completedTasks * 20) + (focusTime / 60 * 10)));
        }
        return 75; // Default fallback
    }

    generateProductivitySuggestions(impact) {
        if (!impact.recommendations.length) return;
        
        // Add traffic-productivity suggestions to main suggestions
        const suggestionsList = document.getElementById('suggestions-list');
        
        // Remove existing traffic-productivity suggestions
        const existingSuggestions = suggestionsList.querySelectorAll('.traffic-productivity-suggestion');
        existingSuggestions.forEach(s => s.remove());
        
        // Add new suggestions (max 2)
        const topRecommendations = impact.recommendations
            .filter(r => r.priority === 'high')
            .slice(0, 2);
        
        topRecommendations.forEach(rec => {
            const suggestionHTML = `
                <div class="suggestion-item traffic-productivity-suggestion" style="border-left-color: var(--warning-color);">
                    <i class="fas fa-route suggestion-icon"></i>
                    <div class="suggestion-text">
                        <strong>Otimização Trânsito-Produtividade</strong><br>
                        ${rec.message}
                    </div>
                </div>
            `;
            suggestionsList.insertAdjacentHTML('afterbegin', suggestionHTML);
        });
    }

    calculateDailyImpact() {
        const now = new Date();
        if (now.getHours() === 23 && now.getMinutes() === 0) { // 23:00
            const today = now.toDateString();
            const todayImpact = this.trafficImpactHistory[today];
            
            if (todayImpact) {
                // Calculate daily summary
                const summary = {
                    date: today,
                    totalTimeLost: todayImpact.reduce((sum, impact) => sum + impact.timeLost, 0),
                    averageEfficiency: Math.round(
                        todayImpact.reduce((sum, impact) => sum + impact.commuteEfficiency, 0) / todayImpact.length
                    ),
                    averageStress: Math.round(
                        todayImpact.reduce((sum, impact) => sum + impact.trafficStress, 0) / todayImpact.length
                    ),
                    productivityImpact: todayImpact.reduce((sum, impact) => sum + impact.productivityImpact, 0)
                };
                
                // Store daily summary
                if (!this.productivityData.dailySummaries) this.productivityData.dailySummaries = {};
                this.productivityData.dailySummaries[today] = summary;
                
                this.saveProductivityData();
                
                // Generate daily report notification
                if (summary.totalTimeLost > 60 || summary.productivityImpact < -10) {
                    this.sendDailyImpactNotification(summary);
                }
            }
        }
    }

    sendDailyImpactNotification(summary) {
        if (window.trafficNotifications) {
            let message = `Tempo perdido: ${summary.totalTimeLost} min. `;
            
            if (summary.productivityImpact < -10) {
                message += 'Impacto significativo na produtividade detectado.';
            } else if (summary.averageEfficiency < 70) {
                message += 'Eficiência de trânsito baixa hoje.';
            }
            
            window.trafficNotifications.sendNotification(
                "📊 Relatório Diário de Impacto",
                message,
                "traffic-alert"
            );
        }
    }

    storeImpactData(impact) {
        const today = new Date().toDateString();
        
        if (!this.trafficImpactHistory[today]) {
            this.trafficImpactHistory[today] = [];
        }
        
        // Store impact data (keep last 24 entries per day)
        this.trafficImpactHistory[today].push({
            timestamp: new Date().toISOString(),
            ...impact
        });
        
        if (this.trafficImpactHistory[today].length > 24) {
            this.trafficImpactHistory[today] = this.trafficImpactHistory[today].slice(-24);
        }
        
        // Clean old data (keep last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        Object.keys(this.trafficImpactHistory).forEach(date => {
            if (new Date(date) < thirtyDaysAgo) {
                delete this.trafficImpactHistory[date];
            }
        });
        
        this.saveTrafficImpactHistory();
    }

    // Export methods for external access
    getWeeklyProductivityImpact() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyData = [];
        Object.keys(this.trafficImpactHistory).forEach(date => {
            if (new Date(date) >= weekAgo) {
                const dayData = this.trafficImpactHistory[date];
                if (dayData.length > 0) {
                    const avgImpact = dayData.reduce((sum, d) => sum + d.productivityImpact, 0) / dayData.length;
                    weeklyData.push({ date, avgImpact });
                }
            }
        });
        
        return weeklyData;
    }

    exportProductivityTrafficReport() {
        const reportData = {
            reportType: 'productivity-traffic-integration',
            generatedAt: new Date().toISOString(),
            weeklyImpact: this.getWeeklyProductivityImpact(),
            dailySummaries: this.productivityData.dailySummaries || {},
            recommendations: this.generateLongTermRecommendations()
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-produtividade-transito-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateLongTermRecommendations() {
        const weeklyImpact = this.getWeeklyProductivityImpact();
        const recommendations = [];
        
        if (weeklyImpact.length > 0) {
            const avgWeeklyImpact = weeklyImpact.reduce((sum, d) => sum + d.avgImpact, 0) / weeklyImpact.length;
            
            if (avgWeeklyImpact < -5) {
                recommendations.push('Considere trabalho remoto ou horário flexível');
                recommendations.push('Explore rotas alternativas permanentemente');
            }
            
            if (avgWeeklyImpact < -10) {
                recommendations.push('Avalie mudança de residência ou trabalho');
                recommendations.push('Considere transporte público como alternativa');
            }
        }
        
        return recommendations;
    }

    // Storage methods
    loadProductivityData() {
        const stored = localStorage.getItem('productivity-traffic-data');
        return stored ? JSON.parse(stored) : {};
    }

    saveProductivityData() {
        localStorage.setItem('productivity-traffic-data', JSON.stringify(this.productivityData));
    }

    loadTrafficImpactHistory() {
        const stored = localStorage.getItem('traffic-impact-history');
        return stored ? JSON.parse(stored) : {};
    }

    saveTrafficImpactHistory() {
        localStorage.setItem('traffic-impact-history', JSON.stringify(this.trafficImpactHistory));
    }
}

// Initialize integration when all systems are ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard && window.trafficManager) {
            window.productivityTrafficIntegration = new ProductivityTrafficIntegration();
        }
    }, 3000);
});