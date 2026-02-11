import { useState, useEffect } from 'react';
import { useCRMStore } from '../store/store';

function FloatingButton() {
    const { openKanban, toggleSidebar, currentConversationId } = useCRMStore();
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        console.log('FloatingButton mounted!');
        console.log('Current conversation ID:', currentConversationId);
    }, [currentConversationId]);

    const handleClick = () => {
        console.log('FloatingButton clicked!');
        if (currentConversationId) {
            // Se há conversa aberta, mostra menu
            setShowMenu(!showMenu);
        } else {
            // Se não há conversa, abre direto o Kanban
            openKanban();
        }
    };

    const handleSidebar = () => {
        toggleSidebar();
        setShowMenu(false);
    };

    const handleKanban = () => {
        openKanban();
        setShowMenu(false);
    };

    return (
        <div className="crm-floating-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998 }}>
            <button className="crm-floating-button" onClick={handleClick} style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
            }}>
                CRM
            </button>

            {showMenu && currentConversationId && (
                <div className="crm-floating-menu">
                    <button onClick={handleSidebar} className="crm-menu-item">
                        📋 Detalhes da Conversa
                    </button>
                    <button onClick={handleKanban} className="crm-menu-item">
                        📊 Kanban Geral
                    </button>
                </div>
            )}
        </div>
    );
}

export default FloatingButton;
