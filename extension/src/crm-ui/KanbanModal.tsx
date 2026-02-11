import { useCRMStore } from '../store/store';
import KanbanBoard from './KanbanBoard';

function KanbanModal() {
    const { closeKanban } = useCRMStore();

    return (
        <div className="crm-modal-overlay" onClick={closeKanban}>
            <div className="crm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="crm-modal-header">
                    <h2>CRM Kanban</h2>
                    <button className="crm-modal-close" onClick={closeKanban}>
                        ×
                    </button>
                </div>
                <KanbanBoard />
            </div>
        </div>
    );
}

export default KanbanModal;
