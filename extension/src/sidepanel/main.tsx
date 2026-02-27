import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SidepanelApp from './SidepanelApp';
import './sidepanel.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <SidepanelApp />
    </StrictMode>
  );
}
