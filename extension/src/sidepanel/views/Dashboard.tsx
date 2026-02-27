import { useState, useEffect } from 'react';
import { listConversations, getTasks, type Stage } from '../../utils/storage';

const STAGE_LABELS: Record<Stage, string> = {
  novo: 'Novo Lead',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
};

const now = Date.now();
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);
const weekEnd = new Date(todayStart);
weekEnd.setDate(weekEnd.getDate() + 7);

export default function Dashboard() {
  const [byStage, setByStage] = useState<Record<Stage, number>>({
    novo: 0,
    qualificado: 0,
    proposta: 0,
    negociacao: 0,
    fechado: 0,
  });
  const [tasksToday, setTasksToday] = useState(0);
  const [tasksWeek, setTasksWeek] = useState(0);
  const [recentCount, setRecentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [convs, tasks] = await Promise.all([listConversations(), getTasks()]);
      if (cancelled) return;
      const stageCount: Record<Stage, number> = {
        novo: 0,
        qualificado: 0,
        proposta: 0,
        negociacao: 0,
        fechado: 0,
      };
      for (const c of convs) {
        stageCount[c.stage]++;
      }
      setByStage(stageCount);
      const pending = tasks.filter((t) => !t.done);
      const today = pending.filter((t) => t.dueDate >= todayStart.getTime() && t.dueDate <= todayEnd.getTime()).length;
      const week = pending.filter((t) => t.dueDate >= todayStart.getTime() && t.dueDate <= weekEnd.getTime()).length;
      setTasksToday(today);
      setTasksWeek(week);
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      setRecentCount(convs.filter((c) => c.lastUpdated >= oneWeekAgo).length);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Carregando...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {(Object.keys(STAGE_LABELS) as Stage[]).map((stage) => (
          <div
            key={stage}
            style={{
              padding: 12,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{STAGE_LABELS[stage]}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{byStage[stage]}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tarefas</div>
        <div style={{ fontSize: 13, color: '#374151' }}>
          Hoje: <strong>{tasksToday}</strong> · Esta semana: <strong>{tasksWeek}</strong>
        </div>
      </div>
      <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Contatos atualizados nos últimos 7 dias: <strong>{recentCount}</strong>
        </div>
      </div>
    </div>
  );
}
