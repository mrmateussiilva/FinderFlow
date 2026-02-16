import { getTemplates } from '../utils/storage';

export { insertTextIntoWhatsApp } from '../utils/sendMessage';

/**
 * Creates a floating menu to select and insert quick replies
 */
export async function createQuickRepliesMenu(onSelect: (text: string) => void) {
    const templates = await getTemplates();

    if (templates.length === 0) return null;

    const menu = document.createElement('div');
    menu.className = 'crm-quick-replies-menu';
    menu.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
        padding: 8px;
        min-width: 200px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 4px;
    `;

    templates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'crm-quick-reply-item';
        item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 13px;
            transition: background 0.2s;
            display: flex;
            justify-content: space-between;
        `;

        const shortcut = document.createElement('span');
        shortcut.textContent = `/${template.shortcut}`;
        shortcut.style.fontWeight = 'bold';
        shortcut.style.color = '#764ba2';

        const text = document.createElement('span');
        text.textContent = template.text.slice(0, 20) + (template.text.length > 20 ? '...' : '');
        text.style.color = '#666';

        item.appendChild(shortcut);
        item.appendChild(text);

        item.onmouseenter = () => { item.style.background = '#f3f4f6'; };
        item.onmouseleave = () => { item.style.background = ''; };

        item.onclick = (e) => {
            e.stopPropagation();
            onSelect(template.text);
        };

        menu.appendChild(item);
    });

    return menu;
}

// insertTextIntoWhatsApp is exported from '../utils/sendMessage' above
