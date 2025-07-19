// Sistema de Relatórios de Trânsito
class TrafficReports {
    constructor(trafficManager) {
        this.trafficManager = trafficManager;
        this.reportData = this.loadReportData();
        this.init();
    }

    init() {
        this.addReportsWidget();
        
        // Generate weekly report every Sunday at 23:00
        setInterval(() => this.checkWeeklyReport(), 60 * 60 * 1000); // Check hourly
        
        // Update daily stats every hour
        setInterval(() => this.updateDailyStats(), 60 * 60 * 1000);
    }

    addReportsWidget() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        
        const reportsCard = document.createElement('div');
        reportsCard.id = 'traffic-reports-widget';
        reportsCard.className = 'card';
        reportsCard.innerHTML = `
            <div class="card-header">
                <i class="fas fa-chart-line card-icon"></i>
                <h2 class="card-title">Relatórios de Trânsito</h2>
                <button id="generate-report-btn" class="btn btn-primary" style="margin-left: auto; padding: 5px 10px; font-size: 0.8rem;">
                    <i class="fas fa-file-alt"></i> Gerar Relatório
                </button>
            </div>
            <div id="reports-content">
                <div class="loading"></div>
                <p>Carregando dados de relatório...</p>
            </div>
        `;
        
        dashboardGrid.appendChild(reportsCard);
        
        // Add event listener for manual report generation
        document.getElementById('generate-report-btn').addEventListener('click', () => {
            this.generateWeeklyReport();
        });
        
        // Load initial report
        setTimeout(() => this.displayCurrentReport(), 1000);
    }

    updateDailyStats() {
        const now = new Date();
        const today = now.toDateString();
        
        if (!this.reportData.dailyStats) this.reportData.dailyStats = {};
        if (!this.reportData.dailyStats[today]) {
            this.reportData.dailyStats[today] = {
                date: today,
                totalCommutes: 0,
                totalTravelTime: 0,
                averageHomeToWork: 0,
                averageWorkToHome: 0,
                peakDelays: 0,
                weatherImpact: 'none'
            };
        }
        
        // Simulate daily data collection
        if (this.trafficManager.trafficData) {
            const { homeToWork, workToHome } = this.trafficManager.trafficData;
            const stats = this.reportData.dailyStats[today];
            
            // Update averages (simplified simulation)
            stats.totalCommutes += 1;
            stats.totalTravelTime += homeToWork.duration + workToHome.duration;

            stats.averageHomeToWork = Math.round(
                (stats.averageHomeToWork * (stats.totalCommutes - 1) + homeToWork.duration) /
                stats.totalCommutes
            );
            stats.averageWorkToHome = Math.round(
                (stats.averageWorkToHome * (stats.totalCommutes - 1) + workToHome.duration) /
                stats.totalCommutes
            );
            
            // Check for delays
            if (homeToWork.duration > 45 || workToHome.duration > 50) {
                stats.peakDelays += 1;
            }
            
            // Weather impact
            if (window.dashboard && window.dashboard.weatherData) {
                const weather = window.dashboard.weatherData.current_weather;
                if (weather.weathercode >= 51) {
                    stats.weatherImpact = 'rain';
                } else if (weather.weathercode === 45) {
                    stats.weatherImpact = 'fog';
                }
            }
        }
        
        this.saveReportData();
    }

    generateWeeklyReport() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
        
        const weekKey = `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
        
        // Collect week data
        const weekData = this.collectWeekData(weekStart, weekEnd);
        
        // Generate insights
        const insights = this.generateInsights(weekData);
        
        // Store report
        if (!this.reportData.weeklyReports) this.reportData.weeklyReports = {};
        this.reportData.weeklyReports[weekKey] = {
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            data: weekData,
            insights: insights,
            generatedAt: now.toISOString()
        };
        
        this.saveReportData();
        this.displayWeeklyReport(this.reportData.weeklyReports[weekKey]);
        
        // Show notification
        if (window.trafficNotifications) {
            window.trafficNotifications.sendNotification(
                "📊 Relatório Semanal Gerado",
                "Seu relatório de trânsito da semana está pronto!",
                "improvement"
            );
        }
    }

    collectWeekData(weekStart, weekEnd) {
        const weekData = {
            totalDays: 0,
            totalCommutes: 0,
            totalTravelTime: 0,
            averageHomeToWork: 0,
            averageWorkToHome: 0,
            bestDay: null,
            worstDay: null,
            weatherImpactDays: 0,
            peakDelayDays: 0,
            dailyBreakdown: []
        };
        
        // Iterate through week days
        for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
            const dayKey = d.toDateString();
            const dayStats = this.reportData.dailyStats ? this.reportData.dailyStats[dayKey] : null;
            
            if (dayStats) {
                weekData.totalDays += 1;
                weekData.totalCommutes += dayStats.totalCommutes;
                weekData.totalTravelTime += dayStats.totalTravelTime;
                weekData.averageHomeToWork += dayStats.averageHomeToWork;
                weekData.averageWorkToHome += dayStats.averageWorkToHome;
                
                if (dayStats.weatherImpact !== 'none') {
                    weekData.weatherImpactDays += 1;
                }
                
                if (dayStats.peakDelays > 0) {
                    weekData.peakDelayDays += 1;
                }
                
                weekData.dailyBreakdown.push({
                    date: dayKey,
                    dayOfWeek: d.toLocaleDateString('pt-BR', { weekday: 'long' }),
                    ...dayStats
                });
                
                // Track best/worst days
                const dayTotal = dayStats.averageHomeToWork + dayStats.averageWorkToHome;
                if (!weekData.bestDay || dayTotal < weekData.bestDay.total) {
                    weekData.bestDay = { date: dayKey, total: dayTotal };
                }
                if (!weekData.worstDay || dayTotal > weekData.worstDay.total) {
                    weekData.worstDay = { date: dayKey, total: dayTotal };
                }
            }
        }
        
        // Calculate averages
        if (weekData.totalDays > 0) {
            weekData.averageHomeToWork = Math.round(weekData.averageHomeToWork / weekData.totalDays);
            weekData.averageWorkToHome = Math.round(weekData.averageWorkToHome / weekData.totalDays);
        }
        
        return weekData;
    }

    generateInsights(weekData) {
        const insights = [];
        
        // Travel time insights
        const totalAverage = weekData.averageHomeToWork + weekData.averageWorkToHome;
        if (totalAverage < 70) {
            insights.push({
                type: 'positive',
                icon: 'fas fa-thumbs-up',
                title: 'Semana Eficiente',
                message: `Tempo médio de viagem foi de ${totalAverage} minutos - abaixo da média!`
            });
        } else if (totalAverage > 90) {
            insights.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                title: 'Semana com Atrasos',
                message: `Tempo médio de viagem foi de ${totalAverage} minutos - considere horários alternativos.`
            });
        }
        
        // Weather impact
        if (weekData.weatherImpactDays > 2) {
            insights.push({
                type: 'info',
                icon: 'fas fa-cloud-rain',
                title: 'Impacto do Clima',
                message: `${weekData.weatherImpactDays} dias com impacto climático no trânsito.`
            });
        }
        
        // Best/worst day analysis
        if (weekData.bestDay && weekData.worstDay) {
            const bestDayName = new Date(weekData.bestDay.date).toLocaleDateString('pt-BR', { weekday: 'long' });
            const worstDayName = new Date(weekData.worstDay.date).toLocaleDateString('pt-BR', { weekday: 'long' });
            
            insights.push({
                type: 'info',
                icon: 'fas fa-calendar-alt',
                title: 'Padrão Semanal',
                message: `Melhor dia: ${bestDayName} (${weekData.bestDay.total} min). Pior dia: ${worstDayName} (${weekData.worstDay.total} min).`
            });
        }
        
        // Peak delay frequency
        if (weekData.peakDelayDays > 3) {
            insights.push({
                type: 'warning',
                icon: 'fas fa-clock',
                title: 'Atrasos Frequentes',
                message: `${weekData.peakDelayDays} dias com atrasos significativos. Considere sair 10-15 min mais cedo.`
            });
        }
        
        // Recommendations
        const recommendations = this.generateRecommendations(weekData);
        insights.push(...recommendations);
        
        return insights;
    }

    generateRecommendations(weekData) {
        const recommendations = [];
        
        // Time optimization
        if (weekData.averageHomeToWork > 45) {
            recommendations.push({
                type: 'suggestion',
                icon: 'fas fa-route',
                title: 'Otimização de Rota',
                message: 'Considere testar rotas alternativas pela manhã para reduzir tempo de viagem.'
            });
        }
        
        // Schedule optimization
        if (weekData.peakDelayDays > 2) {
            recommendations.push({
                type: 'suggestion',
                icon: 'fas fa-clock',
                title: 'Ajuste de Horário',
                message: 'Sair 15 minutos mais cedo pode evitar o pico do trânsito.'
            });
        }
        
        // Weather preparation
        if (weekData.weatherImpactDays > 1) {
            recommendations.push({
                type: 'suggestion',
                icon: 'fas fa-umbrella',
                title: 'Preparação Climática',
                message: 'Em dias chuvosos, adicione 20% ao tempo de viagem estimado.'
            });
        }
        
        return recommendations;
    }

    displayCurrentReport() {
        const reportsContent = document.getElementById('reports-content');
        
        // Get latest weekly report or generate summary
        const latestReport = this.getLatestWeeklyReport();
        
        if (latestReport) {
            this.displayWeeklyReport(latestReport);
        } else {
            this.displaySummaryStats();
        }
    }

    displayWeeklyReport(report) {
        const reportsContent = document.getElementById('reports-content');
        const weekStart = new Date(report.weekStart).toLocaleDateString('pt-BR');
        const weekEnd = new Date(report.weekEnd).toLocaleDateString('pt-BR');
        
        reportsContent.innerHTML = `
            <div class="weekly-report">
                <div class="report-header">
                    <h4>Relatório Semanal</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${weekStart} - ${weekEnd}
                    </p>
                </div>
                
                <div class="report-stats">
                    <div class="stat-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0;">
                        <div class="stat-card">
                            <div class="stat-value">${report.data.averageHomeToWork} min</div>
                            <div class="stat-label">Média Casa→Trabalho</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${report.data.averageWorkToHome} min</div>
                            <div class="stat-label">Média Trabalho→Casa</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Math.round(report.data.totalTravelTime / 60)}h</div>
                            <div class="stat-label">Tempo Total</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${report.data.peakDelayDays}</div>
                            <div class="stat-label">Dias com Atraso</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-insights">
                    <h5 style="margin: 15px 0 10px 0;">📊 Insights da Semana</h5>
                    ${report.insights.map(insight => `
                        <div class="insight-item" style="
                            display: flex; 
                            align-items: flex-start; 
                            padding: 10px; 
                            margin-bottom: 8px; 
                            background: rgba(255, 255, 255, 0.05); 
                            border-radius: 8px;
                            border-left: 3px solid ${this.getInsightColor(insight.type)};
                        ">
                            <i class="${insight.icon}" style="color: ${this.getInsightColor(insight.type)}; margin-right: 10px; margin-top: 2px;"></i>
                            <div>
                                <strong>${insight.title}</strong><br>
                                <span style="color: var(--text-secondary); font-size: 0.9rem;">${insight.message}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="report-footer" style="margin-top: 15px; text-align: center;">
                    <button onclick="window.trafficReports.exportReport('${Object.keys(this.reportData.weeklyReports || {}).pop()}')" 
                            class="btn btn-primary" style="font-size: 0.8rem; padding: 5px 10px;">
                        <i class="fas fa-download"></i> Exportar Relatório
                    </button>
                </div>
            </div>
        `;
        
        this.addReportStyles();
    }

    displaySummaryStats() {
        const reportsContent = document.getElementById('reports-content');
        
        reportsContent.innerHTML = `
            <div class="summary-stats">
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-chart-line" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;"></i>
                    <h4>Coletando Dados</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">
                        Os relatórios semanais serão gerados automaticamente após alguns dias de uso.
                    </p>
                    <div class="quick-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                        <div style="text-align: center; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-color);">
                                ${Object.keys(this.reportData.dailyStats || {}).length}
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Dias Monitorados</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-color);">
                                ${Object.keys(this.reportData.weeklyReports || {}).length}
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Relatórios Gerados</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getInsightColor(type) {
        const colors = {
            'positive': 'var(--success-color)',
            'warning': 'var(--warning-color)',
            'info': 'var(--primary-color)',
            'suggestion': 'var(--accent-color)'
        };
        return colors[type] || 'var(--text-secondary)';
    }

    addReportStyles() {
        if (document.getElementById('traffic-report-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'traffic-report-styles';
        style.textContent = `
            .stat-card {
                text-align: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .stat-card:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .stat-label {
                color: var(--text-secondary);
                font-size: 0.8rem;
                margin-top: 5px;
            }
            
            .report-header h4 {
                color: var(--text-primary);
                margin-bottom: 5px;
            }
        `;
        
        document.head.appendChild(style);
    }

    exportReport(weekKey) {
        const report = this.reportData.weeklyReports[weekKey];
        if (!report) return;
        
        const exportData = {
            reportType: 'weekly-traffic-report',
            generatedAt: new Date().toISOString(),
            period: {
                start: report.weekStart,
                end: report.weekEnd
            },
            summary: report.data,
            insights: report.insights,
            recommendations: report.insights.filter(i => i.type === 'suggestion')
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-transito-${weekKey}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getLatestWeeklyReport() {
        if (!this.reportData.weeklyReports) return null;
        
        const reportKeys = Object.keys(this.reportData.weeklyReports);
        if (reportKeys.length === 0) return null;
        
        const latestKey = reportKeys.sort().pop();
        return this.reportData.weeklyReports[latestKey];
    }

    checkWeeklyReport() {
        const now = new Date();
        if (now.getDay() === 0 && now.getHours() === 23) { // Sunday 23:00
            this.generateWeeklyReport();
        }
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    loadReportData() {
        const stored = localStorage.getItem('traffic-report-data');
        return stored ? JSON.parse(stored) : {};
    }

    saveReportData() {
        localStorage.setItem('traffic-report-data', JSON.stringify(this.reportData));
    }
}

// Initialize traffic reports when traffic manager is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.trafficManager) {
            window.trafficReports = new TrafficReports(window.trafficManager);
        }
    }, 2500);
});