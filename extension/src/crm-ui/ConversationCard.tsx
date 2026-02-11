import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { Stage } from '../utils/storage';

interface ConversationCardProps {
    conversation: {
        id: string;
        name: string;
        tags: string[];
        notes: string;
        stage: Stage;
    };
    stageId: Stage;
    isDragging?: boolean;
}

function ConversationCard({ conversation, stageId, isDragging = false }: ConversationCardProps) {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
        id: conversation.id,
    });

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: stageId,
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    const truncateNotes = (notes: string, maxLength = 80) => {
        if (notes.length <= maxLength) return notes;
        return notes.substring(0, maxLength) + '...';
    };

    return (
        <div ref={setDroppableRef}>
            <div
                ref={setDraggableRef}
                className={`kanban-card ${isDragging ? 'dragging' : ''}`}
                style={style}
                {...listeners}
                {...attributes}
            >
                <div className="kanban-card-header">
                    <h4>{conversation.name}</h4>
                </div>

                {conversation.tags.length > 0 && (
                    <div className="kanban-card-tags">
                        {conversation.tags.map((tag) => (
                            <span key={tag} className="kanban-card-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {conversation.notes && (
                    <div className="kanban-card-notes">
                        {truncateNotes(conversation.notes)}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConversationCard;
