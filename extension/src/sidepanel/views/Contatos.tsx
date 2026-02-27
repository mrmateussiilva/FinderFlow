import { useState, useEffect } from 'react';
import { listConversations, upsertConversation, type Stage, type ConversationData } from '../../utils/storage';
import { openWhatsAppTab } from '../openWhatsApp';

type ConversationWithId = ConversationData & { id: string };

const STAGE_LABELS: Record<Stage, string> = {
  novo: 'Novo Lead',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
};

export default function Contatos() {
  const [conversations, setConversations] = useState<ConversationWithId[]>([]);
  const [filterStage, setFilterStage] = useState<Stage | ''>('');
  const [filterTag, setFilterTag] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await listConversations();
    setConversations(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = conversations.filter((c) => {
    if (filterStage && c.stage !== filterStage) return false;
    if (filterTag && !c.tags.some((t) => t.toLowerCase().includes(filterTag.toLowerCase()))) return false;
    return true;
  });

  const selected = selectedId ? conversations.find((c) => c.id === selectedId) : null;

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage((e.target.value || '') as Stage | '')}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
        >
          <option value="">Todos os estágios</option>
          {(Object.keys(STAGE_LABELS) as Stage[]).map((s) => (
            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filtrar por tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', minWidth: 140 }}
        />
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Nenhum contato encontrado.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filtered.map((c) => (
            <li
              key={c.id}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                background: selectedId === c.id ? '#eef2ff' : undefined,
                borderRadius: 6,
                marginBottom: 4,
              }}
              onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
            >
              <strong>{c.name}</strong>
              {c.phone && <span style={{ marginLeft: 8, fontSize: 12, color: '#6b7280' }}>{c.phone}</span>}
              <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>{STAGE_LABELS[c.stage]}</span>
              {c.tags.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {c.tags.slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 11, background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>{selected.name}</h3>
          {selected.phone && <p style={{ margin: '0 0 8px', fontSize: 13 }}>Tel: {selected.phone}</p>}
          {selected.email && <p style={{ margin: '0 0 8px', fontSize: 13 }}>Email: {selected.email}</p>}
          {selected.company && <p style={{ margin: '0 0 8px', fontSize: 13 }}>Empresa: {selected.company}</p>}
          <p style={{ margin: '0 0 8px', fontSize: 13 }}>
            <strong>Estágio:</strong>{' '}
            <select
              value={selected.stage}
              onChange={async (e) => {
                const stage = e.target.value as Stage;
                await upsertConversation(selected.id, { stage });
                setConversations((prev) => prev.map((c) => (c.id === selected.id ? { ...c, stage } : c)));
                setSelectedId(null);
                setSelectedId(selected.id);
              }}
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb' }}
            >
              {(Object.keys(STAGE_LABELS) as Stage[]).map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
          </p>
          {selected.tags.length > 0 && (
            <p style={{ margin: '0 0 8px', fontSize: 13 }}>Tags: {selected.tags.join(', ')}</p>
          )}
          <p style={{ margin: '0 0 8px', fontSize: 13 }}>
            <strong>Valor (R$):</strong>{' '}
            <input
              type="number"
              min={0}
              step={0.01}
              value={selected.dealValue ?? ''}
              onChange={async (e) => {
                const v = e.target.value ? Number(e.target.value) : undefined;
                await upsertConversation(selected.id, { dealValue: v });
                setConversations((prev) => prev.map((c) => (c.id === selected.id ? { ...c, dealValue: v } : c)));
              }}
              placeholder="0,00"
              style={{ width: 80, padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb' }}
            />
          </p>
          <p style={{ margin: '0 0 8px', fontSize: 13 }}>
            <strong>Previsão fechamento:</strong>{' '}
            <input
              type="date"
              value={selected.expectedCloseDate ? new Date(selected.expectedCloseDate).toISOString().slice(0, 10) : ''}
              onChange={async (e) => {
                const v = e.target.value ? new Date(e.target.value).getTime() : undefined;
                await upsertConversation(selected.id, { expectedCloseDate: v });
                setConversations((prev) => prev.map((c) => (c.id === selected.id ? { ...c, expectedCloseDate: v } : c)));
              }}
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb' }}
            />
          </p>
          {selected.notes && (
            <p style={{ margin: '0 0 12px', fontSize: 13, whiteSpace: 'pre-wrap' }}>{selected.notes}</p>
          )}
          <button
            type="button"
            className="open-whatsapp-bar"
            style={{ marginTop: 8 }}
            onClick={() => openWhatsAppTab()}
          >
            Abrir WhatsApp
          </button>
        </div>
      )}
    </>
  );
}
