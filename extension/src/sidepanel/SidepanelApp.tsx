import { useState } from 'react';
import { openWhatsAppTab } from './openWhatsApp';
import Contatos from './views/Contatos';
import Pipeline from './views/Pipeline';
import Dashboard from './views/Dashboard';
import Tarefas from './views/Tarefas';
import Config from './views/Config';

type Page = 'dashboard' | 'contatos' | 'pipeline' | 'tarefas' | 'config';

function SidepanelApp() {
  const [page, setPage] = useState<Page>('dashboard');
  const [whatsappStatus, setWhatsappStatus] = useState<string | null>(null);

  const handleOpenWhatsApp = async () => {
    setWhatsappStatus(null);
    try {
      const result = await openWhatsAppTab();
      if (result.opened) {
        setWhatsappStatus(
          result.focused
            ? 'Aba do WhatsApp em foco.'
            : 'WhatsApp aberto em nova aba. Faça login se necessário.'
        );
      } else {
        setWhatsappStatus('Abrindo WhatsApp...');
      }
    } catch {
      setWhatsappStatus('Erro ao abrir o WhatsApp. Verifique as permissões da extensão.');
    }
  };

  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'contatos', label: 'Contatos' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'tarefas', label: 'Tarefas' },
    { id: 'config', label: 'Configurações' },
  ];

  return (
    <>
      <button type="button" className="open-whatsapp-bar" onClick={handleOpenWhatsApp}>
        Abrir WhatsApp
      </button>
      <p style={{ margin: '0 0 8px', fontSize: 11, color: '#9ca3af' }}>
        Abra ou focalize a aba do WhatsApp para conversar. O CRM continua na aba.
      </p>
      {whatsappStatus && <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>{whatsappStatus}</p>}
      <div className="app-shell">
        <nav className="nav">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <main className="main">
          {page === 'dashboard' && (
            <>
              <h1 className="page-title">Dashboard</h1>
              <Dashboard />
            </>
          )}
          {page === 'contatos' && (
            <>
              <h1 className="page-title">Contatos</h1>
              <Contatos />
            </>
          )}
          {page === 'pipeline' && (
            <>
              <h1 className="page-title">Pipeline</h1>
              <Pipeline />
            </>
          )}
          {page === 'tarefas' && (
            <>
              <h1 className="page-title">Tarefas</h1>
              <Tarefas />
            </>
          )}
          {page === 'config' && (
            <>
              <h1 className="page-title">Configurações</h1>
              <Config />
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default SidepanelApp;
