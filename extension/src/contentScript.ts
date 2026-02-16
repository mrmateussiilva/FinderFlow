import { styles } from './crm-ui/styles';
import { getCurrentConversationId, getConversationName, waitForWhatsAppReady } from './utils/dom';
import { getConversation } from './utils/storage';
import { createSidebar } from './vanilla-ui/Sidebar';
import { createKanbanModal } from './vanilla-ui/Kanban';
import { createConversationKanbanModal } from './vanilla-ui/ConversationKanban';
import { createQuickRepliesMenu, insertTextIntoWhatsApp } from './vanilla-ui/QuickReplies';
import { injectChatListBadges, injectFilterBar, applyChatListFilter } from './vanilla-ui/Injections';
import { startChatbot } from './vanilla-ui/Chatbot';
import { sendMessage } from './utils/sendMessage';

console.log('WhatsApp CRM - Content script loading...');

chrome.runtime.onMessage.addListener((msg: { type: string; conversationId?: string; text?: string }, _sender, sendResponse) => {
    if (msg.type === 'sendScheduled' && msg.conversationId != null && msg.text != null) {
        const current = getCurrentConversationId();
        if (current === msg.conversationId) {
            const ok = sendMessage(msg.text);
            sendResponse({ success: ok });
        } else {
            sendResponse({ success: false });
        }
    }
    return true;
});

let currentSidebar: HTMLElement | null = null;
let currentModal: HTMLElement | null = null;
let currentConversationKanban: HTMLElement | null = null;

function injectCRM() {
    try {
        console.log('Starting CRM UI injection...');

        if (!document.body) {
            console.error('CRITICAL: document.body not found! Retrying in 500ms...');
            setTimeout(injectCRM, 500);
            return;
        }

        // 1. Floating Button (Directly in body for visibility)
        // First, check if it already exists to avoid duplicates
        if (document.getElementById('crm-floating-button-native')) {
            console.log('Button already exists, skipping creation');
            return;
        }

        const floatingButton = document.createElement('button');
        floatingButton.id = 'crm-floating-button-native';
        floatingButton.textContent = 'CRM';
        floatingButton.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
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
      z-index: 9999;
      display: block !important;
      visibility: visible !important;
    `;
        document.body.appendChild(floatingButton);
        console.log('Floating button added to body successfully');

        // 2. Setup Host for Shadow DOM components
        const hostElement = document.createElement('div');
        hostElement.id = 'wa-crm-root';
        document.body.appendChild(hostElement);

        const shadowRoot = hostElement.attachShadow({ mode: 'open' });

        // Inject styles
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        shadowRoot.appendChild(styleElement);

        const appContainer = document.createElement('div');
        appContainer.id = 'crm-app-container';
        shadowRoot.appendChild(appContainer);
        console.log('Shadow DOM container ready');

        // 3. Setup Menu (Inside Shadow DOM)
        const menu = document.createElement('div');
        menu.className = 'crm-floating-menu';
        menu.style.cssText = `
      display: none;
      position: fixed;
      bottom: 100px;
      right: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      min-width: 220px;
      z-index: 10000;
    `;

        const sidebarBtn = document.createElement('button');
        sidebarBtn.className = 'crm-menu-item';
        sidebarBtn.textContent = '📋 Detalhes da Conversa';

        const kanbanBtn = document.createElement('button');
        kanbanBtn.className = 'crm-menu-item';
        kanbanBtn.textContent = '📊 Kanban por estágio';

        const conversationKanbanBtn = document.createElement('button');
        conversationKanbanBtn.className = 'crm-menu-item';
        conversationKanbanBtn.textContent = '📋 Kanban de conversas';

        menu.appendChild(sidebarBtn);
        menu.appendChild(kanbanBtn);
        menu.appendChild(conversationKanbanBtn);
        appContainer.appendChild(menu);

        // Handlers
        floatingButton.onclick = (e) => {
            e.stopPropagation();
            console.log('Floating button clicked');
            const conversationId = getCurrentConversationId();
            if (conversationId) {
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            } else {
                openKanban();
            }
        };

        document.onclick = () => {
            menu.style.display = 'none';
        };

        menu.onclick = (e) => e.stopPropagation();

        const openSidebar = async () => {
            try {
                console.log('Opening Sidebar...');
                menu.style.display = 'none';
                const convId = getCurrentConversationId();
                if (!convId) {
                    console.warn('No conversation open');
                    return;
                }

                if (currentSidebar) currentSidebar.remove();

                const convName = getConversationName() || 'Unknown';
                console.log('Fetching data for:', convId);
                let data = await getConversation(convId);

                if (!data) {
                    data = {
                        name: convName,
                        tags: [],
                        notes: '',
                        stage: 'novo',
                        lastUpdated: Date.now()
                    };
                }

                currentSidebar = createSidebar(convId, data, () => {
                    currentSidebar?.remove();
                    currentSidebar = null;
                });
                appContainer.appendChild(currentSidebar);
                console.log('Sidebar injected');
            } catch (err) {
                console.error('Error opening sidebar:', err);
            }
        };

        const openKanban = async () => {
            try {
                console.log('Opening Kanban...');
                menu.style.display = 'none';
                if (currentModal) currentModal.remove();

                currentModal = await createKanbanModal(() => {
                    currentModal?.remove();
                    currentModal = null;
                });
                appContainer.appendChild(currentModal);
                console.log('Kanban injected');
            } catch (err) {
                console.error('Error opening kanban:', err);
            }
        };

        const openConversationKanban = async () => {
            try {
                menu.style.display = 'none';
                if (currentConversationKanban) currentConversationKanban.remove();

                currentConversationKanban = await createConversationKanbanModal(() => {
                    currentConversationKanban?.remove();
                    currentConversationKanban = null;
                });
                appContainer.appendChild(currentConversationKanban);
            } catch (err) {
                console.error('Error opening conversation kanban:', err);
            }
        };

        sidebarBtn.onclick = openSidebar;
        kanbanBtn.onclick = openKanban;
        conversationKanbanBtn.onclick = openConversationKanban;

        // Auto-open sidebar when user opens or switches conversation (CRM integrado)
        let lastAutoOpenConvId: string | null = null;
        const tryAutoOpenSidebar = () => {
            const convId = getCurrentConversationId();
            if (convId && convId !== lastAutoOpenConvId) {
                lastAutoOpenConvId = convId;
                openSidebar();
            }
            if (!convId) lastAutoOpenConvId = null;
        };
        const conversationPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]');
        if (conversationPanel) {
            let autoOpenDebounce: ReturnType<typeof setTimeout> | null = null;
            const debouncedAutoOpen = () => {
                if (autoOpenDebounce) clearTimeout(autoOpenDebounce);
                autoOpenDebounce = setTimeout(tryAutoOpenSidebar, 300);
            };
            const autoOpenObserver = new MutationObserver(debouncedAutoOpen);
            autoOpenObserver.observe(conversationPanel, { childList: true, subtree: true });
            // Open immediately if a conversation is already visible (e.g. page load with chat open)
            setTimeout(tryAutoOpenSidebar, 800);
        }

        console.log('CRM UI fully injected and ready (Robust Vanilla)!');
    } catch (err) {
        console.error('CRITICAL ERROR in injectCRM:', err);
    }
}

// Start injection as soon as possible for the button
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded, starting injection...');
        injectCRM();
    });
} else {
    console.log('DOM already ready, starting injection...');
    injectCRM();
}

// Still wait for WhatsApp for logic parts if necessary, 
// but the button should be there regardless
waitForWhatsAppReady().then(() => {
    console.log('WhatsApp detection phase complete. Setting up Quick Replies observer...');

    let qrMenu: HTMLElement | null = null;

    // Monitor for the "/" command in the chat input
    // We use a global listener because the input field can be re-rendered
    document.addEventListener('keyup', async () => {
        const input = document.querySelector('footer div[contenteditable="true"]') as HTMLElement;
        if (!input || document.activeElement !== input) return;

        const text = input.innerText;
        if (text === '/') {
            if (qrMenu) qrMenu.remove();

            const menu = await createQuickRepliesMenu((selectedText) => {
                insertTextIntoWhatsApp(selectedText);
                if (qrMenu) qrMenu.remove();
                qrMenu = null;
            });

            if (menu) {
                qrMenu = menu;
                // Position the menu above the input
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.style.position = 'relative';
                    footer.appendChild(menu);
                }
            }
        } else if (qrMenu && !text.startsWith('/')) {
            qrMenu.remove();
            qrMenu = null;
        }
    });

    // Close menu on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qrMenu) {
            qrMenu.remove();
            qrMenu = null;
        }
    });

    // --- Deep UI Integration (Step 3) ---
    console.log('Starting Deep UI Integration phase...');

    // 1. Initial Badge Injection
    injectChatListBadges();

    // 2. Filter Bar Injection
    injectFilterBar((selectedStage) => {
        applyChatListFilter(selectedStage);
    });

    // 3. Observer for Chat List changes (Virtual Scrolling)
    // We observe the chat list container to re-inject badges when it changes
    const chatListObserver = new MutationObserver(() => {
        // Debounce or just call efficiently
        injectChatListBadges();
    });

    const chatList = document.querySelector('[data-testid="chat-list"]');
    if (chatList) {
        chatListObserver.observe(chatList, {
            childList: true,
            subtree: true
        });
        console.log('Chat list observer active');
    }

    console.log('Quick Replies engine ready!');

    startChatbot();
    console.log('Chatbot watcher started');
});
