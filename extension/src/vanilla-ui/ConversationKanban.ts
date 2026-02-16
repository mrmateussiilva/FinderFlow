/**
 * Kanban view where each COLUMN is one conversation (CRM data).
 * User can open a conversation by clicking "Abrir conversa" in the column.
 */
import { listConversations } from '../utils/storage';
import type { Stage } from '../utils/storage';
import { openConversationInList } from '../utils/dom';

const STAGE_COLORS: Record<Stage, string> = {
    novo: '#667eea',
    atendimento: '#764ba2',
    proposta: '#f59e0b',
    fechado: '#10b981'
};

const STAGE_LABELS: Record<Stage, string> = {
    novo: 'Novo',
    atendimento: 'Atendimento',
    proposta: 'Proposta',
    fechado: 'Fechado'
};

export async function createConversationKanbanModal(onClose: () => void) {
    const conversations = await listConversations();
    const overlay = document.createElement('div');
    overlay.className = 'crm-conversation-kanban-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        flex-shrink: 0;
        padding: 16px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    const title = document.createElement('h2');
    title.style.cssText = 'margin: 0; font-size: 20px; font-weight: 700;';
    title.textContent = 'Kanban de conversas';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 0 8px;
        line-height: 1;
    `;
    closeBtn.onclick = onClose;
    header.appendChild(title);
    header.appendChild(closeBtn);
    overlay.appendChild(header);

    const scrollWrap = document.createElement('div');
    scrollWrap.style.cssText = `
        flex: 1;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 24px;
        display: flex;
        gap: 20px;
        align-items: stretch;
    `;

    if (conversations.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = `
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 16px;
        `;
        empty.textContent = 'Nenhuma conversa no CRM. Abra conversas no WhatsApp e use a sidebar para adicioná-las.';
        scrollWrap.appendChild(empty);
    } else {
        for (const conv of conversations) {
            const col = document.createElement('div');
            col.style.cssText = `
                flex-shrink: 0;
                width: 280px;
                min-height: 200px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;
            const colHeader = document.createElement('div');
            colHeader.style.cssText = `
                padding: 14px 16px;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
            `;
            const nameEl = document.createElement('div');
            nameEl.style.cssText = 'font-weight: 700; font-size: 15px; color: #1f2937; margin-bottom: 6px;';
            nameEl.textContent = conv.name;
            const stageBadge = document.createElement('span');
            stageBadge.style.cssText = `
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                color: white;
                background: ${STAGE_COLORS[conv.stage]};
            `;
            stageBadge.textContent = STAGE_LABELS[conv.stage];
            colHeader.appendChild(nameEl);
            colHeader.appendChild(stageBadge);
            col.appendChild(colHeader);

            const colBody = document.createElement('div');
            colBody.style.cssText = `
                flex: 1;
                padding: 14px 16px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                overflow-y: auto;
            `;
            if (conv.tags.length > 0) {
                const tagsWrap = document.createElement('div');
                tagsWrap.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px;';
                conv.tags.slice(0, 5).forEach(tag => {
                    const t = document.createElement('span');
                    t.style.cssText = 'padding: 2px 8px; border-radius: 10px; font-size: 11px; background: #e0e7ff; color: #4338ca;';
                    t.textContent = tag;
                    tagsWrap.appendChild(t);
                });
                colBody.appendChild(tagsWrap);
            }
            if (conv.notes) {
                const notesEl = document.createElement('div');
                notesEl.style.cssText = 'font-size: 13px; color: #4b5563; line-height: 1.4;';
                notesEl.textContent = conv.notes.length > 120 ? conv.notes.slice(0, 120) + '...' : conv.notes;
                colBody.appendChild(notesEl);
            }
            const openBtn = document.createElement('button');
            openBtn.textContent = 'Abrir conversa';
            openBtn.style.cssText = `
                margin-top: auto;
                padding: 10px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
            `;
            openBtn.onclick = () => {
                const opened = openConversationInList(conv.id, conv.name);
                if (opened) onClose();
            };
            colBody.appendChild(openBtn);
            col.appendChild(colBody);
            scrollWrap.appendChild(col);
        }
    }

    overlay.appendChild(scrollWrap);
    overlay.onclick = (e) => {
        if (e.target === overlay) onClose();
    };
    scrollWrap.onclick = (e) => e.stopPropagation();

    return overlay;
}
