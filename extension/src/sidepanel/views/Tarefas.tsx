import { useState, useEffect } from 'react';
import { getTasks, upsertTask, deleteTask, listConversations, type Task } from '../../utils/storage';

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conversations, setConversations] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newConvId, setNewConvId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [t, convs] = await Promise.all([getTasks(), listConversations()]);
    setTasks(t);
    setConversations(convs.map((c) => ({ id: c.id, name: c.name })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const due = newDue ? new Date(newDue).getTime() : Date.now() + 24 * 60 * 60 * 1000;
    const task: Task = {
      id: generateId(),
      title: newTitle.trim(),
      dueDate: due,
      done: false,
      createdAt: Date.now(),
      conversationId: newConvId || undefined,
    };
    await upsertTask(task);
    setTasks((prev) => [...prev, task].sort((a, b) => a.dueDate - b.dueDate));
    setNewTitle('');
    setNewDue('');
    setNewConvId('');
    setShowForm(false);
  };

  const handleToggle = async (t: Task) => {
    const updated = { ...t, done: !t.done };
    await upsertTask(updated);
    setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dStart = new Date(d);
    dStart.setHours(0, 0, 0, 0);
    if (dStart.getTime() === today.getTime()) return 'Hoje';
    if (dStart.getTime() < today.getTime()) return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' (atrasada)';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getConvName = (convId: string) => conversations.find((c) => c.id === convId)?.name ?? convId;

  if (loading) return <p style={{ color: '#6b7280' }}>Carregando...</p>;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: 12,
          padding: '8px 14px',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {showForm ? 'Cancelar' : '+ Nova tarefa'}
      </button>

      {showForm && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="Título da tarefa"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', marginBottom: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <input
            type="date"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', marginBottom: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <select
            value={newConvId}
            onChange={(e) => setNewConvId(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', marginBottom: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
          >
            <option value="">Sem contato</option>
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="button" onClick={handleAdd} style={{ padding: '8px 14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Adicionar
          </button>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Pendentes</h4>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {pending.map((t) => (
            <li
              key={t.id}
              style={{
                padding: '10px 12px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <input type="checkbox" checked={false} onChange={() => handleToggle(t)} />
              <span style={{ flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(t.dueDate)}</span>
              {t.conversationId && <span style={{ fontSize: 11, color: '#9ca3af' }}>{getConvName(t.conversationId)}</span>}
              <button type="button" onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12 }}>Excluir</button>
            </li>
          ))}
        </ul>
        {pending.length === 0 && <p style={{ fontSize: 13, color: '#9ca3af' }}>Nenhuma tarefa pendente.</p>}
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Concluídas</h4>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {done.slice(0, 20).map((t) => (
            <li
              key={t.id}
              style={{
                padding: '8px 12px',
                background: '#f9fafb',
                borderRadius: 6,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: 0.85,
              }}
            >
              <input type="checkbox" checked onChange={() => handleToggle(t)} />
              <span style={{ flex: 1, textDecoration: 'line-through', fontSize: 13 }}>{t.title}</span>
              <button type="button" onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 11 }}>Excluir</button>
            </li>
          ))}
        </ul>
        {done.length > 20 && <p style={{ fontSize: 12, color: '#9ca3af' }}>+ {done.length - 20} mais</p>}
      </div>
    </>
  );
}
