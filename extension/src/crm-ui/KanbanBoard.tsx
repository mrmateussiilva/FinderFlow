import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { listConversations, upsertConversation, type Stage } from '../utils/storage';
import ConversationCard from './ConversationCard';

interface ConversationWithId {
    id: string;
    name: string;
    tags: string[];
    notes: string;
    stage: Stage;
    lastUpdated: number;
}

const STAGES: { id: Stage; label: string }[] = [
    { id: 'novo', label: 'Novo' },
    { id: 'atendimento', label: 'Atendimento' },
    { id: 'proposta', label: 'Proposta' },
    { id: 'fechado', label: 'Fechado' },
];

function KanbanBoard() {
    const [conversations, setConversations] = useState<ConversationWithId[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Load conversations
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        const convs = await listConversations();
        setConversations(convs);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const conversationId = active.id as string;
        const newStage = over.id as Stage;

        // Update conversation stage
        await upsertConversation(conversationId, { stage: newStage });

        // Update local state
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === conversationId ? { ...conv, stage: newStage } : conv
            )
        );

        setActiveId(null);
    };

    const getConversationsByStage = (stage: Stage) => {
        return conversations.filter((conv) => conv.stage === stage);
    };

    const activeConversation = conversations.find((conv) => conv.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                {STAGES.map((stage) => (
                    <div key={stage.id} className="kanban-column">
                        <div className="kanban-column-header">
                            <h3>{stage.label}</h3>
                            <span className="kanban-column-count">
                                {getConversationsByStage(stage.id).length}
                            </span>
                        </div>
                        <div className="kanban-column-content" data-stage={stage.id}>
                            {getConversationsByStage(stage.id).map((conv) => (
                                <ConversationCard
                                    key={conv.id}
                                    conversation={conv}
                                    stageId={stage.id}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeId && activeConversation ? (
                    <ConversationCard
                        conversation={activeConversation}
                        stageId={activeConversation.stage}
                        isDragging
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default KanbanBoard;
