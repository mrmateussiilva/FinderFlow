import { styles } from './crm-ui/styles';
import { getCurrentConversationId } from './utils/dom';

export function injectReactApp() {
    console.log('Starting CRM UI injection...');

    // Create host element
    const hostElement = document.createElement('div');
    hostElement.id = 'wa-crm-root';
    document.body.appendChild(hostElement);

    // Create shadow DOM for CSS isolation
    const shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Inject styles into shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    shadowRoot.appendChild(styleElement);

    // Create container inside shadow DOM
    const appContainer = document.createElement('div');
    appContainer.id = 'crm-app-container';
    shadowRoot.appendChild(appContainer);

    console.log('Shadow DOM created, injecting UI...');

    // Create floating button (always visible)
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'crm-floating-container';
    floatingContainer.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9998;';

    const floatingButton = document.createElement('button');
    floatingButton.className = 'crm-floating-button';
    floatingButton.textContent = 'CRM';
    floatingButton.style.cssText = `
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  `;

    floatingContainer.appendChild(floatingButton);
    appContainer.appendChild(floatingContainer);

    console.log('Floating button created and added to DOM');

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'crm-floating-menu';
    menu.style.display = 'none';
    menu.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    min-width: 220px;
    margin-bottom: 12px;
  `;

    const sidebarBtn = document.createElement('button');
    sidebarBtn.className = 'crm-menu-item';
    sidebarBtn.textContent = '📋 Detalhes da Conversa';
    sidebarBtn.style.cssText = `
    width: 100%;
    padding: 14px 18px;
    background: white;
    border: none;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;
    border-bottom: 1px solid #f3f4f6;
  `;

    const kanbanBtn = document.createElement('button');
    kanbanBtn.className = 'crm-menu-item';
    kanbanBtn.textContent = '📊 Kanban Geral';
    kanbanBtn.style.cssText = `
    width: 100%;
    padding: 14px 18px;
    background: white;
    border: none;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;
  `;

    menu.appendChild(sidebarBtn);
    menu.appendChild(kanbanBtn);
    floatingContainer.insertBefore(menu, floatingButton);

    // Button click handler
    floatingButton.addEventListener('click', () => {
        console.log('Floating button clicked!');
        const conversationId = getCurrentConversationId();

        if (conversationId) {
            // Toggle menu
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        } else {
            // Open Kanban directly
            alert('Kanban feature coming soon!');
        }
    });

    // Menu item handlers
    sidebarBtn.addEventListener('click', () => {
        console.log('Sidebar button clicked!');
        menu.style.display = 'none';
        alert('Sidebar feature coming soon!');
    });

    kanbanBtn.addEventListener('click', () => {
        console.log('Kanban button clicked!');
        menu.style.display = 'none';
        alert('Kanban feature coming soon!');
    });

    console.log('CRM UI fully injected and ready!');
}
