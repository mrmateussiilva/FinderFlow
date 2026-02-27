import {
    upsertConversation,
    type ConversationData,
    type Stage
} from '../utils/storage';

export function createSidebar(conversationId: string, data: ConversationData, onClose: () => void) {
    const sidebar = document.createElement('div');
    sidebar.className = 'crm-context-sidebar';

    const header = document.createElement('div');
    header.className = 'crm-context-header';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'crm-context-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = onClose;
    header.appendChild(closeBtn);

    const avatar = document.createElement('div');
    avatar.className = 'crm-context-avatar';
    const initials = data.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    avatar.textContent = initials;
    header.appendChild(avatar);

    const nameEl = document.createElement('div');
    nameEl.className = 'crm-context-name';
    nameEl.textContent = data.name;
    header.appendChild(nameEl);

    if (data.company) {
        const companyEl = document.createElement('div');
        companyEl.className = 'crm-context-company';
        companyEl.textContent = data.company;
        header.appendChild(companyEl);
    }

    const stageSelector = document.createElement('div');
    stageSelector.className = 'crm-context-stage-selector';

    const stageSelect = document.createElement('select');
    stageSelect.className = 'crm-select';
    const stages: Array<{ value: Stage, label: string }> = [
        { value: 'novo', label: 'Novo Lead' },
        { value: 'qualificado', label: 'Qualificado' },
        { value: 'proposta', label: 'Proposta' },
        { value: 'negociacao', label: 'Negociação' },
        { value: 'fechado', label: 'Fechado' }
    ];

    stages.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.label;
        if (data.stage === s.value) opt.selected = true;
        stageSelect.appendChild(opt);
    });

    stageSelect.onchange = async () => {
        await upsertConversation(conversationId, { stage: stageSelect.value as Stage });
    };
    stageSelector.appendChild(stageSelect);
    header.appendChild(stageSelector);

    const actions = document.createElement('div');
    actions.className = 'crm-context-actions';
    
    const noteBtn = document.createElement('button');
    noteBtn.className = 'crm-context-action-btn';
    noteBtn.innerHTML = '📝 <span>+ Nota</span>';
    actions.appendChild(noteBtn);

    const scheduleBtn = document.createElement('button');
    scheduleBtn.className = 'crm-context-action-btn';
    scheduleBtn.innerHTML = '📅 <span>Agendar</span>';
    actions.appendChild(scheduleBtn);

    const moveBtn = document.createElement('button');
    moveBtn.className = 'crm-context-action-btn';
    moveBtn.innerHTML = '➡️ <span>Mover</span>';
    actions.appendChild(moveBtn);

    header.appendChild(actions);
    sidebar.appendChild(header);

    const content = document.createElement('div');
    content.className = 'crm-context-content';

    const infoGrid = document.createElement('div');
    infoGrid.className = 'crm-context-info-grid';
    
    const dealValue = data.dealValue || Math.floor(Math.random() * 15000) + 1000;
    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(dealValue);
    
    infoGrid.innerHTML = `
        <div class="crm-context-info-item">
            <div class="crm-context-info-value">${formattedValue}</div>
            <div class="crm-context-info-label">Valor do Negócio</div>
        </div>
        <div class="crm-context-info-item">
            <div class="crm-context-info-value">${Math.floor(Math.random() * 10) + 1}</div>
            <div class="crm-context-info-label">Mensagens</div>
        </div>
        <div class="crm-context-info-item">
            <div class="crm-context-info-value warning">${Math.floor(Math.random() * 5) + 1}</div>
            <div class="crm-context-info-label">Dias sem resposta</div>
        </div>
        <div class="crm-context-info-item">
            <div class="crm-context-info-value success">${Math.floor(Math.random() * 30) + 1}</div>
            <div class="crm-context-info-label">Probabilidade %</div>
        </div>
    `;
    content.appendChild(infoGrid);

    const contactSection = document.createElement('div');
    contactSection.className = 'crm-context-section';
    contactSection.innerHTML = `
        <div class="crm-context-section-title">Informações de Contato</div>
    `;

    const createField = (label: string, value: string | undefined, fieldName: keyof ConversationData, placeholder: string) => {
        const field = document.createElement('div');
        field.className = 'crm-context-field';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'crm-context-field-label';
        labelEl.textContent = label;
        field.appendChild(labelEl);

        const input = document.createElement('input');
        input.className = 'crm-input';
        input.type = 'text';
        input.value = value || '';
        input.placeholder = placeholder;

        let timeout: any;
        input.oninput = () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                await upsertConversation(conversationId, { [fieldName]: input.value });
            }, 500);
        };

        const valueEl = document.createElement('div');
        valueEl.className = 'crm-context-field-value';
        valueEl.textContent = value || '-';
        valueEl.style.display = value ? 'block' : 'none';
        if (!value) input.style.display = 'block';

        field.appendChild(input);
        return field;
    };

    contactSection.appendChild(createField('E-mail', data.email, 'email', 'email@exemplo.com'));
    contactSection.appendChild(createField('Telefone', data.phone, 'phone', '(00) 00000-0000'));
    contactSection.appendChild(createField('Empresa', data.company, 'company', 'Nome da empresa'));
    content.appendChild(contactSection);

    const tagsSection = document.createElement('div');
    tagsSection.className = 'crm-context-section';
    tagsSection.innerHTML = `<div class="crm-context-section-title">Tags</div>`;

    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'crm-context-tags';

    const renderTags = () => {
        tagsContainer.innerHTML = '';
        data.tags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'crm-context-tag';
            tagEl.innerHTML = `${tag} <button class="crm-context-tag-remove">×</button>`;
            
            const removeBtn = tagEl.querySelector('.crm-context-tag-remove');
            removeBtn?.addEventListener('click', async () => {
                data.tags.splice(index, 1);
                await upsertConversation(conversationId, { tags: data.tags });
                renderTags();
            });

            tagsContainer.appendChild(tagEl);
        });

        const addTagBtn = document.createElement('button');
        addTagBtn.className = 'crm-context-tag-add';
        addTagBtn.textContent = '+ Adicionar';
        
        addTagBtn.onclick = () => {
            const newTag = prompt('Digite a nova tag:');
            if (newTag && !data.tags.includes(newTag)) {
                data.tags.push(newTag);
                upsertConversation(conversationId, { tags: data.tags });
                renderTags();
            }
        };

        tagsContainer.appendChild(addTagBtn);
    };
    renderTags();
    tagsSection.appendChild(tagsContainer);
    content.appendChild(tagsSection);

    const notesSection = document.createElement('div');
    notesSection.className = 'crm-context-section';
    notesSection.innerHTML = `<div class="crm-context-section-title">Notas</div>`;

    const notesArea = document.createElement('textarea');
    notesArea.className = 'crm-textarea';
    notesArea.value = data.notes || '';
    notesArea.placeholder = 'Escreva notas sobre o cliente...';

    let notesTimeout: any;
    notesArea.oninput = () => {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(async () => {
            await upsertConversation(conversationId, { notes: notesArea.value });
        }, 500);
    };

    notesSection.appendChild(notesArea);
    content.appendChild(notesSection);

    const actionsSection = document.createElement('div');
    actionsSection.className = 'crm-context-section';
    actionsSection.innerHTML = `<div class="crm-context-section-title">Ações Rápidas</div>`;

    const actionsGrid = document.createElement('div');
    actionsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px;';
    
    const quickActions = [
        { label: 'Criar Tarefa', icon: '✅' },
        { label: 'Enviar Proposta', icon: '📄' },
        { label: 'Ligar', icon: '📞' },
        { label: 'Enviar Email', icon: '✉️' }
    ];

    quickActions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'crm-context-action-btn';
        btn.innerHTML = `${action.icon} <span>${action.label}</span>`;
        actionsGrid.appendChild(btn);
    });

    actionsSection.appendChild(actionsGrid);
    content.appendChild(actionsSection);

    sidebar.appendChild(content);
    return sidebar;
}
