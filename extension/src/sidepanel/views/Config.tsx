import { useState, useEffect } from 'react';
import {
  getTemplates,
  upsertTemplate,
  deleteTemplate,
  getBotRules,
  upsertBotRule,
  deleteBotRule,
  getBotEnabled,
  setBotEnabled,
  type Template,
  type BotRule,
} from '../../utils/storage';
import { exportToJSON, exportToCSV, importFromJSON } from '../../vanilla-ui/DataManagement';

function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function Config() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [botRules, setBotRules] = useState<BotRule[]>([]);
  const [botOn, setBotOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const load = async () => {
    const [t, rules, on] = await Promise.all([getTemplates(), getBotRules(), getBotEnabled()]);
    setTemplates(t);
    setBotRules(rules);
    setBotOn(on);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddTemplate = async () => {
    const shortcut = prompt('Atalho (ex: /oi):');
    if (!shortcut?.trim()) return;
    const text = prompt('Texto do template:');
    if (text == null) return;
    const template: Template = { id: generateId(), shortcut: shortcut.trim(), text };
    await upsertTemplate(template);
    setTemplates((prev) => [...prev, template]);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Remover este template?')) return;
    await deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBotToggle = async () => {
    await setBotEnabled(!botOn);
    setBotOn(!botOn);
  };

  const handleAddBotRule = async () => {
    const trigger = prompt('Palavra ou frase que ativa:');
    if (!trigger?.trim()) return;
    const response = prompt('Resposta do bot:');
    if (response == null) return;
    const rule: BotRule = {
      id: generateId(),
      triggerType: 'keyword',
      trigger: trigger.trim(),
      responseText: response,
      active: true,
    };
    await upsertBotRule(rule);
    setBotRules((prev) => [...prev, rule]);
  };

  const handleDeleteBotRule = async (id: string) => {
    if (!confirm('Remover esta regra?')) return;
    await deleteBotRule(id);
    setBotRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importFromJSON(file).then((ok) => {
      setImportStatus(ok ? 'ok' : 'err');
      if (ok) load();
      e.target.value = '';
    });
  };

  if (loading) return <p style={{ color: '#6b7280' }}>Carregando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Templates</h4>
        <button
          type="button"
          onClick={handleAddTemplate}
          style={{ marginBottom: 8, padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
        >
          + Novo template
        </button>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {templates.map((t) => (
            <li key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>{t.shortcut}</strong> → {t.text.slice(0, 40)}{t.text.length > 40 ? '…' : ''}</span>
              <button type="button" onClick={() => handleDeleteTemplate(t.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12 }}>Excluir</button>
            </li>
          ))}
        </ul>
        {templates.length === 0 && <p style={{ fontSize: 13, color: '#9ca3af' }}>Nenhum template.</p>}
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Bot de respostas</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input type="checkbox" checked={botOn} onChange={handleBotToggle} />
          <span>Ativar bot</span>
        </label>
        <button
          type="button"
          onClick={handleAddBotRule}
          style={{ marginBottom: 8, padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
        >
          + Nova regra
        </button>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {botRules.map((r) => (
            <li key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>"{r.trigger}" → {r.responseText.slice(0, 30)}{r.responseText.length > 30 ? '…' : ''}</span>
              <button type="button" onClick={() => handleDeleteBotRule(r.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12 }}>Excluir</button>
            </li>
          ))}
        </ul>
        {botRules.length === 0 && <p style={{ fontSize: 13, color: '#9ca3af' }}>Nenhuma regra.</p>}
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Exportar / Importar</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => exportToJSON()}
            style={{ padding: '6px 12px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => exportToCSV()}
            style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
          >
            Exportar CSV
          </button>
          <label style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
            Importar JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
        {importStatus === 'ok' && <p style={{ fontSize: 13, color: '#059669' }}>Importado com sucesso.</p>}
        {importStatus === 'err' && <p style={{ fontSize: 13, color: '#dc2626' }}>Erro ao importar. Use um JSON exportado por esta extensão.</p>}
      </section>
    </div>
  );
}
