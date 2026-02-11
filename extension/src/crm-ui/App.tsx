import { useEffect } from 'react';
import { useCRMStore } from '../store/store';
import { getCurrentConversationId, getConversationName, isConversationOpen } from '../utils/dom';
import { getConversation } from '../utils/storage';
import Sidebar from './Sidebar';
import FloatingButton from './FloatingButton';
import KanbanModal from './KanbanModal';

function App() {
    const { currentConversationId, setCurrentConversation, isKanbanOpen, isSidebarOpen } = useCRMStore();

    useEffect(() => {
        console.log('App component mounted!');
        console.log('isKanbanOpen:', isKanbanOpen);
        console.log('isSidebarOpen:', isSidebarOpen);
    }, [isKanbanOpen, isSidebarOpen]);

    useEffect(() => {
        // Monitor for conversation changes
        const checkConversation = async () => {
            if (!isConversationOpen()) {
                setCurrentConversation(null, null);
                return;
            }

            const convId = getCurrentConversationId();
            const convName = getConversationName();

            if (convId && convId !== currentConversationId) {
                console.log('Conversation changed:', convId, convName);
                // Load conversation data from storage
                const data = await getConversation(convId);

                if (data) {
                    setCurrentConversation(convId, data);
                } else {
                    // New conversation, initialize with defaults
                    setCurrentConversation(convId, {
                        name: convName || 'Unknown',
                        tags: [],
                        notes: '',
                        stage: 'novo',
                        lastUpdated: Date.now(),
                    });
                }
            }
        };

        // Check immediately
        checkConversation();

        // Monitor DOM changes for conversation switches
        const observer = new MutationObserver(() => {
            checkConversation();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, [currentConversationId, setCurrentConversation]);

    console.log('App rendering. Sidebar open:', isSidebarOpen, 'Kanban open:', isKanbanOpen);

    return (
        <>
            {currentConversationId && isSidebarOpen && <Sidebar />}
            <FloatingButton />
            {isKanbanOpen && <KanbanModal />}
        </>
    );
}

export default App;
