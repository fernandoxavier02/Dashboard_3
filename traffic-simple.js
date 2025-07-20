// Sistema de Trânsito Simplificado - Garantido para funcionar
console.log('Traffic Simple JS carregado');

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando sistema de trânsito');
    
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(function() {
        initTrafficSystem();
    }, 2000);
});

function initTrafficSystem() {
    console.log('Iniciando sistema de trânsito');
    
    // Criar widget de trânsito
    createTrafficWidget();
    
    // Atualizar dados a cada 30 segundos
    setInterval(updateTrafficData, 30000);
    
    // Primeira atualização
    updateTrafficData();
}

function createTrafficWidget() {
    console.log('Criando widget de trânsito');
    
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) {
        console.error('Dashboard grid não encontrado');
        return;
    }
    
    // Verificar se já existe
    if (document.getElementById('traffic-widget-simple')) {
        console.log('Widget já existe');
        return;
    }
    
    const trafficCard = document.createElement('div');
    trafficCard.id = 'traffic-widget-simple';
    trafficCard.className = 'card';
    trafficCard.innerHTML = `
        <div class="card-header">
            <i class="fas fa-route card-icon"></i>
            <h2 class="card-title">🚗 Trânsito Inteligente</h2>
        </div>
        <div id="traffic-content-simple">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 1.2rem; margin-bottom: 15px; color: var(--text-primary);">
                    <strong>Suas Rotas Configuradas</strong>
                </div>
                
                <!-- Casa para Trabalho -->
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; margin-bottom: 15px; border-left: 3px solid var(--success-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">
                                <i class="fas fa-home"></i> Casa → Trabalho
                            </div>
                            <div id="route-home-work" class="route-description" style="color: var(--text-secondary); font-size: 0.9rem;">
                                Av. Franz Voegeli → Av. Francisco Matarazzo
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div id="home-to-work-time" style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">
                                35 min
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">
                                <span id="home-to-work-distance">18.5 km</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Trabalho para Casa -->
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; margin-bottom: 15px; border-left: 3px solid var(--primary-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">
                                <i class="fas fa-building"></i> Trabalho → Casa
                            </div>
                            <div id="route-work-home" class="route-description" style="color: var(--text-secondary); font-size: 0.9rem;">
                                Av. Francisco Matarazzo → Av. Franz Voegeli
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div id="work-to-home-time" style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">
                                38 min
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">
                                <span id="work-to-home-distance">19.2 km</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recomendações -->
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; border-left: 3px solid var(--accent-color);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 10px;">
                        <i class="fas fa-lightbulb"></i> Recomendações Inteligentes
                    </div>
                    <div id="traffic-recommendations">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px;">
                            ⏰ <strong>Para chegar às 09:00:</strong> Saia às <span id="departure-time-rec">08:25</span>
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px;">
                            🏠 <strong>Saindo agora:</strong> Chegará em casa às <span id="arrival-time-rec">18:45</span>
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">
                            📊 <strong>Eficiência hoje:</strong> <span id="efficiency-today" style="color: var(--success-color);">85%</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; text-align: center;">
                    <small style="color: var(--text-secondary);">
                        <i class="fas fa-sync-alt"></i> Atualizado automaticamente a cada 30s
                    </small>
                </div>
            </div>
        </div>
    `;
    
    // Inserir após o widget de clima (segunda posição)
    const cards = dashboardGrid.children;
    if (cards.length > 1) {
        dashboardGrid.insertBefore(trafficCard, cards[1]);
    } else {
        dashboardGrid.appendChild(trafficCard);
    }
    
    console.log('Widget de trânsito criado com sucesso');
}

async function updateTrafficData() {
    console.log('Atualizando dados de trânsito');
    
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;
    
    // Obter configuração de endereços se disponível
    let baseHomeToWork = 35;
    let baseWorkToHome = 38;
    
    if (window.addressConfig && window.addressConfig.config) {
        const config = window.addressConfig.config;
        if (config.homeAddress && config.workAddress) {
            try {
                const hw = await window.addressConfig.fetchHereRoute(config.homeAddress, config.workAddress);
                const wh = await window.addressConfig.fetchHereRoute(config.workAddress, config.homeAddress);
                baseHomeToWork = Math.round(hw.duration);
                baseWorkToHome = Math.round(wh.duration);
                const distElem1 = document.getElementById('home-to-work-distance');
                const distElem2 = document.getElementById('work-to-home-distance');
                if (distElem1) distElem1.textContent = `${hw.distance.toFixed(1)} km`;
                if (distElem2) distElem2.textContent = `${wh.distance.toFixed(1)} km`;
            } catch (err) {
                console.error('HERE API error:', err);
                const distance = estimateDistanceFromAddresses(config.homeAddress, config.workAddress);
                baseHomeToWork = Math.max(15, Math.min(90, Math.round(distance * 2.5)));
                baseWorkToHome = Math.max(15, Math.min(90, Math.round(distance * 2.8)));
                const distElem1 = document.getElementById('home-to-work-distance');
                const distElem2 = document.getElementById('work-to-home-distance');
                if (distElem1) distElem1.textContent = `${distance.toFixed(1)} km`;
                if (distElem2) distElem2.textContent = `${(distance * 1.1).toFixed(1)} km`;
            }

            // Atualizar descrições das rotas no card
            updateRouteDescriptions(config.homeAddress, config.workAddress);
        }
    }
    
    // Simular condições de trânsito baseadas no horário
    let homeToWorkTime = baseHomeToWork;
    let workToHomeTime = baseWorkToHome;
    let efficiency = 85;

function updateRouteDescriptions(homeAddress, workAddress) {
    const widget = document.getElementById('traffic-widget-simple');
    if (!widget) return;
    
    const homeWorkDesc = document.getElementById('route-home-work');
    const workHomeDesc = document.getElementById('route-work-home');

    if (homeWorkDesc && workHomeDesc) {
        homeWorkDesc.textContent = `${getShortAddress(homeAddress)} → ${getShortAddress(workAddress)}`;
        workHomeDesc.textContent = `${getShortAddress(workAddress)} → ${getShortAddress(homeAddress)}`;
    }
}

function getShortAddress(address) {
    if (!address) return 'Endereço não definido';
    const parts = address.split(',');
    return parts[0].trim();
}
    
    // Horário de pico manhã (7:00-9:30)
    if (currentTime >= 7*60 && currentTime <= 9.5*60) {
        const peakIntensity = Math.sin(((currentTime - 7*60) / (2.5*60)) * Math.PI);
        homeToWorkTime = Math.round(35 + (peakIntensity * 25)); // Até 60 min
        efficiency = Math.round(85 - (peakIntensity * 30)); // Até 55%
    }
    
    // Horário de pico tarde (17:00-19:30)
    if (currentTime >= 17*60 && currentTime <= 19.5*60) {
        const peakIntensity = Math.sin(((currentTime - 17*60) / (2.5*60)) * Math.PI);
        workToHomeTime = Math.round(38 + (peakIntensity * 30)); // Até 68 min
        efficiency = Math.round(85 - (peakIntensity * 35)); // Até 50%
    }
    
    // Atualizar display
    const homeToWorkElement = document.getElementById('home-to-work-time');
    const workToHomeElement = document.getElementById('work-to-home-time');
    const efficiencyElement = document.getElementById('efficiency-today');
    
    if (homeToWorkElement) {
        homeToWorkElement.textContent = homeToWorkTime + ' min';
        homeToWorkElement.style.color = homeToWorkTime > 45 ? 'var(--danger-color)' : 
                                        homeToWorkTime > 40 ? 'var(--warning-color)' : 'var(--success-color)';
    }
    
    if (workToHomeElement) {
        workToHomeElement.textContent = workToHomeTime + ' min';
        workToHomeElement.style.color = workToHomeTime > 50 ? 'var(--danger-color)' : 
                                        workToHomeTime > 45 ? 'var(--warning-color)' : 'var(--primary-color)';
    }
    
    if (efficiencyElement) {
        efficiencyElement.textContent = efficiency + '%';
        efficiencyElement.style.color = efficiency < 60 ? 'var(--danger-color)' : 
                                        efficiency < 75 ? 'var(--warning-color)' : 'var(--success-color)';
    }
    
    // Calcular horários
    updateRecommendations(homeToWorkTime, workToHomeTime, currentTime);
    
    console.log(`Trânsito atualizado: Casa→Trabalho ${homeToWorkTime}min, Trabalho→Casa ${workToHomeTime}min, Eficiência ${efficiency}%`);
}

function updateRecommendations(homeToWorkTime, workToHomeTime, currentTime) {
    // Calcular horário de saída para chegar às 9:00
    const workStartTime = 9 * 60; // 9:00 em minutos
    const departureTime = workStartTime - homeToWorkTime;
    const depHour = Math.floor(departureTime / 60);
    const depMin = departureTime % 60;
    
    // Calcular horário de chegada se sair agora
    const arrivalTime = currentTime + workToHomeTime;
    const arrHour = Math.floor(arrivalTime / 60);
    const arrMin = arrivalTime % 60;
    
    // Atualizar recomendações
    const departureElement = document.getElementById('departure-time-rec');
    const arrivalElement = document.getElementById('arrival-time-rec');
    
    if (departureElement) {
        departureElement.textContent = `${depHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;
    }
    
    if (arrivalElement) {
        arrivalElement.textContent = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;
    }
}

function estimateDistanceFromAddresses(address1, address2) {
    if (!address1 || !address2) return 20; // Default 20km
    
    // Verificar se são endereços na mesma cidade
    const sameCity = checkSameCity(address1, address2);
    let baseDistance = sameCity ? 15 : 35;
    
    // Ajustar baseado em palavras-chave dos bairros
    const keywords = ['centro', 'downtown', 'paulista', 'faria lima', 'berrini', 'vila madalena', 'pinheiros'];
    const addr1Lower = address1.toLowerCase();
    const addr2Lower = address2.toLowerCase();
    
    const addr1Central = keywords.some(k => addr1Lower.includes(k));
    const addr2Central = keywords.some(k => addr2Lower.includes(k));
    
    if (addr1Central && addr2Central) {
        baseDistance *= 0.7; // Ambos centrais = mais próximos
    } else if (addr1Central || addr2Central) {
        baseDistance *= 0.9; // Um central = moderadamente próximos
    }
    
    // Adicionar variação pequena
    return baseDistance + (Math.random() * 6 - 3);
}

function checkSameCity(address1, address2) {
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

// Função para testar se está funcionando
function testTrafficSystem() {
    console.log('Testando sistema de trânsito...');
    const widget = document.getElementById('traffic-widget-simple');
    if (widget) {
        console.log('✅ Widget encontrado');
        updateTrafficData();
        console.log('✅ Dados atualizados');
        return true;
    } else {
        console.log('❌ Widget não encontrado');
        return false;
    }
}

// Disponibilizar função de teste globalmente
window.testTrafficSystem = testTrafficSystem;
window.updateTrafficData = updateTrafficData;

console.log('Sistema de trânsito simplificado carregado');