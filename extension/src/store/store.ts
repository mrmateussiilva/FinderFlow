import { create } from 'zustand';
import type { ConversationData } from '../utils/storage';

interface CRMStore {
    currentConversationId: string | null;
    currentConversation: ConversationData | null;
    isKanbanOpen: boolean;
    isSidebarOpen: boolean;

    setCurrentConversation: (id: string | null, data: ConversationData | null) => void;
    updateCurrentConversation: (patch: Partial<ConversationData>) => void;
    toggleKanban: () => void;
    openKanban: () => void;
    closeKanban: () => void;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
    currentConversationId: null,
    currentConversation: null,
    isKanbanOpen: false,
    isSidebarOpen: false,

    setCurrentConversation: (id, data) =>
        set({ currentConversationId: id, currentConversation: data }),

    updateCurrentConversation: (patch) =>
        set((state) => ({
            currentConversation: state.currentConversation
                ? { ...state.currentConversation, ...patch }
                : null,
        })),

    toggleKanban: () => set((state) => ({ isKanbanOpen: !state.isKanbanOpen })),
    openKanban: () => set({ isKanbanOpen: true }),
    closeKanban: () => set({ isKanbanOpen: false }),

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    openSidebar: () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),
}));
