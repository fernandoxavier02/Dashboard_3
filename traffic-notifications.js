// Sistema de Notificações de Trânsito Inteligente
class TrafficNotifications {
    constructor(trafficManager) {
        this.trafficManager = trafficManager;
        this.notificationsSent = new Set();
        this.init();
    }

    init() {
        // Check for departure notifications every minute
        setInterval(() => this.checkDepartureNotifications(), 60 * 1000);
        
        // Check for traffic condition changes every 5 minutes
        setInterval(() => this.checkTrafficConditions(), 5 * 60 * 1000);
        
        // Reset notifications daily at midnight
        setInterval(() => this.resetDailyNotifications(), 60 * 60 * 1000);
    }

    checkDepartureNotifications() {
        if (!this.trafficManager.trafficData) return;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const workStartTime = 9 * 60; // 9:00 AM
        
        // Only check morning notifications on weekdays
        if (now.getDay() === 0 || now.getDay() === 6) return; // Skip weekends
        
        const { homeToWork } = this.trafficManager.trafficData;
        const departureTime = workStartTime - homeToWork.duration;
        
        // Notification timings
        const notifications = [
            { time: departureTime - 30, message: "Saia em 30 minutos para chegar no horário!", type: "early-warning" },
            { time: departureTime - 15, message: "Saia em 15 minutos para chegar às 09:00!", type: "warning" },
            { time: departureTime - 5, message: "Hora de sair! Saída em 5 minutos.", type: "urgent" },
            { time: departureTime, message: "SAIA AGORA para chegar no horário!", type: "critical" }
        ];
        
        notifications.forEach(notification => {
            if (Math.abs(currentTime - notification.time) <= 1 && 
                !this.notificationsSent.has(notification.type)) {
                
                this.sendNotification(
                    "🚗 Alerta de Trânsito",
                    notification.message,
                    notification.type
                );
                
                this.notificationsSent.add(notification.type);
            }
        });
        
        // Late departure warning
        if (currentTime > departureTime && currentTime < workStartTime && 
            !this.notificationsSent.has("late")) {
            
            const delayMinutes = currentTime - departureTime;
            const newArrivalTime = workStartTime + delayMinutes;
            const arrivalHour = Math.floor(newArrivalTime / 60);
            const arrivalMin = newArrivalTime % 60;
            
            this.sendNotification(
                "⚠️ Atraso Detectado",
                `Saindo agora, você chegará às ${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`,
                "late"
            );
            
            this.notificationsSent.add("late");
        }
    }

    checkTrafficConditions() {
        if (!this.trafficManager.trafficData) return;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const { homeToWork, workToHome } = this.trafficManager.trafficData;
        
        // Morning traffic alerts (6 AM - 10 AM)
        if (currentTime >= 6 * 60 && currentTime <= 10 * 60) {
            if (homeToWork.condition.status === "Congestionado" && 
                !this.notificationsSent.has("morning-congestion")) {
                
                this.sendNotification(
                    "🚨 Trânsito Congestionado",
                    `Rota casa-trabalho está congestionada (${homeToWork.duration} min). ${homeToWork.alternativeRoute || 'Considere sair mais cedo.'}`,
                    "traffic-alert"
                );
                
                this.notificationsSent.add("morning-congestion");
            }
        }
        
        // Evening traffic alerts (4 PM - 8 PM)
        if (currentTime >= 16 * 60 && currentTime <= 20 * 60) {
            if (workToHome.condition.status === "Congestionado" && 
                !this.notificationsSent.has("evening-congestion")) {
                
                this.sendNotification(
                    "🚨 Trânsito Intenso para Casa",
                    `Rota trabalho-casa está congestionada (${workToHome.duration} min). ${workToHome.alternativeRoute || 'Considere aguardar ou usar rota alternativa.'}`,
                    "traffic-alert"
                );
                
                this.notificationsSent.add("evening-congestion");
            }
        }
        
        // Improvement notifications
        if (homeToWork.condition.status === "Fluindo" && 
            this.notificationsSent.has("morning-congestion") &&
            !this.notificationsSent.has("morning-improved")) {
            
            this.sendNotification(
                "✅ Trânsito Melhorou",
                `Rota casa-trabalho está fluindo normalmente (${homeToWork.duration} min)`,
                "improvement"
            );
            
            this.notificationsSent.add("morning-improved");
        }
    }

    sendNotification(title, message, type) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: this.getNotificationIcon(type),
                badge: this.getNotificationIcon(type),
                tag: type, // Prevent duplicate notifications
                requireInteraction: type === 'critical' || type === 'urgent'
            });
            
            // Auto-close non-critical notifications after 10 seconds
            if (type !== 'critical' && type !== 'urgent') {
                setTimeout(() => notification.close(), 10000);
            }
        }
        
        // Dashboard notification
        this.showDashboardNotification(title, message, type);
        
        // Console log for debugging
        console.log(`Traffic Notification [${type}]: ${title} - ${message}`);
    }

    showDashboardNotification(title, message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <i class="${this.getNotificationIconClass(type)}"></i>
                    <strong>${title}</strong>
                    <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        // Add styles if not already added
        this.addNotificationStyles();
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        const autoRemoveDelay = type === 'critical' ? 30000 : type === 'urgent' ? 20000 : 15000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, autoRemoveDelay);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
    }

    addNotificationStyles() {
        if (document.getElementById('traffic-notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'traffic-notification-styles';
        style.textContent = `
            .dashboard-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                box-shadow: var(--shadow);
                z-index: 10000;
                transform: translateX(100%);
                transition: all 0.3s ease;
                opacity: 0;
            }
            
            .dashboard-notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .dashboard-notification.early-warning {
                border-left: 4px solid var(--primary-color);
            }
            
            .dashboard-notification.warning {
                border-left: 4px solid var(--warning-color);
            }
            
            .dashboard-notification.urgent {
                border-left: 4px solid var(--danger-color);
                animation: pulse 2s infinite;
            }
            
            .dashboard-notification.critical {
                border-left: 4px solid var(--danger-color);
                background: rgba(248, 113, 113, 0.1);
                animation: pulse 1s infinite;
            }
            
            .dashboard-notification.traffic-alert {
                border-left: 4px solid var(--warning-color);
            }
            
            .dashboard-notification.improvement {
                border-left: 4px solid var(--success-color);
            }
            
            .notification-content {
                padding: 15px;
            }
            
            .notification-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                color: var(--text-primary);
                font-weight: 600;
            }
            
            .notification-close {
                margin-left: auto;
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 2px;
                border-radius: 3px;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            
            .notification-message {
                color: var(--text-secondary);
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @media (max-width: 768px) {
                .dashboard-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    getNotificationIcon(type) {
        const icons = {
            'early-warning': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🕐</text></svg>',
            'warning': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚠️</text></svg>',
            'urgent': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚨</text></svg>',
            'critical': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚗</text></svg>',
            'traffic-alert': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚦</text></svg>',
            'improvement': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✅</text></svg>',
            'late': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>'
        };
        
        return icons[type] || icons['warning'];
    }

    getNotificationIconClass(type) {
        const iconClasses = {
            'early-warning': 'fas fa-clock',
            'warning': 'fas fa-exclamation-triangle',
            'urgent': 'fas fa-exclamation-circle',
            'critical': 'fas fa-car',
            'traffic-alert': 'fas fa-traffic-light',
            'improvement': 'fas fa-check-circle',
            'late': 'fas fa-clock'
        };
        
        return iconClasses[type] || 'fas fa-bell';
    }

    resetDailyNotifications() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            this.notificationsSent.clear();
            console.log('Daily traffic notifications reset');
        }
    }

    // Manual methods for testing
    testDepartureNotification() {
        this.sendNotification(
            "🚗 Teste de Notificação",
            "Esta é uma notificação de teste para verificar o sistema.",
            "warning"
        );
    }

    // Get notification status for debugging
    getNotificationStatus() {
        return {
            sent: Array.from(this.notificationsSent),
            permission: Notification.permission,
            trafficDataAvailable: !!this.trafficManager.trafficData
        };
    }
}

// Initialize traffic notifications when traffic manager is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.trafficManager) {
            window.trafficNotifications = new TrafficNotifications(window.trafficManager);
            
            // Add test button for notifications (development only)
            if (window.location.hostname === 'localhost' || window.location.hostname.includes('proxy')) {
                const testBtn = document.createElement('button');
                testBtn.innerHTML = '<i class="fas fa-bell"></i> Testar Notificação';
                testBtn.className = 'btn btn-primary';
                testBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; font-size: 0.8rem;';
                testBtn.onclick = () => window.trafficNotifications.testDepartureNotification();
                document.body.appendChild(testBtn);
            }
        }
    }, 2000);
});