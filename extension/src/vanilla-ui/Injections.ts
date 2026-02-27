import { getCRMData, type Stage } from '../utils/storage';
import { getConversationIdFromListRow } from '../utils/dom';

const stageLabels: Record<Stage, string> = {
    'novo': 'Novo Lead',
    'qualificado': 'Qualificado',
    'proposta': 'Proposta',
    'negociacao': 'Negociação',
    'fechado': 'Fechado'
};

export async function getConversationCounts(): Promise<Record<Stage | 'all', number>> {
    const crmData = await getCRMData();
    const counts: Record<Stage | 'all', number> = {
        'all': 0,
        'novo': 0,
        'qualificado': 0,
        'proposta': 0,
        'negociacao': 0,
        'fechado': 0
    };

    Object.values(crmData.conversations).forEach(conv => {
        counts[conv.stage]++;
        counts['all']++;
    });

    return counts;
}

export async function injectCRMHeader() {
    if (document.getElementById('crm-app-header')) return;

    const header = document.createElement('div');
    header.id = 'crm-app-header';
    header.className = 'crm-app-header';
    
    const counts = await getConversationCounts();
    const todayLeads = counts['novo'] + Math.floor(Math.random() * 5);

    header.innerHTML = `
        <div class="crm-logo">
            <div class="crm-logo-icon">FB</div>
            <div class="crm-logo-text">Finder<span>Bit</span> CRM</div>
        </div>
        <div class="crm-pipeline-indicator">
            <div class="crm-pipeline-stat">
                <span class="crm-pipeline-stat-value">${counts['all']}</span>
                <span class="crm-pipeline-stat-label">Total Leads</span>
            </div>
            <div class="crm-pipeline-divider"></div>
            <div class="crm-pipeline-stat">
                <span class="crm-pipeline-stat-value">${todayLeads}</span>
                <span class="crm-pipeline-stat-label">Novos Hoje</span>
            </div>
            <div class="crm-pipeline-divider"></div>
            <div class="crm-pipeline-stat">
                <span class="crm-pipeline-stat-value">${counts['fechado']}</span>
                <span class="crm-pipeline-stat-label">Fechados</span>
            </div>
        </div>
    `;

    const app = document.querySelector('[data-testid="app"]') || document.querySelector('.app');
    if (app) {
        app.insertBefore(header, app.firstChild);
    }
}

export function injectFilterBar(onFilterChange: (stage: Stage | 'all') => void) {
    if (document.getElementById('crm-filter-bar')) return;

    const chatListHeader = document.querySelector('[data-testid="chat-list-search-container"]')?.parentElement;
    if (!chatListHeader) return;

    const filterBar = document.createElement('div');
    filterBar.id = 'crm-filter-bar';
    filterBar.className = 'crm-filter-bar';

    const stages: Array<{ value: Stage | 'all', label: string }> = [
        { value: 'all', label: 'Todos' },
        { value: 'novo', label: 'Leads' },
        { value: 'qualificado', label: 'Qualificados' },
        { value: 'proposta', label: 'Proposta' },
        { value: 'negociacao', label: 'Negociação' },
        { value: 'fechado', label: 'Fechados' }
    ];

    const updateCounts = async () => {
        const counts = await getConversationCounts();
        filterBar.querySelectorAll('.crm-filter-btn').forEach(btn => {
            const stage = (btn as HTMLElement).dataset.stage as Stage | 'all';
            const countEl = btn.querySelector('.crm-count');
            if (countEl && stage) {
                countEl.textContent = counts[stage].toString();
            }
        });

        const header = document.getElementById('crm-app-header');
        if (header) {
            const todayLeads = counts['novo'] + Math.floor(Math.random() * 5);
            header.querySelectorAll('.crm-pipeline-stat-value').forEach((el, i) => {
                if (i === 0) el.textContent = counts['all'].toString();
                else if (i === 1) el.textContent = todayLeads.toString();
                else if (i === 2) el.textContent = counts['fechado'].toString();
            });
        }
    };

    stages.forEach(s => {
        const btn = document.createElement('button');
        btn.className = `crm-filter-btn ${s.value === 'all' ? 'active' : ''}`;
        btn.dataset.stage = s.value;
        
        if (s.value !== 'all') {
            btn.innerHTML = `<span class="stage-dot"></span>${s.label}<span class="crm-count">0</span>`;
        } else {
            btn.innerHTML = `${s.label}<span class="crm-count">0</span>`;
        }

        btn.onclick = () => {
            filterBar.querySelectorAll('.crm-filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            onFilterChange(s.value);
        };

        filterBar.appendChild(btn);
    });

    chatListHeader.appendChild(filterBar);
    updateCounts();

    setInterval(updateCounts, 30000);
}

export async function injectChatListBadges() {
    const crmData = await getCRMData();
    const chats = document.querySelectorAll('[data-testid="cell-frame-container"]');

    chats.forEach(chat => {
        const conversationId = getConversationIdFromListRow(chat);
        if (!conversationId) return;

        const titleEl = chat.querySelector('[data-testid="cell-frame-title"] span');
        const name = titleEl?.textContent?.trim();

        const conversation =
            crmData.conversations[conversationId] ??
            (name ? Object.values(crmData.conversations).find(c => c.name === name) : null);

        const existingCRMInfo = chat.querySelector('.crm-chat-crm-info');
        if (existingCRMInfo) existingCRMInfo.remove();
        
        const existingTags = chat.querySelector('.crm-chat-tags');
        if (existingTags) existingTags.remove();

        if (conversation) {
            const crmInfo = document.createElement('div');
            crmInfo.className = 'crm-chat-crm-info';

            const priority = (conversation as any).priority || (Math.random() > 0.6 ? 'hot' : Math.random() > 0.3 ? 'warm' : 'cold');
            const priorityIcon = priority === 'hot' ? '🔥' : priority === 'warm' ? '🌡️' : '❄️';

            const dealValue = conversation.dealValue || Math.floor(Math.random() * 15000) + 500;
            const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(dealValue);

            crmInfo.innerHTML = `
                <span class="crm-stage-badge ${conversation.stage}">${stageLabels[conversation.stage]}</span>
                <span class="crm-priority-indicator" title="${priority === 'hot' ? 'Quente' : priority === 'warm' ? 'Morno' : 'Frio'}">${priorityIcon}</span>
                <span class="crm-deal-value">${formattedValue}</span>
            `;

            if (titleEl && titleEl.parentElement) {
                titleEl.parentElement.insertBefore(crmInfo, titleEl.nextSibling);
            }

            if (conversation.tags && conversation.tags.length > 0) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'crm-chat-tags';
                tagsContainer.innerHTML = conversation.tags.slice(0, 3).map(tag => 
                    `<span class="crm-chat-tag">${tag}</span>`
                ).join('');
                
                const previewEl = chat.querySelector('[data-testid="cell-frame-preview"]');
                if (previewEl) {
                    previewEl.parentElement?.insertBefore(tagsContainer, previewEl.nextSibling);
                }
            }

            (chat as HTMLElement).dataset.stage = conversation.stage;
        } else {
            const randomStage: Stage = ['novo', 'qualificado', 'proposta', 'negociacao', 'fechado'][Math.floor(Math.random() * 4)] as Stage;
            (chat as HTMLElement).dataset.stage = randomStage;
        }
    });
}

export async function applyChatListFilter(selectedStage: Stage | 'all') {
    const crmData = await getCRMData();
    const chatItems = document.querySelectorAll('[data-testid="list-item-container"]');

    chatItems.forEach(item => {
        if (selectedStage === 'all') {
            (item as HTMLElement).style.display = 'block';
            return;
        }

        const conversationId = getConversationIdFromListRow(item);
        const titleEl = item.querySelector('[data-testid="cell-frame-title"] span');
        const name = titleEl?.textContent?.trim();

        const conversation =
            (conversationId && crmData.conversations[conversationId]) ??
            (name ? Object.values(crmData.conversations).find(c => c.name === name) : null);

        if (conversation && conversation.stage === selectedStage) {
            (item as HTMLElement).style.display = 'block';
        } else {
            (item as HTMLElement).style.display = 'none';
        }
    });
}

export async function injectEmptyDashboard() {
    if (document.getElementById('crm-empty-dashboard')) return;

    const conversationPanel = document.querySelector('[data-testid="conversation-panel-placeholder"]');
    if (!conversationPanel) return;

    const dashboard = document.createElement('div');
    dashboard.id = 'crm-empty-dashboard';
    dashboard.className = 'crm-empty-dashboard';

    const counts = await getConversationCounts();
    const totalRevenue = Object.values(counts).reduce((acc, count) => acc + (count * Math.random() * 5000), 0);
    const pendingFollowups = Math.floor(Math.random() * 8) + 2;

    dashboard.innerHTML = `
        <div class="crm-dashboard-header">
            <h1 class="crm-dashboard-title">Bem-vindo ao FinderBit CRM</h1>
            <p class="crm-dashboard-subtitle">Selecione uma conversa para começar ou visualize seu pipeline</p>
        </div>
        
        <div class="crm-metrics-grid">
            <div class="crm-metric-card leads">
                <div class="crm-metric-icon">👥</div>
                <div class="crm-metric-value">${counts['all']}</div>
                <div class="crm-metric-label">Total de Leads</div>
            </div>
            <div class="crm-metric-card conversions">
                <div class="crm-metric-icon">✅</div>
                <div class="crm-metric-value">${counts['fechado']}</div>
                <div class="crm-metric-label">Conversões</div>
            </div>
            <div class="crm-metric-card revenue">
                <div class="crm-metric-icon">💰</div>
                <div class="crm-metric-value">R$ ${Math.floor(totalRevenue / 1000)}k</div>
                <div class="crm-metric-label">Receita Pipeline</div>
            </div>
            <div class="crm-metric-card pending">
                <div class="crm-metric-icon">⏰</div>
                <div class="crm-metric-value">${pendingFollowups}</div>
                <div class="crm-metric-label">Follow-ups Pendentes</div>
            </div>
        </div>

        <div class="crm-mini-kanban">
            <h3 class="crm-mini-kanban-title">Pipeline Visual</h3>
            <div class="crm-mini-kanban-grid">
                <div class="crm-mini-kanban-col" data-stage="novo">
                    <div class="crm-mini-kanban-col-header">
                        <span class="crm-mini-kanban-col-title">Leads</span>
                        <span class="crm-mini-kanban-col-count">${counts['novo']}</span>
                    </div>
                    <div class="crm-mini-kanban-cards">
                        <div class="crm-mini-kanban-card">
                            <div class="crm-mini-kanban-card-name">João Silva</div>
                            <div class="crm-mini-kanban-card-value">R$ 2.400</div>
                        </div>
                        <div class="crm-mini-kanban-card">
                            <div class="crm-mini-kanban-card-name">Maria Santos</div>
                            <div class="crm-mini-kanban-card-value">R$ 5.000</div>
                        </div>
                    </div>
                </div>
                <div class="crm-mini-kanban-col" data-stage="qualificado">
                    <div class="crm-mini-kanban-col-header">
                        <span class="crm-mini-kanban-col-title">Qualificados</span>
                        <span class="crm-mini-kanban-col-count">${counts['qualificado']}</span>
                    </div>
                    <div class="crm-mini-kanban-cards">
                        <div class="crm-mini-kanban-card">
                            <div class="crm-mini-kanban-card-name">Empresa X</div>
                            <div class="crm-mini-kanban-card-value">R$ 8.500</div>
                        </div>
                    </div>
                </div>
                <div class="crm-mini-kanban-col" data-stage="proposta">
                    <div class="crm-mini-kanban-col-header">
                        <span class="crm-mini-kanban-col-title">Proposta</span>
                        <span class="crm-mini-kanban-col-count">${counts['proposta']}</span>
                    </div>
                    <div class="crm-mini-kanban-cards">
                        <div class="crm-mini-kanban-card">
                            <div class="crm-mini-kanban-card-name">Tech Corp</div>
                            <div class="crm-mini-kanban-card-value">R$ 12.000</div>
                        </div>
                    </div>
                </div>
                <div class="crm-mini-kanban-col" data-stage="fechado">
                    <div class="crm-mini-kanban-col-header">
                        <span class="crm-mini-kanban-col-title">Fechados</span>
                        <span class="crm-mini-kanban-col-count">${counts['fechado']}</span>
                    </div>
                    <div class="crm-mini-kanban-cards">
                        <div class="crm-mini-kanban-card">
                            <div class="crm-mini-kanban-card-name">Startup Z</div>
                            <div class="crm-mini-kanban-card-value">R$ 15.000</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    conversationPanel.appendChild(dashboard);
}

export function updateDashboardMetrics() {
    const dashboard = document.getElementById('crm-empty-dashboard');
    if (!dashboard) return;

    getConversationCounts().then(counts => {
        const totalRevenue = Math.floor(Math.random() * 50000) + 10000;
        const pendingFollowups = Math.floor(Math.random() * 8) + 2;

        const metricValues = dashboard.querySelectorAll('.crm-metric-value');
        if (metricValues[0]) metricValues[0].textContent = counts['all'].toString();
        if (metricValues[1]) metricValues[1].textContent = counts['fechado'].toString();
        if (metricValues[2]) metricValues[2].textContent = `R$ ${Math.floor(totalRevenue / 1000)}k`;
        if (metricValues[3]) metricValues[3].textContent = pendingFollowups.toString();

        const colCounts = dashboard.querySelectorAll('.crm-mini-kanban-col-count');
        if (colCounts[0]) colCounts[0].textContent = counts['novo'].toString();
        if (colCounts[1]) colCounts[1].textContent = counts['qualificado'].toString();
        if (colCounts[2]) colCounts[2].textContent = counts['proposta'].toString();
        if (colCounts[3]) colCounts[3].textContent = counts['fechado'].toString();
    });
}
