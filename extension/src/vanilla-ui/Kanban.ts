import { listConversations, upsertConversation } from '../utils/storage';
import type { ConversationData } from '../utils/storage';

const STAGES = [
    { id: 'novo', title: 'Novo' },
    { id: 'atendimento', title: 'Atendimento' },
    { id: 'proposta', title: 'Proposta' },
    { id: 'fechado', title: 'Fechado' }
] as const;

function buildCard(conv: ConversationData & { id: string }, colContent: HTMLElement) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;

    card.ondragstart = (e) => {
        e.dataTransfer?.setData('text/plain', conv.id);
        card.classList.add('dragging');
    };

    card.ondragend = () => {
        card.classList.remove('dragging');
    };

    const cardHeader = document.createElement('div');
    cardHeader.className = 'kanban-card-header';
    const cardTitle = document.createElement('h4');
    cardTitle.textContent = conv.name;
    cardHeader.appendChild(cardTitle);
    card.appendChild(cardHeader);

    if (conv.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'kanban-card-tags';
        conv.tags.slice(0, 3).forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'kanban-card-tag';
            tagSpan.textContent = tag;
            tagsDiv.appendChild(tagSpan);
        });
        card.appendChild(tagsDiv);
    }

    if (conv.notes) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'kanban-card-notes';
        notesDiv.textContent = conv.notes.slice(0, 60) + (conv.notes.length > 60 ? '...' : '');
        card.appendChild(notesDiv);
    }

    colContent.appendChild(card);
}

async function renderBoard(board: HTMLElement) {
    board.innerHTML = '';
    const conversations = await listConversations();

    STAGES.forEach(stage => {
        const column = document.createElement('div');
        column.className = 'kanban-column';
        column.dataset.id = stage.id;

        const colHeader = document.createElement('div');
        colHeader.className = 'kanban-column-header';
        const colTitle = document.createElement('h3');
        colTitle.textContent = stage.title;
        colHeader.appendChild(colTitle);

        const count = document.createElement('span');
        count.className = 'kanban-column-count';
        const stageConvs = conversations.filter(c => c.stage === stage.id);
        count.textContent = stageConvs.length.toString();
        colHeader.appendChild(count);
        column.appendChild(colHeader);

        const colContent = document.createElement('div');
        colContent.className = 'kanban-column-content';

        colContent.ondragover = (e) => {
            e.preventDefault();
            colContent.style.background = 'rgba(102, 126, 234, 0.1)';
        };

        colContent.ondragleave = () => {
            colContent.style.background = '';
        };

        colContent.ondrop = async (e) => {
            e.preventDefault();
            colContent.style.background = '';
            const convId = e.dataTransfer?.getData('text/plain');
            if (convId) {
                await upsertConversation(convId, { stage: stage.id });
                await renderBoard(board);
            }
        };

        stageConvs.forEach(conv => buildCard(conv, colContent));
        column.appendChild(colContent);
        board.appendChild(column);
    });
}

export async function createKanbanModal(onClose: () => void) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'crm-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'crm-modal-content';

    const header = document.createElement('div');
    header.className = 'crm-modal-header';
    const title = document.createElement('h2');
    title.textContent = 'Pipeline de Vendas (Kanban)';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'crm-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = onClose;
    header.appendChild(closeBtn);
    modalContent.appendChild(header);

    const board = document.createElement('div');
    board.className = 'kanban-board';
    await renderBoard(board);
    modalContent.appendChild(board);
    modalOverlay.appendChild(modalContent);

    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) onClose();
    };

    return modalOverlay;
}
