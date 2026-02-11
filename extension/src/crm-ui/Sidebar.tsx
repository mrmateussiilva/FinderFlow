import { useState, useEffect, useCallback } from 'react';
import { useCRMStore } from '../store/store';
import { upsertConversation } from '../utils/storage';
import type { Stage } from '../utils/storage';

function Sidebar() {
    const { currentConversationId, currentConversation, updateCurrentConversation } = useCRMStore();

    const [stage, setStage] = useState<Stage>('novo');
    const [tags, setTags] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [newTag, setNewTag] = useState('');
    const [saveTimeout, setSaveTimeout] = useState<number | null>(null);

    // Load current conversation data
    useEffect(() => {
        if (currentConversation) {
            setStage(currentConversation.stage);
            setTags(currentConversation.tags);
            setNotes(currentConversation.notes);
        }
    }, [currentConversation]);

    // Debounced save function
    const saveData = useCallback(
        (field: string, value: any) => {
            if (!currentConversationId) return;

            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }

            const timeout = setTimeout(async () => {
                const patch = { [field]: value };
                await upsertConversation(currentConversationId, patch);
                updateCurrentConversation(patch);
            }, 500);

            setSaveTimeout(timeout);
        },
        [currentConversationId, saveTimeout, updateCurrentConversation]
    );

    const handleStageChange = (newStage: Stage) => {
        setStage(newStage);
        saveData('stage', newStage);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];
            setTags(updatedTags);
            setNewTag('');
            saveData('tags', updatedTags);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = tags.filter((t) => t !== tagToRemove);
        setTags(updatedTags);
        saveData('tags', updatedTags);
    };

    const handleNotesChange = (value: string) => {
        setNotes(value);
        saveData('notes', value);
    };

    return (
        <div className="crm-sidebar">
            <div className="crm-sidebar-header">
                <h3>CRM</h3>
            </div>

            <div className="crm-sidebar-content">
                {/* Stage Selector */}
                <div className="crm-field">
                    <label>Stage</label>
                    <select value={stage} onChange={(e) => handleStageChange(e.target.value as Stage)}>
                        <option value="novo">Novo lead</option>
                        <option value="atendimento">Em atendimento</option>
                        <option value="proposta">Proposta enviada</option>
                        <option value="fechado">Fechado</option>
                    </select>
                </div>

                {/* Tags */}
                <div className="crm-field">
                    <label>Tags</label>
                    <div className="crm-tags-container">
                        {tags.map((tag) => (
                            <span key={tag} className="crm-tag">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="crm-tag-remove">
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="crm-tag-input">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            placeholder="Add tag..."
                        />
                        <button onClick={handleAddTag}>+</button>
                    </div>
                </div>

                {/* Notes */}
                <div className="crm-field">
                    <label>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Add notes about this conversation..."
                        rows={8}
                    />
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
