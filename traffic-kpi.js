// KPI de Intensidade de Trânsito em Tempo Real
class TrafficIntensityKPI {
    constructor() {
        this.currentIntensity = {
            homeToWork: 0,
            workToHome: 0,
            overall: 0
        };
        this.intensityHistory = [];
        this.init();
    }

    init() {
        this.createKPIWidget();
        this.updateKPI();
        
        // Atualizar KPI a cada 2 minutos
        setInterval(() => this.updateKPI(), 2 * 60 * 1000);
    }

    createKPIWidget() {
        // Aguardar widget de trânsito existir
        setTimeout(() => {
            const trafficWidget = document.getElementById('traffic-widget-simple');
            if (!trafficWidget) return;

            // Adicionar seção de KPI ao widget existente
            const kpiSection = document.createElement('div');
            kpiSection.id = 'traffic-kpi-section';
            kpiSection.innerHTML = `
                <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--text-primary);">
                        <i class="fas fa-tachometer-alt"></i> KPI Intensidade de Trânsito
                    </h4>
                    
                    <!-- KPI Principal -->
                    <div class="kpi-main-indicator">
                        <div class="kpi-gauge-container">
                            <div class="kpi-gauge">
                                <div class="kpi-gauge-fill" id="kpi-gauge-fill"></div>
                                <div class="kpi-gauge-center">
                                    <div class="kpi-value" id="kpi-main-value">0</div>
                                    <div class="kpi-label">Intensidade</div>
                                </div>
                            </div>
                            <div class="kpi-status" id="kpi-status">Calculando...</div>
                        </div>
                    </div>
                    
                    <!-- Ponteiro Visual -->
                    <div class="kpi-pointer-container">
                        <div class="kpi-pointer" id="kpi-pointer"></div>
                        <div class="kpi-scale">
                            <span class="kpi-scale-label" style="left: 0%;">Leve</span>
                            <span class="kpi-scale-label" style="left: 50%;">Moderado</span>
                            <span class="kpi-scale-label" style="left: 100%;">Pesado</span>
                        </div>
                    </div>
                    
                    <!-- KPIs por Rota -->
                    <div class="kpi-routes">
                        <div class="kpi-route-item">
                            <div class="kpi-route-header">
                                <i class="fas fa-home"></i>
                                <span>Casa → Trabalho</span>
                            </div>
                            <div class="kpi-route-metrics">
                                <div class="kpi-metric">
                                    <div class="kpi-metric-value" id="kpi-home-work-value">0</div>
                                    <div class="kpi-metric-label">Intensidade</div>
                                </div>
                                <div class="kpi-metric">
                                    <div class="kpi-metric-trend" id="kpi-home-work-trend">
                                        <i class="fas fa-minus"></i>
                                    </div>
                                    <div class="kpi-metric-label">Tendência</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="kpi-route-item">
                            <div class="kpi-route-header">
                                <i class="fas fa-building"></i>
                                <span>Trabalho → Casa</span>
                            </div>
                            <div class="kpi-route-metrics">
                                <div class="kpi-metric">
                                    <div class="kpi-metric-value" id="kpi-work-home-value">0</div>
                                    <div class="kpi-metric-label">Intensidade</div>
                                </div>
                                <div class="kpi-metric">
                                    <div class="kpi-metric-trend" id="kpi-work-home-trend">
                                        <i class="fas fa-minus"></i>
                                    </div>
                                    <div class="kpi-metric-label">Tendência</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Métricas Adicionais -->
                    <div class="kpi-additional-metrics">
                        <div class="kpi-additional-item">
                            <div class="kpi-additional-value" id="kpi-peak-time">--:--</div>
                            <div class="kpi-additional-label">Próximo Pico</div>
                        </div>
                        <div class="kpi-additional-item">
                            <div class="kpi-additional-value" id="kpi-best-time">--:--</div>
                            <div class="kpi-additional-label">Melhor Horário</div>
                        </div>
                        <div class="kpi-additional-item">
                            <div class="kpi-additional-value" id="kpi-efficiency">--%</div>
                            <div class="kpi-additional-label">Eficiência Atual</div>
                        </div>
                    </div>
                    
                    <!-- Alertas de Trânsito -->
                    <div id="kpi-alerts" class="kpi-alerts"></div>
                </div>
            `;

            trafficWidget.appendChild(kpiSection);
            this.addKPIStyles();
        }, 4000);
    }

    updateKPI() {
        // Obter dados de trânsito atual
        const trafficData = this.getTrafficData();
        if (!trafficData) return;

        // Calcular intensidades
        const homeToWorkIntensity = this.calculateRouteIntensity(trafficData.homeToWork);
        const workToHomeIntensity = this.calculateRouteIntensity(trafficData.workToHome);
        const overallIntensity = Math.round((homeToWorkIntensity + workToHomeIntensity) / 2);

        // Armazenar dados atuais
        this.currentIntensity = {
            homeToWork: homeToWorkIntensity,
            workToHome: workToHomeIntensity,
            overall: overallIntensity
        };

        // Adicionar ao histórico
        this.addToHistory();

        // Atualizar displays
        this.updateKPIDisplay();
        this.updateRouteKPIs();
        this.updateAdditionalMetrics();
        this.updateAlerts();
    }

    getTrafficData() {
        // Tentar obter dados do sistema de trânsito
        if (window.trafficManager && window.trafficManager.trafficData) {
            return window.trafficManager.trafficData;
        }
        
        // Fallback: simular dados baseados no horário atual
        return this.simulateTrafficData();
    }

    simulateTrafficData() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;

        let homeToWorkMultiplier = 1.0;
        let workToHomeMultiplier = 1.0;

        // Picos de trânsito
        if (currentTime >= 7*60 && currentTime <= 9*60) {
            const peakProgress = (currentTime - 7*60) / (2*60);
            homeToWorkMultiplier = 1.0 + (Math.sin(peakProgress * Math.PI) * 1.5);
        }

        if (currentTime >= 17*60 && currentTime <= 19*60) {
            const peakProgress = (currentTime - 17*60) / (2*60);
            workToHomeMultiplier = 1.0 + (Math.sin(peakProgress * Math.PI) * 1.8);
        }

        return {
            homeToWork: {
                duration: Math.round(35 * homeToWorkMultiplier),
                condition: { status: this.getConditionFromMultiplier(homeToWorkMultiplier) }
            },
            workToHome: {
                duration: Math.round(38 * workToHomeMultiplier),
                condition: { status: this.getConditionFromMultiplier(workToHomeMultiplier) }
            }
        };
    }

    getConditionFromMultiplier(multiplier) {
        if (multiplier <= 1.2) return "Fluindo";
        if (multiplier <= 1.6) return "Lento";
        return "Congestionado";
    }

    calculateRouteIntensity(routeData) {
        if (!routeData) return 0;

        const baseDuration = routeData.duration <= 40 ? 35 : 38; // Base esperado
        const currentDuration = routeData.duration;
        const delayFactor = (currentDuration - baseDuration) / baseDuration;
        
        // Converter para escala 0-100
        let intensity = Math.round(Math.max(0, Math.min(100, 20 + (delayFactor * 60))));
        
        // Ajustar baseado na condição
        if (routeData.condition?.status === "Congestionado") {
            intensity = Math.max(intensity, 75);
        } else if (routeData.condition?.status === "Lento") {
            intensity = Math.max(intensity, 45);
        }

        return intensity;
    }

    addToHistory() {
        const now = new Date();
        this.intensityHistory.push({
            timestamp: now,
            ...this.currentIntensity
        });

        // Manter apenas últimas 50 entradas
        if (this.intensityHistory.length > 50) {
            this.intensityHistory = this.intensityHistory.slice(-50);
        }
    }

    updateKPIDisplay() {
        const gaugeElement = document.getElementById('kpi-gauge-fill');
        const valueElement = document.getElementById('kpi-main-value');
        const statusElement = document.getElementById('kpi-status');

        if (!gaugeElement || !valueElement || !statusElement) return;

        const intensity = this.currentIntensity.overall;
        
        // Atualizar gauge
        const percentage = intensity;
        gaugeElement.style.transform = `rotate(${(percentage / 100) * 180}deg)`;
        
        // Atualizar cor baseada na intensidade
        let color = 'var(--success-color)';
        if (intensity >= 70) color = 'var(--danger-color)';
        else if (intensity >= 40) color = 'var(--warning-color)';
        
        gaugeElement.style.background = `conic-gradient(${color} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`;
        
        // Atualizar valor
        valueElement.textContent = intensity;
        valueElement.style.color = color;
        
        // Atualizar status
        let status = 'Trânsito Fluindo';
        if (intensity >= 70) status = 'Trânsito Intenso';
        else if (intensity >= 40) status = 'Trânsito Moderado';
        
        statusElement.textContent = status;
        statusElement.style.color = color;
    }

    updateRouteKPIs() {
        // Casa → Trabalho
        const homeWorkValue = document.getElementById('kpi-home-work-value');
        const homeWorkTrend = document.getElementById('kpi-home-work-trend');
        
        if (homeWorkValue) {
            homeWorkValue.textContent = this.currentIntensity.homeToWork;
            homeWorkValue.style.color = this.getIntensityColor(this.currentIntensity.homeToWork);
        }
        
        if (homeWorkTrend) {
            const trend = this.calculateTrend('homeToWork');
            homeWorkTrend.innerHTML = this.getTrendIcon(trend);
            homeWorkTrend.style.color = this.getTrendColor(trend);
        }

        // Trabalho → Casa
        const workHomeValue = document.getElementById('kpi-work-home-value');
        const workHomeTrend = document.getElementById('kpi-work-home-trend');
        
        if (workHomeValue) {
            workHomeValue.textContent = this.currentIntensity.workToHome;
            workHomeValue.style.color = this.getIntensityColor(this.currentIntensity.workToHome);
        }
        
        if (workHomeTrend) {
            const trend = this.calculateTrend('workToHome');
            workHomeTrend.innerHTML = this.getTrendIcon(trend);
            workHomeTrend.style.color = this.getTrendColor(trend);
        }
    }

    calculateTrend(route) {
        if (this.intensityHistory.length < 5) return 'stable';
        
        const recent = this.intensityHistory.slice(-5);
        const values = recent.map(h => h[route]);
        
        const firstHalf = values.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const secondHalf = values.slice(-2).reduce((a, b) => a + b, 0) / 2;
        
        const difference = secondHalf - firstHalf;
        
        if (difference > 5) return 'increasing';
        if (difference < -5) return 'decreasing';
        return 'stable';
    }

    getTrendIcon(trend) {
        const icons = {
            increasing: '<i class="fas fa-arrow-up"></i>',
            decreasing: '<i class="fas fa-arrow-down"></i>',
            stable: '<i class="fas fa-minus"></i>'
        };
        return icons[trend] || icons.stable;
    }

    getTrendColor(trend) {
        const colors = {
            increasing: 'var(--danger-color)',
            decreasing: 'var(--success-color)',
            stable: 'var(--text-secondary)'
        };
        return colors[trend] || colors.stable;
    }

    getIntensityColor(intensity) {
        if (intensity >= 70) return 'var(--danger-color)';
        if (intensity >= 40) return 'var(--warning-color)';
        return 'var(--success-color)';
    }

    updateAdditionalMetrics() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Próximo pico
        const nextPeak = this.calculateNextPeak(currentTime);
        const peakElement = document.getElementById('kpi-peak-time');
        if (peakElement) {
            peakElement.textContent = nextPeak;
        }
        
        // Melhor horário
        const bestTime = this.calculateBestTime(currentTime);
        const bestElement = document.getElementById('kpi-best-time');
        if (bestElement) {
            bestElement.textContent = bestTime;
        }
        
        // Eficiência atual
        const efficiency = Math.max(0, 100 - this.currentIntensity.overall);
        const efficiencyElement = document.getElementById('kpi-efficiency');
        if (efficiencyElement) {
            efficiencyElement.textContent = `${efficiency}%`;
            efficiencyElement.style.color = this.getIntensityColor(100 - efficiency);
        }
    }

    calculateNextPeak(currentTime) {
        const morningPeak = 8 * 60; // 8:00
        const eveningPeak = 18 * 60; // 18:00
        
        if (currentTime < morningPeak) {
            return this.formatTime(morningPeak);
        } else if (currentTime < eveningPeak) {
            return this.formatTime(eveningPeak);
        } else {
            return this.formatTime(morningPeak + 24 * 60); // Próximo dia
        }
    }

    calculateBestTime(currentTime) {
        // Horários com menor trânsito
        const bestTimes = [10 * 60, 14 * 60, 20 * 60]; // 10:00, 14:00, 20:00
        
        for (const time of bestTimes) {
            if (currentTime < time) {
                return this.formatTime(time);
            }
        }
        
        return this.formatTime(bestTimes[0] + 24 * 60); // Próximo dia
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    updateAlerts() {
        const alertsContainer = document.getElementById('kpi-alerts');
        if (!alertsContainer) return;

        const alerts = this.generateAlerts();
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="kpi-alert ${alert.type}">
                <i class="${alert.icon}"></i>
                <span>${alert.message}</span>
            </div>
        `).join('');
    }

    generateAlerts() {
        const alerts = [];
        const intensity = this.currentIntensity.overall;
        
        if (intensity >= 80) {
            alerts.push({
                type: 'critical',
                icon: 'fas fa-exclamation-triangle',
                message: 'Trânsito crítico! Considere adiar viagem ou usar rota alternativa.'
            });
        } else if (intensity >= 60) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-clock',
                message: 'Trânsito intenso. Adicione 15-20 min ao tempo de viagem.'
            });
        }

        // Verificar tendência
        const homeWorkTrend = this.calculateTrend('homeToWork');
        const workHomeTrend = this.calculateTrend('workToHome');
        
        if (homeWorkTrend === 'increasing' && this.currentIntensity.homeToWork > 50) {
            alerts.push({
                type: 'info',
                icon: 'fas fa-arrow-up',
                message: 'Trânsito casa→trabalho piorando. Saia mais cedo amanhã.'
            });
        }

        return alerts;
    }

    addKPIStyles() {
        if (document.getElementById('traffic-kpi-styles')) return;

        const style = document.createElement('style');
        style.id = 'traffic-kpi-styles';
        style.textContent = `
            .kpi-main-indicator {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .kpi-gauge-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .kpi-gauge {
                position: relative;
                width: 120px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 120px 120px 0 0;
                overflow: hidden;
            }
            
            .kpi-gauge-fill {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: conic-gradient(var(--success-color) 0%, rgba(255,255,255,0.1) 0%);
                border-radius: 120px 120px 0 0;
                transform-origin: center bottom;
                transition: all 0.5s ease;
            }
            
            .kpi-gauge-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }
            
            .kpi-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--text-primary);
            }
            
            .kpi-label {
                font-size: 0.7rem;
                color: var(--text-secondary);
            }
            
            .kpi-status {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .kpi-routes {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .kpi-route-item {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 12px;
            }
            
            .kpi-route-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                color: var(--text-primary);
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .kpi-route-metrics {
                display: flex;
                justify-content: space-between;
            }
            
            .kpi-metric {
                text-align: center;
            }
            
            .kpi-metric-value {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--text-primary);
            }
            
            .kpi-metric-trend {
                font-size: 1.2rem;
            }
            
            .kpi-metric-label {
                font-size: 0.7rem;
                color: var(--text-secondary);
                margin-top: 2px;
            }
            
            .kpi-additional-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .kpi-additional-item {
                text-align: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            
            .kpi-additional-value {
                font-size: 1rem;
                font-weight: bold;
                color: var(--accent-color);
            }
            
            .kpi-additional-label {
                font-size: 0.7rem;
                color: var(--text-secondary);
                margin-top: 3px;
            }
            
            .kpi-alerts {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .kpi-alert {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
            }
            
            .kpi-alert.critical {
                background: rgba(248, 113, 113, 0.2);
                color: var(--danger-color);
                border-left: 3px solid var(--danger-color);
            }
            
            .kpi-alert.warning {
                background: rgba(251, 191, 36, 0.2);
                color: var(--warning-color);
                border-left: 3px solid var(--warning-color);
            }
            
            .kpi-alert.info {
                background: rgba(59, 130, 246, 0.2);
                color: var(--primary-color);
                border-left: 3px solid var(--primary-color);
            }
            
            @media (max-width: 768px) {
                .kpi-routes {
                    grid-template-columns: 1fr;
                }
                
                .kpi-additional-metrics {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Inicializar KPI de trânsito
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.trafficKPI = new TrafficIntensityKPI();
    }, 5000);
});