// Sistema de Notícias Aprimorado - IA e Finanças Empresariais
class EnhancedNewsSystem {
    constructor() {
        this.newsCategories = {
            ai_tech: {
                name: 'IA & Tecnologia',
                icon: '🤖',
                keywords: ['inteligência artificial', 'machine learning', 'AI', 'automação', 'chatgpt', 'openai', 'microsoft', 'google ai', 'nvidia', 'deep learning', 'neural networks', 'generative ai']
            },
            business_finance: {
                name: 'Finanças Empresariais',
                icon: '💼',
                keywords: ['tributos', 'fiscal', 'contabilidade', 'reforma tributária', 'IFRS', 'CPC', 'US GAAP', 'receita federal', 'impostos', 'auditoria', 'compliance']
            },
            innovation: {
                name: 'Inovação',
                icon: '🚀',
                keywords: ['startup', 'inovação', 'venture capital', 'fintech', 'blockchain', 'cryptocurrency', 'digital transformation', 'cloud computing']
            }
        };
        
        this.newsData = [];
        this.init();
    }

    init() {
        this.loadEnhancedNews();
        
        // Atualizar notícias a cada 10 minutos
        setInterval(() => this.loadEnhancedNews(), 10 * 60 * 1000);
    }

    async loadEnhancedNews() {
        try {
            // Simular notícias categorizadas e atualizadas
            const simulatedNews = this.generateCategorizedNews();
            this.newsData = simulatedNews;
            this.updateNewsDisplay();
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
        }
    }

    generateCategorizedNews() {
        const currentTime = new Date();
        
        const aiTechNews = [
            {
                title: "Microsoft anuncia nova versão do Copilot para empresas com IA generativa avançada",
                category: "ai_tech",
                source: "TechCrunch",
                time: this.getRelativeTime(2),
                summary: "Nova ferramenta promete aumentar produtividade em 40% em tarefas corporativas",
                relevance: "high"
            },
            {
                title: "OpenAI lança GPT-5 com capacidades empresariais aprimoradas",
                category: "ai_tech", 
                source: "Valor Econômico",
                time: this.getRelativeTime(4),
                summary: "Modelo focado em automação de processos e análise de dados corporativos",
                relevance: "high"
            },
            {
                title: "NVIDIA apresenta nova arquitetura de chips para IA empresarial",
                category: "ai_tech",
                source: "InfoMoney",
                time: this.getRelativeTime(6),
                summary: "Processadores prometem reduzir custos de infraestrutura de IA em 60%",
                relevance: "medium"
            }
        ];

        const financeNews = [
            {
                title: "Receita Federal publica novas regras para tributação de ativos digitais",
                category: "business_finance",
                source: "Consultor Jurídico",
                time: this.getRelativeTime(1),
                summary: "Mudanças afetam empresas que operam com criptomoedas e NFTs",
                relevance: "high"
            },
            {
                title: "CPC aprova nova norma contábil para reconhecimento de receitas de software",
                category: "business_finance",
                source: "Gazeta do Povo",
                time: this.getRelativeTime(3),
                summary: "Alinhamento com IFRS 15 impacta empresas de tecnologia",
                relevance: "high"
            },
            {
                title: "Reforma tributária: empresas têm até dezembro para adequação ao IBS",
                category: "business_finance",
                source: "Estado de S.Paulo",
                time: this.getRelativeTime(5),
                summary: "Novo imposto sobre bens e serviços entra em vigor em 2026",
                relevance: "medium"
            },
            {
                title: "US GAAP vs IFRS: principais diferenças no tratamento de leasing",
                category: "business_finance",
                source: "Revista Contábil",
                time: this.getRelativeTime(8),
                summary: "Análise comparativa para empresas com operações internacionais",
                relevance: "medium"
            }
        ];

        const innovationNews = [
            {
                title: "Fintech brasileira capta R$ 500 milhões para expansão com IA",
                category: "innovation",
                source: "Exame",
                time: this.getRelativeTime(7),
                summary: "Startup desenvolve soluções de crédito baseadas em machine learning",
                relevance: "medium"
            },
            {
                title: "Blockchain aplicado à auditoria: nova era da transparência contábil",
                category: "innovation",
                source: "IT Forum",
                time: this.getRelativeTime(9),
                summary: "Tecnologia promete revolucionar processos de auditoria empresarial",
                relevance: "low"
            }
        ];

        return [...aiTechNews, ...financeNews, ...innovationNews]
            .sort((a, b) => this.getTimeValue(a.time) - this.getTimeValue(b.time));
    }

    getRelativeTime(hoursAgo) {
        const times = [
            "30 min atrás", "1 hora atrás", "2 horas atrás", "3 horas atrás",
            "4 horas atrás", "5 horas atrás", "6 horas atrás", "8 horas atrás",
            "10 horas atrás", "12 horas atrás"
        ];
        return times[hoursAgo] || `${hoursAgo} horas atrás`;
    }

    getTimeValue(timeString) {
        const match = timeString.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    updateNewsDisplay() {
        const newsFeed = document.getElementById('news-feed');
        if (!newsFeed) return;

        if (this.newsData.length === 0) {
            newsFeed.innerHTML = '<p>Carregando notícias especializadas...</p>';
            return;
        }

        newsFeed.innerHTML = `
            <div class="news-categories">
                <div class="news-category-tabs">
                    <button class="news-tab active" onclick="window.enhancedNews.filterByCategory('all')">
                        📰 Todas
                    </button>
                    <button class="news-tab" onclick="window.enhancedNews.filterByCategory('ai_tech')">
                        🤖 IA & Tech
                    </button>
                    <button class="news-tab" onclick="window.enhancedNews.filterByCategory('business_finance')">
                        💼 Finanças
                    </button>
                    <button class="news-tab" onclick="window.enhancedNews.filterByCategory('innovation')">
                        🚀 Inovação
                    </button>
                </div>
            </div>
            
            <div id="news-list">
                ${this.renderNewsList(this.newsData)}
            </div>
        `;

        this.addNewsStyles();
    }

    renderNewsList(news) {
        return news.map(item => `
            <div class="enhanced-news-item ${item.relevance}" data-category="${item.category}">
                <div class="news-header">
                    <span class="news-category-badge">
                        ${this.newsCategories[item.category]?.icon || '📰'} 
                        ${this.newsCategories[item.category]?.name || 'Geral'}
                    </span>
                    <span class="news-relevance ${item.relevance}">
                        ${item.relevance === 'high' ? '🔥' : item.relevance === 'medium' ? '⚡' : '📊'}
                    </span>
                </div>
                
                <div class="news-title">${item.title}</div>
                
                <div class="news-summary">${item.summary}</div>
                
                <div class="news-footer">
                    <span class="news-source">${item.source}</span>
                    <span class="news-time">${item.time}</span>
                </div>
            </div>
        `).join('');
    }

    filterByCategory(category) {
        // Atualizar tabs ativos
        document.querySelectorAll('.news-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Filtrar notícias
        const filteredNews = category === 'all' 
            ? this.newsData 
            : this.newsData.filter(news => news.category === category);

        // Atualizar lista
        document.getElementById('news-list').innerHTML = this.renderNewsList(filteredNews);
    }

    addNewsStyles() {
        if (document.getElementById('enhanced-news-styles')) return;

        const style = document.createElement('style');
        style.id = 'enhanced-news-styles';
        style.textContent = `
            .news-categories {
                margin-bottom: 15px;
            }
            
            .news-category-tabs {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
            }
            
            .news-tab {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--border-color);
                border-radius: 15px;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.3s ease;
            }
            
            .news-tab.active, .news-tab:hover {
                background: var(--primary-color);
                color: white;
                transform: translateY(-1px);
            }
            
            .enhanced-news-item {
                padding: 15px;
                margin-bottom: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                border-left: 3px solid var(--border-color);
                transition: all 0.3s ease;
            }
            
            .enhanced-news-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .enhanced-news-item.high {
                border-left-color: var(--danger-color);
            }
            
            .enhanced-news-item.medium {
                border-left-color: var(--warning-color);
            }
            
            .enhanced-news-item.low {
                border-left-color: var(--success-color);
            }
            
            .news-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .news-category-badge {
                background: rgba(255, 255, 255, 0.1);
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                color: var(--text-secondary);
            }
            
            .news-relevance {
                font-size: 1rem;
            }
            
            .news-title {
                font-weight: 600;
                color: var(--text-primary);
                line-height: 1.4;
                margin-bottom: 8px;
            }
            
            .news-summary {
                color: var(--text-secondary);
                font-size: 0.9rem;
                line-height: 1.3;
                margin-bottom: 10px;
            }
            
            .news-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
            }
            
            .news-source {
                color: var(--accent-color);
                font-weight: 500;
            }
            
            .news-time {
                color: var(--text-secondary);
            }
            
            @media (max-width: 768px) {
                .news-category-tabs {
                    justify-content: center;
                }
                
                .news-tab {
                    font-size: 0.75rem;
                    padding: 5px 10px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Inicializar sistema de notícias aprimorado
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.enhancedNews = new EnhancedNewsSystem();
    }, 2000);
});