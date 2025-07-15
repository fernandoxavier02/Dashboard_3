// Sistema de Trânsito Inteligente - Google Maps Integration
class TrafficManager {
    constructor() {
        this.homeAddress = "Avenida Franz Voegeli, 924, Parque Continental, São Paulo, SP";
        this.workAddress = "Avenida Francisco Matarazzo, 1350, São Paulo, SP";
        this.workStartTime = "09:00";
        this.workEndTime = "18:00";
        this.trafficData = null;
        this.lastUpdate = null;
        
        this.init();
    }

    init() {
        this.createTrafficWidget();
        this.loadTrafficData();
        
        // Update traffic data every 5 minutes
        setInterval(() => this.loadTrafficData(), 5 * 60 * 1000);
        
        // Update recommendations every minute
        setInterval(() => this.updateRecommendations(), 60 * 1000);
    }

    createTrafficWidget() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        
        const trafficCard = document.createElement('div');
        trafficCard.id = 'traffic-widget';
        trafficCard.className = 'card';
        trafficCard.innerHTML = `
            <div class="card-header">
                <i class="fas fa-route card-icon"></i>
                <h2 class="card-title">Trânsito Inteligente</h2>
            </div>
            <div id="traffic-content">
                <div class="loading"></div>
                <p>Carregando dados de trânsito...</p>
            </div>
        `;
        
        // Insert after weather widget (second position)
        const weatherCard = dashboardGrid.children[0];
        if (weatherCard && weatherCard.nextSibling) {
            dashboardGrid.insertBefore(trafficCard, weatherCard.nextSibling);
        } else {
            dashboardGrid.appendChild(trafficCard);
        }
    }

    async loadTrafficData() {
        try {
            // Simulate Google Maps API calls with realistic traffic data
            // In production, you would use actual Google Maps Distance Matrix API
            const currentTime = new Date();
            const hour = currentTime.getHours();
            const minute = currentTime.getMinutes();
            
            // Simulate traffic conditions based on time of day
            const trafficConditions = this.simulateTrafficConditions(hour, minute);
            
            this.trafficData = {
                homeToWork: trafficConditions.homeToWork,
                workToHome: trafficConditions.workToHome,
                lastUpdated: currentTime,
                nextUpdate: new Date(currentTime.getTime() + 5 * 60 * 1000)
            };
            
            this.updateTrafficDisplay();
            this.updateRecommendations();
            
        } catch (error) {
            console.error('Erro ao carregar dados de trânsito:', error);
            this.displayTrafficError();
        }
    }

    simulateTrafficConditions(hour, minute) {
        const currentMinutes = hour * 60 + minute;
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Weekend/Holiday mode
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return this.getWeekendTrafficConditions(hour, minute);
        }
        
        // Peak hours with more realistic patterns
        const morningPeakStart = 6.5 * 60; // 6:30
        const morningPeakPeak = 8 * 60;     // 8:00 (worst time)
        const morningPeakEnd = 9.5 * 60;   // 9:30
        
        const eveningPeakStart = 16.5 * 60; // 16:30
        const eveningPeakPeak = 18 * 60;    // 18:00 (worst time)
        const eveningPeakEnd = 19.5 * 60;   // 19:30
        
        let homeToWorkMultiplier = 1.0;
        let workToHomeMultiplier = 1.0;
        
        // Advanced morning peak calculation
        if (currentMinutes >= morningPeakStart && currentMinutes <= morningPeakEnd) {
            if (currentMinutes <= morningPeakPeak) {
                // Rising to peak
                const progress = (currentMinutes - morningPeakStart) / (morningPeakPeak - morningPeakStart);
                homeToWorkMultiplier = 1.0 + (Math.pow(progress, 1.5) * 1.2); // Up to 120% longer
            } else {
                // Declining from peak
                const progress = (currentMinutes - morningPeakPeak) / (morningPeakEnd - morningPeakPeak);
                homeToWorkMultiplier = 2.2 - (Math.pow(progress, 0.7) * 1.2);
            }
        }
        
        // Advanced evening peak calculation
        if (currentMinutes >= eveningPeakStart && currentMinutes <= eveningPeakEnd) {
            if (currentMinutes <= eveningPeakPeak) {
                // Rising to peak
                const progress = (currentMinutes - eveningPeakStart) / (eveningPeakPeak - eveningPeakStart);
                workToHomeMultiplier = 1.0 + (Math.pow(progress, 1.3) * 1.4); // Up to 140% longer
            } else {
                // Declining from peak
                const progress = (currentMinutes - eveningPeakPeak) / (eveningPeakEnd - eveningPeakPeak);
                workToHomeMultiplier = 2.4 - (Math.pow(progress, 0.8) * 1.4);
            }
        }
        
        // Weather impact (if weather data available)
        const weatherMultiplier = this.getWeatherImpact();
        homeToWorkMultiplier *= weatherMultiplier;
        workToHomeMultiplier *= weatherMultiplier;
        
        // Day of week variations
        const dayMultiplier = this.getDayOfWeekMultiplier(dayOfWeek);
        homeToWorkMultiplier *= dayMultiplier;
        workToHomeMultiplier *= dayMultiplier;
        
        // Base travel times with historical learning
        const baseHomeToWork = this.getHistoricalBaseTime('homeToWork', hour, minute);
        const baseWorkToHome = this.getHistoricalBaseTime('workToHome', hour, minute);
        
        // Reduced randomness for more predictable results
        const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% variation
        
        const homeToWorkTime = Math.round(baseHomeToWork * homeToWorkMultiplier * randomFactor);
        const workToHomeTime = Math.round(baseWorkToHome * workToHomeMultiplier * randomFactor);
        
        // Store historical data
        this.storeHistoricalData(hour, minute, homeToWorkTime, workToHomeTime);
        
        return {
            homeToWork: {
                duration: homeToWorkTime,
                distance: "18.5 km",
                route: "Via Marginal Tietê",
                condition: this.getTrafficCondition(homeToWorkMultiplier),
                alternativeRoute: homeToWorkMultiplier > 1.4 ? "Via Av. Paulista (+8 min)" : null,
                confidence: this.getConfidenceLevel(homeToWorkMultiplier),
                trend: this.getTrafficTrend('homeToWork', hour, minute)
            },
            workToHome: {
                duration: workToHomeTime,
                distance: "19.2 km", 
                route: "Via Av. Francisco Matarazzo",
                condition: this.getTrafficCondition(workToHomeMultiplier),
                alternativeRoute: workToHomeMultiplier > 1.4 ? "Via Radial Leste (+12 min)" : null,
                confidence: this.getConfidenceLevel(workToHomeMultiplier),
                trend: this.getTrafficTrend('workToHome', hour, minute)
            }
        };
    }

    getWeekendTrafficConditions(hour, minute) {
        // Weekend traffic is generally lighter and different patterns
        const baseHomeToWork = 28; // Faster on weekends
        const baseWorkToHome = 30;
        
        // Weekend peaks: late morning (10-12) and evening (19-21)
        let multiplier = 1.0;
        const currentMinutes = hour * 60 + minute;
        
        if (currentMinutes >= 10 * 60 && currentMinutes <= 12 * 60) {
            multiplier = 1.2; // Light weekend traffic
        } else if (currentMinutes >= 19 * 60 && currentMinutes <= 21 * 60) {
            multiplier = 1.3; // Weekend evening activities
        }
        
        const randomFactor = 0.9 + (Math.random() * 0.2);
        
        return {
            homeToWork: {
                duration: Math.round(baseHomeToWork * multiplier * randomFactor),
                distance: "18.5 km",
                route: "Via Marginal Tietê",
                condition: this.getTrafficCondition(multiplier),
                alternativeRoute: null,
                confidence: "high",
                trend: "stable"
            },
            workToHome: {
                duration: Math.round(baseWorkToHome * multiplier * randomFactor),
                distance: "19.2 km",
                route: "Via Av. Francisco Matarazzo", 
                condition: this.getTrafficCondition(multiplier),
                alternativeRoute: null,
                confidence: "high",
                trend: "stable"
            }
        };
    }

    getWeatherImpact() {
        // Check if weather data is available from the main dashboard
        if (window.dashboard && window.dashboard.weatherData) {
            const weather = window.dashboard.weatherData.current_weather;
            
            // Rain increases travel time
            if (weather.weathercode >= 51 && weather.weathercode <= 67) {
                return 1.15; // 15% longer in rain
            }
            
            // Heavy rain/storms
            if (weather.weathercode >= 80 && weather.weathercode <= 99) {
                return 1.25; // 25% longer in heavy rain
            }
            
            // Fog reduces speed
            if (weather.weathercode === 45 || weather.weathercode === 48) {
                return 1.1; // 10% longer in fog
            }
        }
        
        return 1.0; // No weather impact
    }

    getDayOfWeekMultiplier(dayOfWeek) {
        // Monday and Friday tend to be busier
        const multipliers = {
            1: 1.05, // Monday
            2: 1.0,  // Tuesday
            3: 1.0,  // Wednesday
            4: 1.0,  // Thursday
            5: 1.08, // Friday
            6: 0.7,  // Saturday
            0: 0.6   // Sunday
        };
        
        return multipliers[dayOfWeek] || 1.0;
    }

    getHistoricalBaseTime(route, hour, minute) {
        // Simulate historical learning - in production, this would use real data
        const historicalData = this.getStoredHistoricalData();
        const timeKey = `${hour}:${Math.floor(minute / 15) * 15}`; // 15-minute intervals
        
        if (historicalData[route] && historicalData[route][timeKey]) {
            const samples = historicalData[route][timeKey];
            const average = samples.reduce((a, b) => a + b, 0) / samples.length;
            return Math.round(average);
        }
        
        // Default base times
        return route === 'homeToWork' ? 35 : 38;
    }

    storeHistoricalData(hour, minute, homeToWorkTime, workToHomeTime) {
        const timeKey = `${hour}:${Math.floor(minute / 15) * 15}`;
        let historicalData = this.getStoredHistoricalData();
        
        // Initialize if needed
        if (!historicalData.homeToWork) historicalData.homeToWork = {};
        if (!historicalData.workToHome) historicalData.workToHome = {};
        
        // Store data (keep last 10 samples per time slot)
        if (!historicalData.homeToWork[timeKey]) historicalData.homeToWork[timeKey] = [];
        if (!historicalData.workToHome[timeKey]) historicalData.workToHome[timeKey] = [];
        
        historicalData.homeToWork[timeKey].push(homeToWorkTime);
        historicalData.workToHome[timeKey].push(workToHomeTime);
        
        // Keep only last 10 samples
        if (historicalData.homeToWork[timeKey].length > 10) {
            historicalData.homeToWork[timeKey] = historicalData.homeToWork[timeKey].slice(-10);
        }
        if (historicalData.workToHome[timeKey].length > 10) {
            historicalData.workToHome[timeKey] = historicalData.workToHome[timeKey].slice(-10);
        }
        
        // Save to localStorage
        localStorage.setItem('traffic-historical-data', JSON.stringify(historicalData));
    }

    getStoredHistoricalData() {
        const stored = localStorage.getItem('traffic-historical-data');
        return stored ? JSON.parse(stored) : {};
    }

    getConfidenceLevel(multiplier) {
        // Higher multiplier = more uncertainty
        if (multiplier <= 1.1) return "high";
        if (multiplier <= 1.5) return "medium";
        return "low";
    }

    getTrafficTrend(route, hour, minute) {
        const historicalData = this.getStoredHistoricalData();
        const timeKey = `${hour}:${Math.floor(minute / 15) * 15}`;
        
        if (historicalData[route] && historicalData[route][timeKey] && 
            historicalData[route][timeKey].length >= 3) {
            
            const samples = historicalData[route][timeKey];
            const recent = samples.slice(-3);
            const older = samples.slice(-6, -3);
            
            if (older.length >= 3) {
                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
                
                if (recentAvg > olderAvg + 2) return "worsening";
                if (recentAvg < olderAvg - 2) return "improving";
            }
        }
        
        return "stable";
    }

    getTrafficCondition(multiplier) {
        if (multiplier <= 1.2) {
            return { status: "Fluindo", color: "var(--success-color)", icon: "fas fa-check-circle" };
        } else if (multiplier <= 1.5) {
            return { status: "Lento", color: "var(--warning-color)", icon: "fas fa-exclamation-triangle" };
        } else {
            return { status: "Congestionado", color: "var(--danger-color)", icon: "fas fa-times-circle" };
        }
    }

    updateTrafficDisplay() {
        const trafficContent = document.getElementById('traffic-content');
        
        if (!this.trafficData) {
            trafficContent.innerHTML = '<p>Dados de trânsito indisponíveis</p>';
            return;
        }
        
        const { homeToWork, workToHome, lastUpdated } = this.trafficData;
        const updateTime = lastUpdated.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        trafficContent.innerHTML = `
            <div class="traffic-routes">
                <!-- Casa para Trabalho -->
                <div class="traffic-route">
                    <div class="route-header">
                        <div class="route-title">
                            <i class="fas fa-home"></i>
                            <span>Casa → Trabalho</span>
                        </div>
                        <div class="route-status" style="color: ${homeToWork.condition.color};">
                            <i class="${homeToWork.condition.icon}"></i>
                            ${homeToWork.condition.status}
                        </div>
                    </div>
                    <div class="route-details">
                        <div class="route-time">
                            <span class="time-value">${homeToWork.duration} min</span>
                            <span class="route-distance">${homeToWork.distance}</span>
                        </div>
                        <div class="route-info">
                            <div class="route-path">${homeToWork.route}</div>
                            ${homeToWork.alternativeRoute ? 
                                `<div class="alternative-route">
                                    <i class="fas fa-route"></i> ${homeToWork.alternativeRoute}
                                </div>` : ''
                            }
                        </div>
                    </div>
                </div>

                <!-- Trabalho para Casa -->
                <div class="traffic-route">
                    <div class="route-header">
                        <div class="route-title">
                            <i class="fas fa-building"></i>
                            <span>Trabalho → Casa</span>
                        </div>
                        <div class="route-status" style="color: ${workToHome.condition.color};">
                            <i class="${workToHome.condition.icon}"></i>
                            ${workToHome.condition.status}
                        </div>
                    </div>
                    <div class="route-details">
                        <div class="route-time">
                            <span class="time-value">${workToHome.duration} min</span>
                            <span class="route-distance">${workToHome.distance}</span>
                        </div>
                        <div class="route-info">
                            <div class="route-path">${workToHome.route}</div>
                            ${workToHome.alternativeRoute ? 
                                `<div class="alternative-route">
                                    <i class="fas fa-route"></i> ${workToHome.alternativeRoute}
                                </div>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recomendações Inteligentes -->
            <div id="traffic-recommendations"></div>

            <!-- Última Atualização -->
            <div class="traffic-footer">
                <small style="color: var(--text-secondary);">
                    <i class="fas fa-clock"></i> Atualizado às ${updateTime}
                </small>
            </div>
        `;
        
        this.addTrafficStyles();
    }

    updateRecommendations() {
        if (!this.trafficData) return;
        
        const recommendations = this.generateTrafficRecommendations();
        const recommendationsDiv = document.getElementById('traffic-recommendations');
        
        if (recommendations.length > 0) {
            recommendationsDiv.innerHTML = `
                <div class="traffic-recommendations">
                    <h4 style="margin: 15px 0 10px 0; color: var(--text-primary);">
                        <i class="fas fa-lightbulb"></i> Recomendações
                    </h4>
                    ${recommendations.map(rec => `
                        <div class="recommendation-item" style="
                            display: flex; 
                            align-items: center; 
                            padding: 10px; 
                            margin-bottom: 8px; 
                            background: rgba(255, 255, 255, 0.05); 
                            border-radius: 8px;
                            border-left: 3px solid ${rec.color};
                        ">
                            <i class="${rec.icon}" style="color: ${rec.color}; margin-right: 10px;"></i>
                            <div>
                                <strong>${rec.title}</strong><br>
                                <span style="color: var(--text-secondary); font-size: 0.9rem;">${rec.message}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    generateTrafficRecommendations() {
        const recommendations = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        const { homeToWork, workToHome } = this.trafficData;
        
        // Calculate departure time for 9 AM arrival
        const workStartMinutes = 9 * 60; // 9:00 AM in minutes
        const departureTime = workStartMinutes - homeToWork.duration;
        const departureHour = Math.floor(departureTime / 60);
        const departureMins = departureTime % 60;
        
        // Morning recommendations (before work)
        if (currentTime < workStartMinutes) {
            const timeUntilDeparture = departureTime - currentTime;
            
            if (timeUntilDeparture > 0 && timeUntilDeparture <= 30) {
                recommendations.push({
                    icon: "fas fa-clock",
                    title: "Hora de sair!",
                    message: `Saia em ${timeUntilDeparture} minutos (${departureHour.toString().padStart(2, '0')}:${departureMins.toString().padStart(2, '0')}) para chegar às 09:00`,
                    color: "var(--warning-color)"
                });
            } else if (timeUntilDeparture <= 0 && currentTime < workStartMinutes) {
                const delayMinutes = Math.abs(timeUntilDeparture);
                recommendations.push({
                    icon: "fas fa-exclamation-triangle",
                    title: "Atrasado!",
                    message: `Você deveria ter saído há ${delayMinutes} minutos. Chegada prevista: ${this.formatTime(workStartMinutes + delayMinutes)}`,
                    color: "var(--danger-color)"
                });
            } else if (timeUntilDeparture > 60) {
                recommendations.push({
                    icon: "fas fa-coffee",
                    title: "Tempo livre",
                    message: `Saia às ${departureHour.toString().padStart(2, '0')}:${departureMins.toString().padStart(2, '0')} para chegar no horário`,
                    color: "var(--success-color)"
                });
            }
        }
        
        // Evening recommendations (after work hours)
        if (currentTime >= 17 * 60) { // After 5 PM
            const arrivalTime = currentTime + workToHome.duration;
            const arrivalHour = Math.floor(arrivalTime / 60);
            const arrivalMins = arrivalTime % 60;
            
            recommendations.push({
                icon: "fas fa-home",
                title: "Volta para casa",
                message: `Saindo agora, você chegará em casa às ${arrivalHour.toString().padStart(2, '0')}:${arrivalMins.toString().padStart(2, '0')}`,
                color: "var(--primary-color)"
            });
            
            // Traffic condition warnings
            if (workToHome.condition.status === "Congestionado") {
                recommendations.push({
                    icon: "fas fa-clock",
                    title: "Trânsito intenso",
                    message: "Considere aguardar 30-60 minutos para evitar o pico",
                    color: "var(--danger-color)"
                });
            }
        }
        
        // Alternative route suggestions
        if (homeToWork.alternativeRoute && homeToWork.condition.status !== "Fluindo") {
            recommendations.push({
                icon: "fas fa-route",
                title: "Rota alternativa",
                message: homeToWork.alternativeRoute,
                color: "var(--accent-color)"
            });
        }
        
        return recommendations;
    }

    formatTime(minutes) {
        const hour = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    addTrafficStyles() {
        // Add specific styles for traffic widget if not already added
        if (document.getElementById('traffic-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'traffic-styles';
        style.textContent = `
            .traffic-routes {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .traffic-route {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 15px;
                transition: all 0.3s ease;
            }
            
            .traffic-route:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
            }
            
            .route-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .route-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .route-status {
                display: flex;
                align-items: center;
                gap: 5px;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .route-details {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }
            
            .route-time {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .time-value {
                font-size: 1.8rem;
                font-weight: bold;
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                line-height: 1;
            }
            
            .route-distance {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-top: 2px;
            }
            
            .route-info {
                text-align: right;
                flex: 1;
                margin-left: 15px;
            }
            
            .route-path {
                color: var(--text-primary);
                font-weight: 500;
                margin-bottom: 5px;
            }
            
            .alternative-route {
                color: var(--accent-color);
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 5px;
            }
            
            .traffic-footer {
                text-align: center;
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid var(--border-color);
            }
            
            @media (max-width: 768px) {
                .route-details {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .route-info {
                    text-align: left;
                    margin-left: 0;
                }
                
                .alternative-route {
                    justify-content: flex-start;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    displayTrafficError() {
        const trafficContent = document.getElementById('traffic-content');
        trafficContent.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; color: var(--warning-color);"></i>
                <p>Erro ao carregar dados de trânsito</p>
                <p style="font-size: 0.9rem;">Tentando novamente em alguns minutos...</p>
            </div>
        `;
    }

    // Method to manually refresh traffic data
    refreshTrafficData() {
        this.loadTrafficData();
    }

    // Method to get current recommendations for external use
    getCurrentRecommendations() {
        return this.generateTrafficRecommendations();
    }
}

// Initialize traffic manager when dashboard is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard) {
            window.trafficManager = new TrafficManager();
            
            // Add refresh button to traffic widget
            setTimeout(() => {
                const trafficWidget = document.getElementById('traffic-widget');
                if (trafficWidget) {
                    const header = trafficWidget.querySelector('.card-header');
                    const refreshBtn = document.createElement('button');
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    refreshBtn.className = 'btn btn-primary';
                    refreshBtn.style.cssText = 'padding: 5px 10px; margin-left: 10px; font-size: 0.8rem;';
                    refreshBtn.onclick = () => {
                        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        window.trafficManager.refreshTrafficData();
                        setTimeout(() => {
                            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                        }, 2000);
                    };
                    header.appendChild(refreshBtn);
                }
            }, 1000);
        }
    }, 1500);
});