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

export interface CRMData {
    conversations: {
        [conversationId: string]: ConversationData;
    };
    templates: Template[];
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
                templates: data.templates || []
            } as CRMData;
        }
        return { conversations: {}, templates: [] };
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
