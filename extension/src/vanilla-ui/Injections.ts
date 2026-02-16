import { getCRMData, type Stage } from '../utils/storage';
import { getConversationIdFromListRow } from '../utils/dom';

const stageColors: Record<Stage, string> = {
    'novo': '#667eea',
    'atendimento': '#764ba2',
    'proposta': '#f59e0b',
    'fechado': '#10b981'
};

/**
 * Injects small status badges into the WhatsApp chat list
 */
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

        // Remove existing badge if any
        chat.querySelector('.crm-badge-dot')?.remove();

        if (conversation) {
            const badge = document.createElement('div');
            badge.className = 'crm-badge-dot';
            badge.style.cssText = `
                width: 10px;
                height: 10px;
                background-color: ${stageColors[conversation.stage]};
                border-radius: 50%;
                margin-left: 8px;
                display: inline-block;
                box-shadow: 0 0 4px rgba(0,0,0,0.2);
            `;

            // Inject next to the title
            if (titleEl && titleEl.parentElement) {
                titleEl.parentElement.appendChild(badge);
            }
        }
    });
}

/**
 * Injects a filter bar above the chat list
 */
export function injectFilterBar(onFilterChange: (stage: Stage | 'all') => void) {
    if (document.getElementById('crm-filter-bar')) return;

    const chatListHeader = document.querySelector('[data-testid="chat-list-search-container"]')?.parentElement;
    if (!chatListHeader) return;

    const filterBar = document.createElement('div');
    filterBar.id = 'crm-filter-bar';
    filterBar.style.cssText = `
        display: flex;
        gap: 6px;
        padding: 8px 12px;
        background: #f0f2f5;
        border-bottom: 1px solid #e9edef;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
    `;

    const stages: Array<{ value: Stage | 'all', label: string }> = [
        { value: 'all', label: 'Tudo' },
        { value: 'novo', label: 'Novos' },
        { value: 'atendimento', label: 'Atend.' },
        { value: 'proposta', label: 'Prop.' },
        { value: 'fechado', label: 'Ganhos' }
    ];

    stages.forEach(s => {
        const btn = document.createElement('button');
        btn.textContent = s.label;
        btn.style.cssText = `
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid #764ba2;
            background: ${s.value === 'all' ? '#764ba2' : 'white'};
            color: ${s.value === 'all' ? 'white' : '#764ba2'};
            cursor: pointer;
            font-weight: 600;
        `;

        btn.onclick = () => {
            // Reset others
            filterBar.querySelectorAll('button').forEach(b => {
                (b as HTMLElement).style.background = 'white';
                (b as HTMLElement).style.color = '#764ba2';
            });
            btn.style.background = '#764ba2';
            btn.style.color = 'white';
            onFilterChange(s.value);
        };

        filterBar.appendChild(btn);
    });

    chatListHeader.appendChild(filterBar);
}

/**
 * Filter Chat List items based on selected stage
 */
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
