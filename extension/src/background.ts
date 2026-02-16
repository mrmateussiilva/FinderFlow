// Background service worker for Chrome extension
const STORAGE_KEY = 'crmData';
const ALARM_PREFIX = 'crm_sched_';

interface StoredCRMData {
    scheduledMessages?: Array<{ id: string; status: string; scheduledAt: number; conversationId: string; text: string }>;
}

console.log('WhatsApp CRM Extension - Background worker loaded');

chrome.runtime.onInstalled.addListener(() => {
    console.log('WhatsApp CRM Extension installed');
});

async function reschedulePendingAlarms() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY] as StoredCRMData | undefined;
    const list = data?.scheduledMessages ?? [];
    const now = Date.now();
    for (const m of list) {
        if (m.status === 'pending' && m.scheduledAt > now) {
            chrome.alarms.create(ALARM_PREFIX + m.id, { when: m.scheduledAt });
        }
    }
}

chrome.runtime.onStartup.addListener(reschedulePendingAlarms);
reschedulePendingAlarms();

chrome.runtime.onMessage.addListener((msg: { type: string; id?: string; scheduledAt?: number }, _sender, sendResponse) => {
    if (msg.type === 'createScheduleAlarm' && msg.id != null && msg.scheduledAt != null) {
        chrome.alarms.create(ALARM_PREFIX + msg.id, { when: msg.scheduledAt });
        sendResponse({ ok: true });
    }
    return true;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith(ALARM_PREFIX)) return;
    const id = alarm.name.slice(ALARM_PREFIX.length);
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY] as StoredCRMData | undefined;
    if (!data?.scheduledMessages) return;
    const scheduled = data.scheduledMessages.find((m) => m.id === id);
    if (!scheduled || scheduled.status !== 'pending') return;
    const conversationId = scheduled.conversationId;
    const text = scheduled.text;
    const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    if (tabs.length === 0) return;
    const tabId = tabs[0].id!;
    try {
        const response = await chrome.tabs.sendMessage(tabId, {
            type: 'sendScheduled',
            conversationId,
            text,
            id
        });
        if (response?.success) {
            const list = data.scheduledMessages.map((m) =>
                m.id === id ? { ...m, status: 'sent' } : m
            );
            await chrome.storage.local.set({ [STORAGE_KEY]: { ...data, scheduledMessages: list } });
        }
    } catch (e) {
        console.warn('Scheduled send failed:', e);
    }
});
