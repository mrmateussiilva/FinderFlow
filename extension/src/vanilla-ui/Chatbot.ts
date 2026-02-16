/**
 * Chatbot: matches incoming messages against rules and sends automatic replies.
 */
import { getBotEnabled, getBotRules, type BotRule } from '../utils/storage';
import { watchIncomingMessages } from '../utils/messageObserver';
import { sendMessage } from '../utils/sendMessage';

const BOT_REPLY_DELAY_MS = 800;

function matchRules(text: string, rules: BotRule[]): BotRule | null {
    const normalized = text.trim().toLowerCase();
    for (const rule of rules) {
        if (!rule.active) continue;
        if (rule.triggerType === 'exact') {
            if (normalized === rule.trigger.trim().toLowerCase()) return rule;
        } else {
            if (normalized.includes(rule.trigger.trim().toLowerCase())) return rule;
        }
    }
    return null;
}

let stopWatching: (() => void) | null = null;

/**
 * Start the chatbot: watch for incoming messages and reply when a rule matches.
 * Returns a stop function.
 */
export function startChatbot(): () => void {
    if (stopWatching) {
        stopWatching();
        stopWatching = null;
    }

    stopWatching = watchIncomingMessages(async (msg) => {
        const enabled = await getBotEnabled();
        if (!enabled) return;
        const rules = await getBotRules();
        const rule = matchRules(msg.text, rules);
        if (!rule) return;
        if (BOT_REPLY_DELAY_MS > 0) {
            await new Promise(r => setTimeout(r, BOT_REPLY_DELAY_MS));
        }
        sendMessage(rule.responseText);
    });

    return () => {
        stopWatching?.();
        stopWatching = null;
    };
}
