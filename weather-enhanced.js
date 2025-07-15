// Sistema de Clima Aprimorado com Previsão Horária
class EnhancedWeatherSystem {
    constructor() {
        this.weatherData = null;
        this.hourlyForecast = [];
        this.init();
    }

    init() {
        this.loadEnhancedWeather();
        
        // Atualizar clima a cada 30 minutos
        setInterval(() => this.loadEnhancedWeather(), 30 * 60 * 1000);
    }

    async loadEnhancedWeather() {
        try {
            // Simular dados de clima mais detalhados
            const enhancedWeatherData = this.generateEnhancedWeatherData();
            this.weatherData = enhancedWeatherData.current;
            this.hourlyForecast = enhancedWeatherData.hourly;
            
            this.updateWeatherDisplay();
        } catch (error) {
            console.error('Erro ao carregar clima:', error);
        }
    }

    generateEnhancedWeatherData() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Dados atuais simulados
        const current = {
            temperature: this.simulateTemperature(currentHour),
            humidity: 65 + Math.random() * 20,
            windSpeed: 8 + Math.random() * 12,
            visibility: 8 + Math.random() * 7,
            feelsLike: this.simulateTemperature(currentHour) + (Math.random() * 6 - 3),
            precipitation: this.simulatePrecipitation(currentHour),
            weatherCode: this.getWeatherCode(currentHour),
            uvIndex: this.calculateUVIndex(currentHour),
            pressure: 1013 + (Math.random() * 20 - 10)
        };

        // Previsão horária para as próximas 24 horas
        const hourly = [];
        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            const date = new Date(now);
            date.setHours(hour);
            if (i >= 24 - currentHour) {
                date.setDate(date.getDate() + 1);
            }

            hourly.push({
                time: date,
                hour: hour,
                temperature: this.simulateTemperature(hour),
                precipitation: this.simulatePrecipitation(hour),
                humidity: 50 + Math.random() * 30,
                windSpeed: 5 + Math.random() * 15,
                weatherCode: this.getWeatherCode(hour)
            });
        }

        return { current, hourly };
    }

    simulateTemperature(hour) {
        // Curva de temperatura ao longo do dia
        const baseTemp = 20;
        const amplitude = 8;
        const phase = (hour - 6) * Math.PI / 12; // Pico às 14h
        return Math.round(baseTemp + amplitude * Math.sin(phase) + (Math.random() * 4 - 2));
    }

    simulatePrecipitation(hour) {
        // Maior probabilidade de chuva à tarde/noite
        let baseProbability = 10;
        if (hour >= 14 && hour <= 20) {
            baseProbability = 30;
        } else if (hour >= 21 || hour <= 5) {
            baseProbability = 20;
        }
        
        return Math.min(95, baseProbability + (Math.random() * 20));
    }

    getWeatherCode(hour) {
        const precipitation = this.simulatePrecipitation(hour);
        
        if (precipitation > 70) return 61; // Chuva
        if (precipitation > 40) return 51; // Garoa
        if (hour >= 6 && hour <= 18) return 1; // Ensolarado
        return 0; // Limpo
    }

    calculateUVIndex(hour) {
        if (hour < 6 || hour > 18) return 0;
        const midday = 12;
        const distance = Math.abs(hour - midday);
        return Math.max(0, Math.round(10 - distance * 1.5));
    }

    updateWeatherDisplay() {
        // Atualizar widget principal de clima
        this.updateMainWeatherWidget();
        
        // Criar/atualizar seção de previsão horária
        this.updateHourlyForecast();
    }

    updateMainWeatherWidget() {
        if (!this.weatherData) return;

        // Atualizar elementos existentes
        const tempElement = document.getElementById('temperature');
        const descElement = document.getElementById('weather-description');
        const humidityElement = document.getElementById('humidity');
        const windElement = document.getElementById('wind-speed');
        const visibilityElement = document.getElementById('visibility');
        const feelsLikeElement = document.getElementById('feels-like');

        if (tempElement) tempElement.textContent = `${this.weatherData.temperature}°C`;
        if (descElement) descElement.textContent = this.getWeatherDescription(this.weatherData.weatherCode);
        if (humidityElement) humidityElement.textContent = `${Math.round(this.weatherData.humidity)}%`;
        if (windElement) windElement.textContent = `${Math.round(this.weatherData.windSpeed)} km/h`;
        if (visibilityElement) visibilityElement.textContent = `${this.weatherData.visibility.toFixed(1)} km`;
        if (feelsLikeElement) feelsLikeElement.textContent = `${Math.round(this.weatherData.feelsLike)}°C`;

        // Adicionar informações extras
        this.addExtraWeatherInfo();
    }

    addExtraWeatherInfo() {
        const weatherCard = document.querySelector('.card .fas.fa-cloud-sun').closest('.card');
        if (!weatherCard) return;

        // Verificar se já existe seção extra
        let extraSection = weatherCard.querySelector('.weather-extra-info');
        if (!extraSection) {
            extraSection = document.createElement('div');
            extraSection.className = 'weather-extra-info';
            weatherCard.appendChild(extraSection);
        }

        extraSection.innerHTML = `
            <div class="weather-extra-grid">
                <div class="weather-extra-item">
                    <i class="fas fa-tint" style="color: var(--primary-color);"></i>
                    <div>
                        <div class="extra-value">${Math.round(this.weatherData.precipitation)}%</div>
                        <div class="extra-label">Chuva Agora</div>
                    </div>
                </div>
                
                <div class="weather-extra-item">
                    <i class="fas fa-sun" style="color: var(--warning-color);"></i>
                    <div>
                        <div class="extra-value">${this.weatherData.uvIndex}</div>
                        <div class="extra-label">Índice UV</div>
                    </div>
                </div>
                
                <div class="weather-extra-item">
                    <i class="fas fa-compress-arrows-alt" style="color: var(--accent-color);"></i>
                    <div>
                        <div class="extra-value">${Math.round(this.weatherData.pressure)} hPa</div>
                        <div class="extra-label">Pressão</div>
                    </div>
                </div>
            </div>
        `;

        this.addWeatherStyles();
    }

    updateHourlyForecast() {
        if (!this.hourlyForecast.length) return;

        // Encontrar ou criar seção de previsão horária
        let forecastSection = document.getElementById('hourly-forecast-section');
        if (!forecastSection) {
            const weatherCard = document.querySelector('.card .fas.fa-cloud-sun').closest('.card');
            if (!weatherCard) return;

            forecastSection = document.createElement('div');
            forecastSection.id = 'hourly-forecast-section';
            forecastSection.innerHTML = `
                <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--text-primary);">
                        <i class="fas fa-clock"></i> Previsão Horária
                    </h4>
                    <div id="hourly-forecast-container"></div>
                </div>
            `;
            weatherCard.appendChild(forecastSection);
        }

        // Atualizar container da previsão
        const container = document.getElementById('hourly-forecast-container');
        if (!container) return;

        // Mostrar próximas 12 horas
        const next12Hours = this.hourlyForecast.slice(0, 12);
        
        container.innerHTML = `
            <div class="hourly-forecast-scroll">
                ${next12Hours.map(hour => `
                    <div class="hourly-item">
                        <div class="hourly-time">
                            ${hour.hour === new Date().getHours() ? 'Agora' : 
                              hour.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div class="hourly-icon">
                            <i class="${this.getWeatherIcon(hour.weatherCode)}"></i>
                        </div>
                        
                        <div class="hourly-temp">
                            ${Math.round(hour.temperature)}°
                        </div>
                        
                        <div class="hourly-rain">
                            <i class="fas fa-tint" style="font-size: 0.7rem; color: var(--primary-color);"></i>
                            ${Math.round(hour.precipitation)}%
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="forecast-summary">
                <div class="summary-item">
                    <strong>Temperatura:</strong> 
                    ${Math.min(...next12Hours.map(h => h.temperature))}° - ${Math.max(...next12Hours.map(h => h.temperature))}°
                </div>
                <div class="summary-item">
                    <strong>Maior chance de chuva:</strong> 
                    ${Math.max(...next12Hours.map(h => h.precipitation))}% às 
                    ${next12Hours.find(h => h.precipitation === Math.max(...next12Hours.map(h => h.precipitation)))?.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;
    }

    getWeatherDescription(code) {
        const descriptions = {
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
            65: 'Chuva intensa'
        };
        return descriptions[code] || 'Condição desconhecida';
    }

    getWeatherIcon(code) {
        const icons = {
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
            65: 'fas fa-cloud-showers-heavy'
        };
        return icons[code] || 'fas fa-question';
    }

    addWeatherStyles() {
        if (document.getElementById('enhanced-weather-styles')) return;

        const style = document.createElement('style');
        style.id = 'enhanced-weather-styles';
        style.textContent = `
            .weather-extra-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid var(--border-color);
            }
            
            .weather-extra-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            
            .weather-extra-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
            }
            
            .extra-value {
                font-weight: bold;
                color: var(--text-primary);
                font-size: 0.9rem;
            }
            
            .extra-label {
                color: var(--text-secondary);
                font-size: 0.7rem;
            }
            
            .hourly-forecast-scroll {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            
            .hourly-forecast-scroll::-webkit-scrollbar {
                height: 4px;
            }
            
            .hourly-forecast-scroll::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
            }
            
            .hourly-forecast-scroll::-webkit-scrollbar-thumb {
                background: var(--primary-color);
                border-radius: 2px;
            }
            
            .hourly-item {
                flex: 0 0 60px;
                text-align: center;
                padding: 8px 4px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .hourly-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .hourly-time {
                font-size: 0.7rem;
                color: var(--text-secondary);
                margin-bottom: 5px;
            }
            
            .hourly-icon {
                font-size: 1.2rem;
                color: var(--accent-color);
                margin-bottom: 5px;
            }
            
            .hourly-temp {
                font-weight: bold;
                color: var(--text-primary);
                font-size: 0.9rem;
                margin-bottom: 3px;
            }
            
            .hourly-rain {
                font-size: 0.7rem;
                color: var(--text-secondary);
            }
            
            .forecast-summary {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                border-radius: 8px;
                font-size: 0.85rem;
            }
            
            .summary-item {
                color: var(--text-secondary);
                margin-bottom: 5px;
            }
            
            .summary-item:last-child {
                margin-bottom: 0;
            }
            
            @media (max-width: 768px) {
                .weather-extra-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                
                .hourly-item {
                    flex: 0 0 50px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Inicializar sistema de clima aprimorado
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.enhancedWeather = new EnhancedWeatherSystem();
    }, 2500);
});