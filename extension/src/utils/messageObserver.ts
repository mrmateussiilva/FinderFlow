/**
 * Observes the WhatsApp Web conversation panel for new incoming messages.
 * Used by the chatbot to trigger automatic replies.
 */

export interface IncomingMessage {
    text: string;
    detectedAt: number;
}

const MESSAGES_CONTAINER_SELECTORS = [
    '[data-testid="conversation-panel-messages"]',
    '#main div[role="application"]',
    '[data-testid="conversation-panel-wrapper"] div[role="application"]',
];

function getMessagesContainer(): Element | null {
    for (const sel of MESSAGES_CONTAINER_SELECTORS) {
        const el = document.querySelector(sel);
        if (el) return el;
    }
    const wrapper = document.querySelector('[data-testid="conversation-panel-wrapper"]');
    return wrapper?.querySelector('div[style*="overflow"]') ?? wrapper ?? null;
}

function getTextFromElement(el: Element): string {
    const pre = el.querySelector?.('[data-pre-plain-text]') ?? el;
    const attr = (pre as HTMLElement).getAttribute?.('data-pre-plain-text');
    if (attr) {
        const m = attr.match(/^[^:]*:\s*(.*)$/s);
        return (m ? m[1] : attr).trim();
    }
    return (el.textContent ?? '').trim();
}

/** Incoming messages typically have "message-in" or are not "message-out". */
function isIncomingMessage(el: Element): boolean {
    const root = el.closest?.('.copyable-area') ?? el;
    const cls = (root.getAttribute?.('class') ?? '').toLowerCase();
    if (cls.includes('message-out')) return false;
    if (cls.includes('message-in')) return true;
    const parent = root.parentElement?.closest?.('[class*="message"]');
    const parentCls = (parent?.getAttribute?.('class') ?? '').toLowerCase();
    if (parentCls.includes('message-out')) return false;
    if (parentCls.includes('message-in')) return true;
    return true;
}

/**
 * Start watching for new incoming messages and call onMessage for each.
 * Returns a stop function.
 */
export function watchIncomingMessages(onMessage: (msg: IncomingMessage) => void): () => void {
    let lastSeen = '';
    const seen = new WeakSet<Element>();

    const processMessage = (el: Element) => {
        if (seen.has(el)) return;
        if (!isIncomingMessage(el)) return;
        const text = getTextFromElement(el);
        if (!text || text === lastSeen) return;
        seen.add(el);
        lastSeen = text;
        onMessage({ text, detectedAt: Date.now() });
    };

    const scanContainer = (container: Element) => {
        const areas = container.querySelectorAll('.copyable-area');
        areas.forEach(area => processMessage(area));
    };

    const attach = (container: Element) => {
        scanContainer(container);
        const obs = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    const el = node as Element;
                    if (el.classList?.contains('copyable-area')) processMessage(el);
                    el.querySelectorAll?.('.copyable-area').forEach(processMessage);
                });
            }
            scanContainer(container);
        });
        obs.observe(container, { childList: true, subtree: true });
        return () => obs.disconnect();
    };

    const container = getMessagesContainer();
    if (container) return attach(container);

    let stop: (() => void) | null = null;
    const interval = setInterval(() => {
        const c = getMessagesContainer();
        if (c) {
            clearInterval(interval);
            stop = attach(c);
        }
    }, 1500);
    return () => {
        clearInterval(interval);
        stop?.();
    };
}
