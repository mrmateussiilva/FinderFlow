/**
 * Programmatic message sending on WhatsApp Web.
 * Inserts text into the compose input and triggers send (Enter or send button).
 * Used by quick replies, scheduled messages, and chatbot.
 */

const COMPOSE_SELECTOR = 'footer div[contenteditable="true"]';
const SEND_BUTTON_SELECTORS = ['[data-testid="send"]', '[data-icon="send"]'];

function getComposeInput(): HTMLElement | null {
    return document.querySelector(COMPOSE_SELECTOR) as HTMLElement | null;
}

/**
 * Insert text into WhatsApp's compose field (Lexical editor).
 * Does not send the message.
 */
export function insertTextIntoWhatsApp(text: string): boolean {
    const input = getComposeInput();
    if (!input) return false;

    input.focus();

    if (input.innerText.startsWith('/')) {
        document.execCommand('selectAll', false);
        document.execCommand('delete', false);
    }

    document.execCommand('insertText', false, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
}

/**
 * Trigger send: simulate Enter key and/or click the send button.
 */
function triggerSend(): boolean {
    const input = getComposeInput();
    if (!input) return false;

    input.focus();

    const keyEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
    });
    input.dispatchEvent(keyEvent);

    const sendBtn =
        document.querySelector(SEND_BUTTON_SELECTORS[0]) ||
        document.querySelector(SEND_BUTTON_SELECTORS[1]);
    if (sendBtn && typeof (sendBtn as HTMLElement).click === 'function') {
        (sendBtn as HTMLElement).click();
    }

    return true;
}

/**
 * Insert text and send the message in the current chat.
 * Returns true if both insert and send were attempted (best effort).
 */
export function sendMessage(text: string): boolean {
    if (!text.trim()) return false;
    const inserted = insertTextIntoWhatsApp(text.trim());
    if (!inserted) return false;
    return triggerSend();
}
