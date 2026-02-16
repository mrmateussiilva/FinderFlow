import {
    upsertConversation,
    getTemplates,
    upsertTemplate,
    deleteTemplate,
    getBotRules,
    upsertBotRule,
    deleteBotRule,
    getBotEnabled,
    setBotEnabled,
    getScheduledMessages,
    addScheduledMessage,
    cancelScheduledMessage,
    type ConversationData,
    type BotRule
} from '../utils/storage';
import { exportToJSON, exportToCSV, importFromJSON } from './DataManagement';

export function createSidebar(conversationId: string, data: ConversationData, onClose: () => void) {
    const sidebar = document.createElement('div');
    sidebar.className = 'crm-sidebar';

    // Header
    const header = document.createElement('div');
    header.className = 'crm-sidebar-header';
    const title = document.createElement('h3');
    title.textContent = data.name;
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'crm-sidebar-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = onClose;
    closeBtn.style.cssText = `
    position: absolute; top: 10px; right: 15px; background: none; border: none; 
    font-size: 24px; cursor: pointer; color: #666;
  `;
    header.appendChild(closeBtn);
    sidebar.appendChild(header);

    const content = document.createElement('div');
    content.className = 'crm-sidebar-content';

    // Stage Selector
    const stageField = document.createElement('div');
    stageField.className = 'crm-field';
    const stageLabel = document.createElement('label');
    stageLabel.textContent = 'Estágio';
    stageField.appendChild(stageLabel);

    const stageSelect = document.createElement('select');
    const stages = [
        { value: 'novo', label: 'Novo' },
        { value: 'atendimento', label: 'Atendimento' },
        { value: 'proposta', label: 'Proposta' },
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
        await upsertConversation(conversationId, { stage: stageSelect.value as any });
    };
    stageField.appendChild(stageSelect);
    content.appendChild(stageField);

    // Advanced CRM Fields
    const createInputField = (label: string, value: string | undefined, fieldName: keyof ConversationData) => {
        const field = document.createElement('div');
        field.className = 'crm-field';
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        field.appendChild(labelEl);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        input.placeholder = `Digitar ${label.toLowerCase()}...`;

        let timeout: any;
        input.oninput = () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                await upsertConversation(conversationId, { [fieldName]: input.value });
            }, 500);
        };

        field.appendChild(input);
        return field;
    };

    content.appendChild(createInputField('E-mail', data.email, 'email'));
    content.appendChild(createInputField('Telefone', data.phone, 'phone'));
    content.appendChild(createInputField('Empresa', data.company, 'company'));

    // Tags Section
    const tagsField = document.createElement('div');
    tagsField.className = 'crm-field';
    const tagsLabel = document.createElement('label');
    tagsLabel.textContent = 'Tags';
    tagsField.appendChild(tagsLabel);

    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'crm-tags-container';

    const renderTags = () => {
        tagsContainer.innerHTML = '';
        data.tags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'crm-tag';
            tagEl.textContent = tag;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'crm-tag-remove';
            removeBtn.textContent = '×';
            removeBtn.onclick = async () => {
                data.tags.splice(index, 1);
                await upsertConversation(conversationId, { tags: data.tags });
                renderTags();
            };

            tagEl.appendChild(removeBtn);
            tagsContainer.appendChild(tagEl);
        });
    };
    renderTags();
    tagsField.appendChild(tagsContainer);

    const tagInputContainer = document.createElement('div');
    tagInputContainer.className = 'crm-tag-input';
    const tagInput = document.createElement('input');
    tagInput.placeholder = 'Nova tag...';
    const addTagBtn = document.createElement('button');
    addTagBtn.textContent = '+';

    const handleAddTag = async () => {
        const val = tagInput.value.trim();
        if (val && !data.tags.includes(val)) {
            data.tags.push(val);
            await upsertConversation(conversationId, { tags: data.tags });
            tagInput.value = '';
            renderTags();
        }
    };

    addTagBtn.onclick = handleAddTag;
    tagInput.onkeypress = (e) => { if (e.key === 'Enter') handleAddTag(); };

    tagInputContainer.appendChild(tagInput);
    tagInputContainer.appendChild(addTagBtn);
    tagsField.appendChild(tagInputContainer);
    content.appendChild(tagsField);

    // Notes Section
    const notesField = document.createElement('div');
    notesField.className = 'crm-field';
    const notesLabel = document.createElement('label');
    notesLabel.textContent = 'Notas';
    notesField.appendChild(notesLabel);

    const notesArea = document.createElement('textarea');
    notesArea.value = data.notes;
    notesArea.placeholder = 'Escreva notas sobre o cliente...';

    // Debounced save for notes
    let timeout: any;
    notesArea.oninput = () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            await upsertConversation(conversationId, { notes: notesArea.value });
        }, 500);
    };

    notesField.appendChild(notesArea);
    content.appendChild(notesField);

    // Quick Replies Management Section
    const qrField = document.createElement('div');
    qrField.className = 'crm-field';
    const qrLabel = document.createElement('label');
    qrLabel.textContent = 'Respostas Rápidas (Templates)';
    qrField.appendChild(qrLabel);

    const qrListContainer = document.createElement('div');
    qrListContainer.className = 'crm-qr-list';
    qrListContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;';

    const renderQRList = async () => {
        qrListContainer.innerHTML = '';
        const templates = await getTemplates();
        templates.forEach(t => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; gap: 8px; background: #f9fafb; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb;';

            const info = document.createElement('div');
            info.style.flex = '1';
            info.innerHTML = `<div style="font-weight: 600; font-size: 12px; color: #764ba2;">/${t.shortcut}</div><div style="font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${t.text}</div>`;

            const delBtn = document.createElement('button');
            delBtn.textContent = '×';
            delBtn.style.cssText = 'background: none; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0 4px;';
            delBtn.onclick = async () => {
                await deleteTemplate(t.id);
                renderQRList();
            };

            item.appendChild(info);
            item.appendChild(delBtn);
            qrListContainer.appendChild(item);
        });
    };
    renderQRList();
    qrField.appendChild(qrListContainer);

    // Add Template Form
    const qrForm = document.createElement('div');
    qrForm.style.cssText = 'display: flex; flex-direction: column; gap: 6px; padding: 10px; background: #f3f4f6; border-radius: 8px;';

    const shortcutInput = document.createElement('input');
    shortcutInput.placeholder = 'Atalho (ex: vendas)';
    shortcutInput.style.fontSize = '12px';

    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Texto da mensagem...';
    textInput.style.cssText = 'font-size: 12px; height: 60px; resize: none;';

    const addQRBtn = document.createElement('button');
    addQRBtn.textContent = 'Salvar Template';
    addQRBtn.style.cssText = 'background: #764ba2; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;';

    addQRBtn.onclick = async () => {
        const shortcut = shortcutInput.value.trim().replace(/\//g, '');
        const text = textInput.value.trim();
        if (shortcut && text) {
            await upsertTemplate({
                id: Date.now().toString(),
                shortcut,
                text
            });
            shortcutInput.value = '';
            textInput.value = '';
            renderQRList();
        }
    };

    qrForm.appendChild(shortcutInput);
    qrForm.appendChild(textInput);
    qrForm.appendChild(addQRBtn);
    qrField.appendChild(qrForm);
    content.appendChild(qrField);

    // Chatbot Section
    const botField = document.createElement('div');
    botField.className = 'crm-field';
    botField.style.marginTop = '16px';
    botField.style.paddingTop = '12px';
    botField.style.borderTop = '1px solid #eee';
    const botLabel = document.createElement('label');
    botLabel.textContent = 'Chatbot (respostas automáticas)';
    botField.appendChild(botLabel);

    const botToggleWrap = document.createElement('div');
    botToggleWrap.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 10px;';
    const botToggle = document.createElement('input');
    botToggle.type = 'checkbox';
    botToggle.id = 'crm-bot-toggle';
    getBotEnabled().then(v => { botToggle.checked = v; });
    botToggle.onchange = () => setBotEnabled(botToggle.checked);
    const botToggleLabel = document.createElement('label');
    botToggleLabel.htmlFor = 'crm-bot-toggle';
    botToggleLabel.textContent = 'Chatbot ligado';
    botToggleLabel.style.fontSize = '13px';
    botToggleWrap.appendChild(botToggle);
    botToggleWrap.appendChild(botToggleLabel);
    botField.appendChild(botToggleWrap);

    const botListContainer = document.createElement('div');
    botListContainer.className = 'crm-bot-list';
    botListContainer.style.cssText = 'display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;';

    const renderBotList = async () => {
        botListContainer.innerHTML = '';
        const rules = await getBotRules();
        rules.forEach(r => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 6px; background: #f9fafb; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 12px;';
            const info = document.createElement('div');
            info.style.flex = '1';
            info.innerHTML = `<span style="font-weight: 600; color: #764ba2;">${r.triggerType === 'exact' ? '=' : '~'}</span> "${r.trigger}" → ${r.responseText.slice(0, 25)}${r.responseText.length > 25 ? '...' : ''} ${r.active ? '' : '<span style="color:#999">(off)</span>'}`;
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = r.active ? 'Desligar' : 'Ligar';
            toggleBtn.style.cssText = 'font-size: 10px; padding: 2px 6px; border: 1px solid #764ba2; background: white; color: #764ba2; border-radius: 4px; cursor: pointer;';
            toggleBtn.onclick = async () => {
                await upsertBotRule({ ...r, active: !r.active });
                renderBotList();
            };
            const delBtn = document.createElement('button');
            delBtn.textContent = '×';
            delBtn.style.cssText = 'background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 0 2px;';
            delBtn.onclick = async () => {
                await deleteBotRule(r.id);
                renderBotList();
            };
            row.appendChild(info);
            row.appendChild(toggleBtn);
            row.appendChild(delBtn);
            botListContainer.appendChild(row);
        });
    };
    renderBotList();
    botField.appendChild(botListContainer);

    const botForm = document.createElement('div');
    botForm.style.cssText = 'display: flex; flex-direction: column; gap: 6px; padding: 10px; background: #f3f4f6; border-radius: 8px;';
    const botTriggerType = document.createElement('select');
    botTriggerType.innerHTML = '<option value="keyword">Palavra-chave</option><option value="exact">Frase exata</option>';
    botTriggerType.style.fontSize = '12px';
    const botTriggerInput = document.createElement('input');
    botTriggerInput.placeholder = 'Palavra ou frase que ativa';
    botTriggerInput.style.fontSize = '12px';
    const botResponseInput = document.createElement('textarea');
    botResponseInput.placeholder = 'Resposta automática...';
    botResponseInput.style.cssText = 'font-size: 12px; height: 50px; resize: none;';
    const addBotBtn = document.createElement('button');
    addBotBtn.textContent = 'Adicionar regra';
    addBotBtn.style.cssText = 'background: #764ba2; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;';
    addBotBtn.onclick = async () => {
        const trigger = botTriggerInput.value.trim();
        const responseText = botResponseInput.value.trim();
        if (trigger && responseText) {
            await upsertBotRule({
                id: Date.now().toString(),
                triggerType: botTriggerType.value as BotRule['triggerType'],
                trigger,
                responseText,
                active: true
            });
            botTriggerInput.value = '';
            botResponseInput.value = '';
            renderBotList();
        }
    };
    botForm.appendChild(botTriggerType);
    botForm.appendChild(botTriggerInput);
    botForm.appendChild(botResponseInput);
    botForm.appendChild(addBotBtn);
    botField.appendChild(botForm);
    content.appendChild(botField);

    // Agendamentos Section
    const schedField = document.createElement('div');
    schedField.className = 'crm-field';
    schedField.style.marginTop = '16px';
    schedField.style.paddingTop = '12px';
    schedField.style.borderTop = '1px solid #eee';
    const schedLabel = document.createElement('label');
    schedLabel.textContent = 'Mensagens agendadas';
    schedField.appendChild(schedLabel);

    const schedListContainer = document.createElement('div');
    schedListContainer.className = 'crm-sched-list';
    schedListContainer.style.cssText = 'display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;';

    const renderSchedList = async () => {
        schedListContainer.innerHTML = '';
        const list = await getScheduledMessages();
        list.forEach(s => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 6px; background: #f9fafb; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 12px;';
            const dateStr = new Date(s.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
            const info = document.createElement('div');
            info.style.flex = '1';
            info.textContent = `${dateStr}: ${s.text.slice(0, 30)}${s.text.length > 30 ? '...' : ''}`;
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.style.cssText = 'font-size: 10px; padding: 2px 6px; border: 1px solid #ef4444; background: white; color: #ef4444; border-radius: 4px; cursor: pointer;';
            cancelBtn.onclick = async () => {
                await cancelScheduledMessage(s.id);
                renderSchedList();
            };
            row.appendChild(info);
            row.appendChild(cancelBtn);
            schedListContainer.appendChild(row);
        });
    };
    renderSchedList();
    schedField.appendChild(schedListContainer);

    const schedForm = document.createElement('div');
    schedForm.style.cssText = 'display: flex; flex-direction: column; gap: 6px; padding: 10px; background: #f3f4f6; border-radius: 8px;';
    const schedDateInput = document.createElement('input');
    schedDateInput.type = 'date';
    schedDateInput.style.fontSize = '12px';
    const schedTimeInput = document.createElement('input');
    schedTimeInput.type = 'time';
    schedTimeInput.style.fontSize = '12px';
    const schedTextInput = document.createElement('textarea');
    schedTextInput.placeholder = 'Texto da mensagem...';
    schedTextInput.style.cssText = 'font-size: 12px; height: 50px; resize: none;';
    const addSchedBtn = document.createElement('button');
    addSchedBtn.textContent = 'Agendar mensagem';
    addSchedBtn.style.cssText = 'background: #764ba2; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;';
    addSchedBtn.onclick = async () => {
        const dateVal = schedDateInput.value;
        const timeVal = schedTimeInput.value;
        const text = schedTextInput.value.trim();
        if (!dateVal || !timeVal || !text) return;
        const [y, m, d] = dateVal.split('-').map(Number);
        const [h, min] = timeVal.split(':').map(Number);
        const scheduledAt = new Date(y, m - 1, d, h, min).getTime();
        if (scheduledAt <= Date.now()) return;
        const id = Date.now().toString();
        await addScheduledMessage({
            id,
            conversationId,
            conversationName: data.name,
            text,
            scheduledAt
        });
        chrome.runtime.sendMessage({ type: 'createScheduleAlarm', id, scheduledAt }).catch(() => {});
        schedDateInput.value = '';
        schedTimeInput.value = '';
        schedTextInput.value = '';
        renderSchedList();
    };
    schedForm.appendChild(schedDateInput);
    schedForm.appendChild(schedTimeInput);
    schedForm.appendChild(schedTextInput);
    schedForm.appendChild(addSchedBtn);
    schedField.appendChild(schedForm);
    content.appendChild(schedField);

    // Data Management Section
    const dataField = document.createElement('div');
    dataField.className = 'crm-field';
    dataField.style.marginTop = '20px';
    dataField.style.paddingTop = '15px';
    dataField.style.borderTop = '1px solid #eee';

    const dataLabel = document.createElement('label');
    dataLabel.textContent = 'Backup e Dados';
    dataField.appendChild(dataLabel);

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;';

    const expJsonBtn = document.createElement('button');
    expJsonBtn.textContent = 'Exportar JSON';
    expJsonBtn.style.cssText = 'font-size: 11px; padding: 6px; border: 1px solid #764ba2; background: white; color: #764ba2; border-radius: 4px; cursor: pointer;';
    expJsonBtn.onclick = () => exportToJSON();

    const expCsvBtn = document.createElement('button');
    expCsvBtn.textContent = 'Baixar Leads (CSV)';
    expCsvBtn.style.cssText = 'font-size: 11px; padding: 6px; border: 1px solid #10b981; background: white; color: #10b981; border-radius: 4px; cursor: pointer;';
    expCsvBtn.onclick = () => exportToCSV();

    const impBtn = document.createElement('button');
    impBtn.textContent = 'Importar Backup';
    impBtn.style.cssText = 'grid-column: span 2; font-size: 11px; padding: 6px; border: 1px dashed #666; background: #f9fafb; color: #666; border-radius: 4px; cursor: pointer;';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const ok = await importFromJSON(file);
            if (ok) {
                alert('CRM atualizado com sucesso! Recarregue a página.');
                location.reload();
            } else {
                alert('Erro ao importar arquivo.');
            }
        }
    };

    impBtn.onclick = () => fileInput.click();

    btnContainer.appendChild(expJsonBtn);
    btnContainer.appendChild(expCsvBtn);
    btnContainer.appendChild(impBtn);
    dataField.appendChild(btnContainer);
    content.appendChild(dataField);

    sidebar.appendChild(content);
    return sidebar;
}
