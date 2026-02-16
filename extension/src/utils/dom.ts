/**
 * DOM utilities for WhatsApp Web detection and data extraction
 */

/**
 * Wait for WhatsApp Web to be fully loaded
 */
export function waitForWhatsAppReady(): Promise<void> {
    return new Promise((resolve) => {
        // Check if already loaded
        const checkReady = () => {
            const mainPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]');
            const chatList = document.querySelector('[data-testid="chat-list"]');

            if (mainPanel || chatList) {
                console.log('WhatsApp Web is ready');
                resolve();
                return true;
            }
            return false;
        };

        // Check immediately
        if (checkReady()) return;

        // Otherwise, observe DOM changes
        const observer = new MutationObserver(() => {
            if (checkReady()) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            observer.disconnect();
            console.warn('WhatsApp Web detection timeout');
            resolve();
        }, 30000);
    });
}

/**
 * Get the current conversation name from the header
 */
export function getConversationName(): string | null {
    // Try multiple selectors for conversation name
    const selectors = [
        '[data-testid="conversation-header"] span[dir="auto"]',
        'header span[dir="auto"]',
        '[data-testid="conversation-panel-wrapper"] header span',
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
            return element.textContent.trim();
        }
    }

    return null;
}

/**
 * Generate a stable conversation ID
 * Tries to extract from DOM attributes, falls back to hash-based ID
 */
export function getCurrentConversationId(): string | null {
    // Try to get from URL or data attributes
    const urlMatch = window.location.href.match(/whatsapp\.com\/([^/]+)/);
    if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
    }

    // Try to find conversation container with data-id
    const conversationPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]');
    if (conversationPanel) {
        const dataId = conversationPanel.getAttribute('data-id');
        if (dataId) return dataId;
    }

    // Fallback: generate hash from conversation name
    const name = getConversationName();
    if (name) {
        return `hash_${simpleHash(name)}`;
    }

    return null;
}

/**
 * Simple hash function for generating stable IDs
 */
export function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Get a stable conversation ID from a chat list row (cell-frame-container or list-item-container).
 * Tries data-id on the row or its ancestors, then falls back to hash of the visible name.
 * Use this so list badges and filters use the same ID as getCurrentConversationId() when the chat is open.
 */
export function getConversationIdFromListRow(chatListElement: Element): string | null {
    let el: Element | null = chatListElement;
    while (el) {
        const dataId = el.getAttribute?.('data-id');
        if (dataId) return dataId;
        el = el.parentElement;
    }
    const titleEl = chatListElement.querySelector('[data-testid="cell-frame-title"] span');
    const name = titleEl?.textContent?.trim();
    if (name) return `hash_${simpleHash(name)}`;
    return null;
}

/**
 * Check if a conversation is currently open
 */
export function isConversationOpen(): boolean {
    const conversationPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]');
    return !!conversationPanel;
}

/**
 * Find the chat list row for a conversation (by id or name) and click it to open that chat.
 */
export function openConversationInList(conversationId: string, conversationName?: string): boolean {
    const items = document.querySelectorAll('[data-testid="list-item-container"]');
    for (const item of items) {
        const rowId = getConversationIdFromListRow(item);
        if (rowId === conversationId) {
            (item as HTMLElement).click();
            return true;
        }
        if (conversationName) {
            const titleEl = item.querySelector('[data-testid="cell-frame-title"] span');
            const name = titleEl?.textContent?.trim();
            if (name === conversationName) {
                (item as HTMLElement).click();
                return true;
            }
        }
    }
    return false;
}
