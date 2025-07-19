// KPI Simples de Trânsito
class TrafficDelayKPI {
    constructor() {
        this.history = [];
        this.setupWidget();
        this.updateKPI();
        setInterval(() => this.updateKPI(), 2 * 60 * 1000);
    }

    setupWidget() {
        const widget = document.getElementById('traffic-widget-simple');
        if (!widget) return;

        const kpiCard = document.createElement('div');
        kpiCard.id = 'traffic-kpi-card';
        kpiCard.innerHTML = `
            <div class="kpi-header">
                <h4><i class="fas fa-chart-line"></i> KPI Trânsito</h4>
            </div>
            <div class="kpi-row">Atraso atual: <span id="kpi-delay">--</span></div>
            <div class="kpi-row">Eficiência: <span id="kpi-efficiency">--</span></div>
            <div class="kpi-row">Tendência: <span id="kpi-trend">--</span></div>
            <div class="kpi-row">Próx. 30min: <span id="kpi-forecast">--</span></div>
        `;

        widget.appendChild(kpiCard);
        this.injectStyles();
    }

    injectStyles() {
        if (document.getElementById('traffic-kpi-styles')) return;
        const style = document.createElement('style');
        style.id = 'traffic-kpi-styles';
        style.textContent = `
            #traffic-kpi-card { padding: 10px; margin-top: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; }
            #traffic-kpi-card .kpi-row { margin: 4px 0; color: var(--text-secondary); }
            #traffic-kpi-card .kpi-row span { font-weight: 600; color: var(--text-primary); }
            #traffic-kpi-card .kpi-header h4 { margin: 0 0 5px 0; color: var(--text-primary); font-size: 1rem; }
        `;
        document.head.appendChild(style);
    }

    updateKPI() {
        const trafficData = window.trafficManager && window.trafficManager.trafficData;
        if (!trafficData) return;

        const baseTotal = 35 + 38;
        const currentTotal = trafficData.homeToWork.duration + trafficData.workToHome.duration;
        const delay = Math.max(0, currentTotal - baseTotal);
        const efficiency = Math.round((baseTotal / currentTotal) * 100);

        document.getElementById('kpi-delay').textContent = `${delay} min`;
        document.getElementById('kpi-efficiency').textContent = `${efficiency}%`;

        this.history.push(delay);
        if (this.history.length > 10) this.history.shift();
        const trend = this.calculateTrend();
        document.getElementById('kpi-trend').textContent = trend;

        const forecast = this.predictNext30Min();
        document.getElementById('kpi-forecast').textContent = forecast;
    }

    calculateTrend() {
        if (this.history.length < 2) return 'estável';
        const prev = this.history[this.history.length - 2];
        const curr = this.history[this.history.length - 1];
        if (curr > prev + 2) return 'piorando';
        if (curr < prev - 2) return 'melhorando';
        return 'estável';
    }

    predictNext30Min() {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        if ((minutes >= 6 * 60 && minutes < 8 * 60) || (minutes >= 15 * 60 && minutes < 17 * 60)) {
            return 'tende a piorar';
        }
        if ((minutes >= 9 * 60 && minutes < 11 * 60) || (minutes >= 19 * 60 && minutes < 21 * 60)) {
            return 'tende a melhorar';
        }
        return 'estável';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.trafficKPI = new TrafficDelayKPI(); }, 3000);
});
