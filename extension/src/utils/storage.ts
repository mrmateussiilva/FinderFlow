/**
 * Chrome storage wrapper for CRM data persistence
 */

export type Stage = 'novo' | 'atendimento' | 'proposta' | 'fechado';

export interface ConversationData {
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    tags: string[];
    notes: string;
    stage: Stage;
    lastUpdated: number;
}

export interface Template {
    id: string;
    shortcut: string;
    text: string;
}

export type ScheduledMessageStatus = 'pending' | 'sent' | 'cancelled';

export interface ScheduledMessage {
    id: string;
    conversationId: string;
    conversationName?: string;
    text: string;
    scheduledAt: number;
    status: ScheduledMessageStatus;
    createdAt: number;
}

export type BotRuleTriggerType = 'keyword' | 'exact';

export interface BotRule {
    id: string;
    triggerType: BotRuleTriggerType;
    trigger: string;
    responseText: string;
    active: boolean;
}

export interface CRMData {
    conversations: {
        [conversationId: string]: ConversationData;
    };
    templates: Template[];
    botRules?: BotRule[];
    botEnabled?: boolean;
    scheduledMessages?: ScheduledMessage[];
}

const STORAGE_KEY = 'crmData';

/**
 * Get all CRM data from storage
 */
export async function getCRMData(): Promise<CRMData> {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const data = result[STORAGE_KEY] as any;
        if (data && typeof data === 'object' && 'conversations' in data) {
            return {
                conversations: data.conversations || {},
                templates: data.templates || [],
                botRules: data.botRules ?? [],
                botEnabled: data.botEnabled ?? false,
                scheduledMessages: data.scheduledMessages ?? []
            } as CRMData;
        }
        return { conversations: {}, templates: [], botRules: [], botEnabled: false, scheduledMessages: [] };
    } catch (error) {
        console.error('Error getting CRM data:', error);
        return { conversations: {}, templates: [] };
    }
}

/**
 * Get data for a specific conversation
 */
export async function getConversation(conversationId: string): Promise<ConversationData | null> {
    const data = await getCRMData();
    return data.conversations[conversationId] || null;
}

/**
 * Update or insert conversation data
 */
export async function upsertConversation(
    conversationId: string,
    patch: Partial<ConversationData>
): Promise<void> {
    try {
        const data = await getCRMData();

        const existing = data.conversations[conversationId] || {
            name: '',
            phone: '',
            email: '',
            company: '',
            tags: [],
            notes: '',
            stage: 'novo' as Stage,
            lastUpdated: Date.now(),
        };

        data.conversations[conversationId] = {
            ...existing,
            ...patch,
            lastUpdated: Date.now(),
        };

        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (error) {
        console.error('Error upserting conversation:', error);
    }
}

/**
 * List all conversations
 */
export async function listConversations(): Promise<Array<ConversationData & { id: string }>> {
    const data = await getCRMData();
    return Object.entries(data.conversations).map(([id, conv]) => ({
        id,
        ...conv,
    }));
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
    try {
        const data = await getCRMData();
        delete data.conversations[conversationId];
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (error) {
        console.error('Error deleting conversation:', error);
    }
}
/**
 * Get all templates
 */
export async function getTemplates(): Promise<Template[]> {
    const data = await getCRMData();
    return data.templates;
}

/**
 * Add or update a template
 */
export async function upsertTemplate(template: Template): Promise<void> {
    try {
        const data = await getCRMData();
        const index = data.templates.findIndex(t => t.id === template.id);

        if (index > -1) {
            data.templates[index] = template;
        } else {
            data.templates.push(template);
        }

        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (error) {
        console.error('Error upserting template:', error);
    }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
    try {
        const data = await getCRMData();
        data.templates = data.templates.filter(t => t.id !== templateId);
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (error) {
        console.error('Error deleting template:', error);
    }
}

/** Bot: get all rules */
export async function getBotRules(): Promise<BotRule[]> {
    const data = await getCRMData();
    return data.botRules ?? [];
}

/** Bot: add or update a rule */
export async function upsertBotRule(rule: BotRule): Promise<void> {
    try {
        const data = await getCRMData();
        const rules = data.botRules ?? [];
        const idx = rules.findIndex(r => r.id === rule.id);
        if (idx >= 0) rules[idx] = rule;
        else rules.push(rule);
        data.botRules = rules;
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (e) {
        console.error('Error upserting bot rule:', e);
    }
}

/** Bot: delete a rule */
export async function deleteBotRule(ruleId: string): Promise<void> {
    try {
        const data = await getCRMData();
        data.botRules = (data.botRules ?? []).filter(r => r.id !== ruleId);
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (e) {
        console.error('Error deleting bot rule:', e);
    }
}

/** Bot: global on/off */
export async function getBotEnabled(): Promise<boolean> {
    const data = await getCRMData();
    return data.botEnabled ?? false;
}

export async function setBotEnabled(enabled: boolean): Promise<void> {
    try {
        const data = await getCRMData();
        data.botEnabled = enabled;
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (e) {
        console.error('Error setting bot enabled:', e);
    }
}

/** Scheduled messages */
export async function getScheduledMessages(): Promise<ScheduledMessage[]> {
    const data = await getCRMData();
    return (data.scheduledMessages ?? []).filter(m => m.status === 'pending').sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export async function getAllScheduledMessages(): Promise<ScheduledMessage[]> {
    const data = await getCRMData();
    return data.scheduledMessages ?? [];
}

export async function addScheduledMessage(msg: Omit<ScheduledMessage, 'status' | 'createdAt'>): Promise<void> {
    try {
        const data = await getCRMData();
        const list = data.scheduledMessages ?? [];
        const created: ScheduledMessage = {
            ...msg,
            status: 'pending',
            createdAt: Date.now()
        };
        list.push(created);
        data.scheduledMessages = list;
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (e) {
        console.error('Error adding scheduled message:', e);
    }
}

export async function updateScheduledMessageStatus(id: string, status: ScheduledMessageStatus): Promise<void> {
    try {
        const data = await getCRMData();
        const list = data.scheduledMessages ?? [];
        const idx = list.findIndex(m => m.id === id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], status };
            data.scheduledMessages = list;
            await chrome.storage.local.set({ [STORAGE_KEY]: data });
        }
    } catch (e) {
        console.error('Error updating scheduled message:', e);
    }
}

export async function cancelScheduledMessage(id: string): Promise<void> {
    await updateScheduledMessageStatus(id, 'cancelled');
}
