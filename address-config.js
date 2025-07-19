// Sistema de Configuração de Endereços
class AddressConfig {
    constructor() {
        this.config = this.loadConfig();
        this.init();
    }

    init() {
        this.createConfigWidget();
        this.setupConfigModal();
    }

    createConfigWidget() {
        // Adicionar botão de configuração no widget de trânsito
        setTimeout(() => {
            const trafficWidget = document.getElementById('traffic-widget-simple');
            if (trafficWidget) {
                const header = trafficWidget.querySelector('.card-header');
                const configBtn = document.createElement('button');
                configBtn.innerHTML = '<i class="fas fa-cog"></i>';
                configBtn.className = 'btn btn-primary';
                configBtn.style.cssText = 'padding: 5px 10px; margin-left: 10px; font-size: 0.8rem;';
                configBtn.title = 'Configurar Endereços';
                configBtn.onclick = () => this.openConfigModal();
                header.appendChild(configBtn);
            }
        }, 3000);
    }

    setupConfigModal() {
        // Criar modal de configuração
        const modal = document.createElement('div');
        modal.id = 'address-config-modal';
        modal.className = 'config-modal';
        modal.innerHTML = `
            <div class="config-modal-content">
                <div class="config-modal-header">
                    <h3><i class="fas fa-map-marker-alt"></i> Configurar Endereços</h3>
                    <button class="config-close" onclick="window.addressConfig.closeConfigModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="config-modal-body">
                    <div class="config-section">
                        <label for="home-address">🏠 Endereço Residencial:</label>
                        <input type="text" id="home-address" placeholder="Ex: Rua das Flores, 123, Bairro, Cidade, SP">
                        <small>Endereço completo de onde você mora</small>
                    </div>
                    
                    <div class="config-section">
                        <label for="work-address">🏢 Endereço do Trabalho:</label>
                        <input type="text" id="work-address" placeholder="Ex: Av. Paulista, 1000, Centro, São Paulo, SP">
                        <small>Endereço completo do seu local de trabalho</small>
                    </div>
                    
                    <div class="config-section">
                        <label for="work-start-time">⏰ Horário de Entrada:</label>
                        <input type="time" id="work-start-time" value="09:00">
                        <small>Horário que você precisa chegar no trabalho</small>
                    </div>
                    
                    <div class="config-section">
                        <label for="work-end-time">🕐 Horário de Saída:</label>
                        <input type="time" id="work-end-time" value="18:00">
                        <small>Horário que você sai do trabalho</small>
                    </div>
                    
                    <div class="config-section">
                        <label for="commute-buffer">⏱️ Tempo Extra (minutos):</label>
                        <input type="number" id="commute-buffer" value="5" min="0" max="30">
                        <small>Tempo adicional de segurança para imprevistos</small>
                    </div>
                    
                    <div class="config-section">
                        <h4>🚗 Configurações Avançadas</h4>
                        <div class="config-checkbox">
                            <input type="checkbox" id="weekend-mode">
                            <label for="weekend-mode">Monitorar trânsito nos fins de semana</label>
                        </div>
                        <div class="config-checkbox">
                            <input type="checkbox" id="notifications-enabled" checked>
                            <label for="notifications-enabled">Receber notificações de trânsito</label>
                        </div>
                        <div class="config-checkbox">
                            <input type="checkbox" id="weather-integration" checked>
                            <label for="weather-integration">Considerar impacto do clima</label>
                        </div>
                    </div>
                </div>
                
                <div class="config-modal-footer">
                    <button class="btn btn-secondary" onclick="window.addressConfig.resetToDefaults()">
                        <i class="fas fa-undo"></i> Restaurar Padrão
                    </button>
                    <button class="btn btn-primary" onclick="window.addressConfig.saveConfig()">
                        <i class="fas fa-save"></i> Salvar Configurações
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addModalStyles();
    }

    openConfigModal() {
        const modal = document.getElementById('address-config-modal');
        
        // Preencher campos com valores atuais
        document.getElementById('home-address').value = this.config.homeAddress || '';
        document.getElementById('work-address').value = this.config.workAddress || '';
        document.getElementById('work-start-time').value = this.config.workStartTime || '09:00';
        document.getElementById('work-end-time').value = this.config.workEndTime || '18:00';
        document.getElementById('commute-buffer').value = this.config.commuteBuffer || 5;
        document.getElementById('weekend-mode').checked = this.config.weekendMode || false;
        document.getElementById('notifications-enabled').checked = this.config.notificationsEnabled !== false;
        document.getElementById('weather-integration').checked = this.config.weatherIntegration !== false;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeConfigModal() {
        const modal = document.getElementById('address-config-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    saveConfig() {
        // Coletar dados do formulário
        const newConfig = {
            homeAddress: document.getElementById('home-address').value.trim(),
            workAddress: document.getElementById('work-address').value.trim(),
            workStartTime: document.getElementById('work-start-time').value,
            workEndTime: document.getElementById('work-end-time').value,
            commuteBuffer: parseInt(document.getElementById('commute-buffer').value) || 5,
            weekendMode: document.getElementById('weekend-mode').checked,
            notificationsEnabled: document.getElementById('notifications-enabled').checked,
            weatherIntegration: document.getElementById('weather-integration').checked,
            lastUpdated: new Date().toISOString()
        };
        
        // Validar campos obrigatórios
        if (!newConfig.homeAddress || !newConfig.workAddress) {
            alert('⚠️ Por favor, preencha os endereços residencial e do trabalho.');
            return;
        }
        
        // Salvar configuração
        this.config = newConfig;
        localStorage.setItem('traffic-address-config', JSON.stringify(this.config));
        
        // Atualizar sistema de trânsito
        this.updateTrafficSystem();
        
        // Fechar modal
        this.closeConfigModal();
        
        // Mostrar confirmação
        this.showSuccessMessage();
    }

    resetToDefaults() {
        if (confirm('🔄 Tem certeza que deseja restaurar as configurações padrão?')) {
            this.config = this.getDefaultConfig();
            localStorage.setItem('traffic-address-config', JSON.stringify(this.config));
            this.openConfigModal(); // Reabrir para mostrar valores padrão
        }
    }

    updateTrafficSystem() {
        // Atualizar sistema de trânsito com novos endereços
        if (window.trafficManager) {
            window.trafficManager.homeAddress = this.config.homeAddress;
            window.trafficManager.workAddress = this.config.workAddress;
            window.trafficManager.workStartTime = this.config.workStartTime;
            window.trafficManager.workEndTime = this.config.workEndTime;
            window.trafficManager.loadTrafficData();
        }
        
        // Forçar atualização do widget simples com novos endereços
        this.updateSimpleWidget();
        
        // Atualizar sistema de KPI
        if (window.trafficKPI) {
            window.trafficKPI.updateKPI();
        }
        
        // Recalcular dados de trânsito baseados nos novos endereços
        this.recalculateTrafficTimes();
        
        // Atualizar integração produtividade-trânsito
        if (window.productivityTrafficIntegration) {
            window.productivityTrafficIntegration.updateIntegration();
        }
    }

    recalculateTrafficTimes() {
        // Simular novos tempos baseados nos endereços configurados
        const newTrafficData = this.calculateTrafficForNewAddresses();
        
        // Atualizar displays com novos tempos
        this.updateTrafficDisplays(newTrafficData);
        
        // Notificar outros sistemas sobre a mudança
        this.notifySystemsOfChange(newTrafficData);
    }

    calculateTrafficForNewAddresses() {
        // Calcular distância aproximada baseada nos endereços
        const distance = this.estimateDistance(this.config.homeAddress, this.config.workAddress);
        
        // Calcular tempos base baseados na distância
        const baseHomeToWork = Math.max(15, Math.min(90, Math.round(distance * 2.5))); // ~2.5 min por km
        const baseWorkToHome = Math.max(15, Math.min(90, Math.round(distance * 2.8))); // Ligeiramente mais longo
        
        // Aplicar variações baseadas no horário atual
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;
        
        let homeToWorkMultiplier = 1.0;
        let workToHomeMultiplier = 1.0;
        
        // Picos de trânsito
        if (currentTime >= 7*60 && currentTime <= 9*60) {
            const peakProgress = (currentTime - 7*60) / (2*60);
            homeToWorkMultiplier = 1.0 + (Math.sin(peakProgress * Math.PI) * 0.8);
        }
        
        if (currentTime >= 17*60 && currentTime <= 19*60) {
            const peakProgress = (currentTime - 17*60) / (2*60);
            workToHomeMultiplier = 1.0 + (Math.sin(peakProgress * Math.PI) * 0.9);
        }
        
        return {
            homeToWork: {
                duration: Math.round(baseHomeToWork * homeToWorkMultiplier),
                distance: `${distance.toFixed(1)} km`,
                route: this.generateRouteName(this.config.homeAddress, this.config.workAddress),
                condition: this.getConditionFromMultiplier(homeToWorkMultiplier)
            },
            workToHome: {
                duration: Math.round(baseWorkToHome * workToHomeMultiplier),
                distance: `${(distance * 1.1).toFixed(1)} km`,
                route: this.generateRouteName(this.config.workAddress, this.config.homeAddress),
                condition: this.getConditionFromMultiplier(workToHomeMultiplier)
            }
        };
    }

    estimateDistance(address1, address2) {
        // Estimativa simples baseada no comprimento dos endereços e palavras-chave
        if (!address1 || !address2) return 20; // Default 20km
        
        // Verificar se são endereços na mesma cidade
        const sameCity = this.checkSameCity(address1, address2);
        let baseDistance = sameCity ? 15 : 35;
        
        // Ajustar baseado em palavras-chave dos bairros
        const keywords = ['centro', 'downtown', 'paulista', 'faria lima', 'berrini'];
        const addr1Lower = address1.toLowerCase();
        const addr2Lower = address2.toLowerCase();
        
        const addr1Central = keywords.some(k => addr1Lower.includes(k));
        const addr2Central = keywords.some(k => addr2Lower.includes(k));
        
        if (addr1Central && addr2Central) {
            baseDistance *= 0.7; // Ambos centrais = mais próximos
        } else if (addr1Central || addr2Central) {
            baseDistance *= 0.9; // Um central = moderadamente próximos
        }
        
        // Adicionar variação aleatória pequena
        return baseDistance + (Math.random() * 10 - 5);
    }

    checkSameCity(address1, address2) {
        const cities = ['são paulo', 'sp', 'rio de janeiro', 'rj', 'belo horizonte', 'mg'];
        const addr1Lower = address1.toLowerCase();
        const addr2Lower = address2.toLowerCase();
        
        for (const city of cities) {
            if (addr1Lower.includes(city) && addr2Lower.includes(city)) {
                return true;
            }
        }
        return false;
    }

    generateRouteName(fromAddress, toAddress) {
        // Extrair nomes principais das ruas/avenidas
        const fromStreet = this.extractMainStreet(fromAddress);
        const toStreet = this.extractMainStreet(toAddress);
        
        return `Via ${fromStreet} → ${toStreet}`;
    }

    extractMainStreet(address) {
        if (!address) return 'Rua Principal';
        
        // Extrair primeira parte do endereço (nome da rua)
        const parts = address.split(',');
        if (parts.length > 0) {
            const street = parts[0].trim();
            // Limitar tamanho para display
            return street.length > 25 ? street.substring(0, 25) + '...' : street;
        }
        return 'Rua Principal';
    }

    getConditionFromMultiplier(multiplier) {
        if (multiplier <= 1.2) return { status: "Fluindo", color: "var(--success-color)", icon: "fas fa-check-circle" };
        if (multiplier <= 1.6) return { status: "Lento", color: "var(--warning-color)", icon: "fas fa-exclamation-triangle" };
        return { status: "Congestionado", color: "var(--danger-color)", icon: "fas fa-times-circle" };
    }

    updateTrafficDisplays(newTrafficData) {
        // Atualizar widget simples
        const homeToWorkTime = document.getElementById('home-to-work-time');
        const workToHomeTime = document.getElementById('work-to-home-time');
        const homeToWorkDistance = document.getElementById('home-to-work-distance');
        const workToHomeDistance = document.getElementById('work-to-home-distance');
        
        if (homeToWorkTime) {
            homeToWorkTime.textContent = `${newTrafficData.homeToWork.duration} min`;
            homeToWorkTime.style.color = newTrafficData.homeToWork.condition.color;
        }
        if (homeToWorkDistance) {
            homeToWorkDistance.textContent = newTrafficData.homeToWork.distance;
        }
        
        if (workToHomeTime) {
            workToHomeTime.textContent = `${newTrafficData.workToHome.duration} min`;
            workToHomeTime.style.color = newTrafficData.workToHome.condition.color;
        }
        if (workToHomeDistance) {
            workToHomeDistance.textContent = newTrafficData.workToHome.distance;
        }
        
        // Atualizar descrições das rotas
        this.updateSimpleWidget();
    }

    notifySystemsOfChange(newTrafficData) {
        // Notificar outros sistemas sobre os novos dados
        if (window.trafficManager) {
            window.trafficManager.trafficData = {
                homeToWork: newTrafficData.homeToWork,
                workToHome: newTrafficData.workToHome,
                lastUpdated: new Date()
            };
        }
        
        // Forçar atualização do dashboard principal
        if (window.dashboard) {
            window.dashboard.updateStats();
        }
    }

    updateSimpleWidget() {
        const widget = document.getElementById('traffic-widget-simple');
        if (!widget) return;
        
        // Encontrar e atualizar as descrições das rotas
        const homeWorkDesc = document.getElementById('route-home-work');
        const workHomeDesc = document.getElementById('route-work-home');

        if (homeWorkDesc && workHomeDesc) {
            // Primeira rota: Casa → Trabalho
            homeWorkDesc.textContent = `${this.getShortAddress(this.config.homeAddress)} → ${this.getShortAddress(this.config.workAddress)}`;

            // Segunda rota: Trabalho → Casa
            workHomeDesc.textContent = `${this.getShortAddress(this.config.workAddress)} → ${this.getShortAddress(this.config.homeAddress)}`;
        }
        
        // Atualizar recomendações com novos horários
        this.updateRecommendations();
        
        // Forçar recálculo dos tempos de viagem
        if (window.testTrafficSystem) {
            setTimeout(() => window.testTrafficSystem(), 500);
        }
    }

    updateRecommendations() {
        // Recalcular horários baseados na nova configuração
        const workStartTime = this.parseTime(this.config.workStartTime);
        const buffer = this.config.commuteBuffer || 5;
        
        // Simular tempo atual de viagem (será atualizado pelo sistema principal)
        const estimatedTravelTime = this.estimateCurrentTravelTime();
        
        // Calcular horário de saída
        const departureTime = workStartTime - estimatedTravelTime - buffer;
        const departureFormatted = this.formatTime(departureTime);
        
        // Calcular horário de chegada se sair agora
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const arrivalTime = currentTime + estimatedTravelTime;
        const arrivalFormatted = this.formatTime(arrivalTime);
        
        // Atualizar elementos de recomendação
        const departureElement = document.getElementById('departure-time-rec');
        const arrivalElement = document.getElementById('arrival-time-rec');
        
        if (departureElement) {
            departureElement.textContent = departureFormatted;
        }
        
        if (arrivalElement) {
            arrivalElement.textContent = arrivalFormatted;
        }
    }

    parseTime(timeString) {
        if (!timeString) return 9 * 60; // Default 9:00
        
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + (minutes || 0);
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    estimateCurrentTravelTime() {
        // Estimar tempo baseado na distância calculada
        const distance = this.estimateDistance(this.config.homeAddress, this.config.workAddress);
        const baseTime = Math.round(distance * 2.5); // ~2.5 min por km
        
        // Aplicar multiplicador baseado no horário atual
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let multiplier = 1.0;
        if (currentTime >= 7*60 && currentTime <= 9*60) {
            multiplier = 1.4; // Pico manhã
        } else if (currentTime >= 17*60 && currentTime <= 19*60) {
            multiplier = 1.5; // Pico tarde
        }
        
        return Math.round(baseTime * multiplier);
    }

    getShortAddress(fullAddress) {
        if (!fullAddress) return 'Não configurado';
        
        // Extrair partes principais do endereço
        const parts = fullAddress.split(',');
        if (parts.length >= 2) {
            return `${parts[0].trim()}, ${parts[1].trim()}`;
        }
        return fullAddress.length > 30 ? fullAddress.substring(0, 30) + '...' : fullAddress;
    }

    showSuccessMessage() {
        // Criar notificação de sucesso
        const notification = document.createElement('div');
        notification.className = 'config-success-notification';
        notification.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>Configurações salvas com sucesso!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addModalStyles() {
        if (document.getElementById('config-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'config-modal-styles';
        style.textContent = `
            .config-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .config-modal-content {
                background: var(--card-bg);
                border-radius: 15px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: var(--shadow);
                border: 1px solid var(--border-color);
            }
            
            .config-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .config-modal-header h3 {
                color: var(--text-primary);
                margin: 0;
            }
            
            .config-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 5px;
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            
            .config-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            
            .config-modal-body {
                padding: 20px;
            }
            
            .config-section {
                margin-bottom: 20px;
            }
            
            .config-section label {
                display: block;
                color: var(--text-primary);
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .config-section input {
                width: 100%;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                color: var(--text-primary);
                font-size: 1rem;
            }
            
            .config-section small {
                display: block;
                color: var(--text-secondary);
                font-size: 0.85rem;
                margin-top: 5px;
            }
            
            .config-checkbox {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .config-checkbox input {
                width: auto;
                margin-right: 10px;
            }
            
            .config-checkbox label {
                margin: 0;
                font-weight: normal;
            }
            
            .config-modal-footer {
                display: flex;
                justify-content: space-between;
                padding: 20px;
                border-top: 1px solid var(--border-color);
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-secondary);
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
                color: var(--text-primary);
            }
            
            .config-success-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success-color);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: var(--shadow);
                z-index: 10001;
                transition: opacity 0.3s ease;
            }
            
            .success-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            @media (max-width: 768px) {
                .config-modal-content {
                    margin: 10px;
                    max-height: 95vh;
                }
                
                .config-modal-footer {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    loadConfig() {
        const stored = localStorage.getItem('traffic-address-config');
        return stored ? JSON.parse(stored) : this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            homeAddress: 'Avenida Franz Voegeli, 924, Parque Continental, São Paulo, SP',
            workAddress: 'Avenida Francisco Matarazzo, 1350, São Paulo, SP',
            workStartTime: '09:00',
            workEndTime: '18:00',
            commuteBuffer: 5,
            weekendMode: false,
            notificationsEnabled: true,
            weatherIntegration: true
        };
    }

    // Métodos públicos para acesso externo
    getHomeAddress() {
        return this.config.homeAddress;
    }

    getWorkAddress() {
        return this.config.workAddress;
    }

    getWorkStartTime() {
        return this.config.workStartTime;
    }

    getWorkEndTime() {
        return this.config.workEndTime;
    }

    getCommuteBuffer() {
        return this.config.commuteBuffer || 5;
    }

    isWeekendModeEnabled() {
        return this.config.weekendMode || false;
    }

    areNotificationsEnabled() {
        return this.config.notificationsEnabled !== false;
    }

    isWeatherIntegrationEnabled() {
        return this.config.weatherIntegration !== false;
    }
}

// Inicializar sistema de configuração
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.addressConfig = new AddressConfig();
    }, 4000);
});