import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import FolderSelector from './components/FolderSelector';
import FileExplorer from './components/FileExplorer';
import Toolbar from './components/Toolbar';
import JSONEditor from './components/JSONEditor/index';
import ConfirmDialog from './components/ConfirmDialog';

function AppShell() {
  const { saveFile, isDirty, undo, redo, canUndo, canRedo, confirmPrompt, respondConfirm } = useApp();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) saveFile();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && e.shiftKey) {
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDirty, saveFile, undo, redo, canUndo, canRedo]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      <header className="shrink-0 flex items-center gap-3 px-5 h-14 glass"
        style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', boxShadow: '0 4px 12px rgba(255,140,0,0.4)' }}>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h8" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Fieldstone
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '-1px' }}>
            Edit your data files
          </p>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 shrink-0 flex flex-col glass overflow-hidden"
          style={{ borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: '1px solid var(--glass-border)' }}>
          <FolderSelector />
          <FileExplorer />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'rgba(14,14,14,0.6)' }}>
          <Toolbar />
          <JSONEditor />
        </main>
      </div>
      <ConfirmDialog prompt={confirmPrompt} onRespond={respondConfirm} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}