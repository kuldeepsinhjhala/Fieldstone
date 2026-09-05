import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { friendlyName } from '../utils/labels';

export default function Toolbar() {
  const {
    activeFile,
    isDirty,
    saveFile,
    createFile,
    deleteFile,
    dirHandle,
    status,
    saveError,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useApp();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createFile(newName.trim());
    setNewName('');
    setCreating(false);
  };

  const handleDeleteClick = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteFile();
    setConfirmDelete(false);
  };

  return (
    <div className="shrink-0 glass flex items-center gap-2 px-4 py-2.5 flex-wrap"
      style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid var(--divider)', minHeight: '52px' }}>

      <button
        className="btn-orange flex items-center gap-1.5 text-xs"
        onClick={saveFile}
        disabled={!activeFile || !isDirty || saveState === 'saving'}
        style={{ padding: '7px 16px' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save Changes{isDirty ? ' •' : ''}
      </button>

      <button
        className="btn-ghost flex items-center gap-1.5 text-xs"
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{ padding: '7px 14px' }}
      >
        Undo
      </button>

      <button
        className="btn-ghost flex items-center gap-1.5 text-xs"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        style={{ padding: '7px 14px' }}
      >
        Redo
      </button>

      <div className="w-px h-5 shrink-0" style={{ background: 'var(--divider)' }} />

      {creating ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
            placeholder="filename.json"
            className="field-input text-xs"
            style={{ width: '150px', padding: '6px 10px' }}
          />
          <button className="btn-orange text-xs" onClick={handleCreate} disabled={!newName.trim()} style={{ padding: '6px 14px' }}>Create</button>
          <button className="btn-ghost text-xs" onClick={() => { setCreating(false); setNewName(''); }} style={{ padding: '6px 12px' }}>Cancel</button>
        </div>
      ) : (
        <button className="btn-ghost flex items-center gap-1.5 text-xs" onClick={() => setCreating(true)} disabled={!dirHandle} style={{ padding: '7px 14px' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
          </svg>
          New File
        </button>
      )}

      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#f87171' }}>
            Delete &ldquo;{activeFile?.name}&rdquo;?
          </span>
          <button className="btn-danger text-xs" onClick={handleDeleteClick} style={{ padding: '6px 12px' }}>Yes, Delete</button>
          <button className="btn-ghost text-xs" onClick={() => setConfirmDelete(false)} style={{ padding: '6px 12px' }}>Cancel</button>
        </div>
      ) : (
        <button className="btn-danger flex items-center gap-1.5 text-xs" onClick={handleDeleteClick} disabled={!activeFile} style={{ padding: '7px 14px' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        {status.message ? (
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg animate-fade-in"
            style={{
              background: status.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              color: status.type === 'error' ? '#f87171' : '#4ade80',
              border: `1px solid ${status.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            }}>
            {status.type === 'error' ? 'x' : 'ok'} {status.message}
          </div>
        ) : activeFile ? (
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--orange-dim)', color: 'var(--orange)', border: '1px solid rgba(255,140,0,0.2)' }}>
                Unsaved
              </span>
            )}
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {friendlyName(activeFile.name)}
            </span>
          </div>
        ) : null}

        {saveError && activeFile && saveState === 'error' && (
          <button
            type="button"
            className="btn-danger text-xs"
            onClick={saveFile}
            style={{ padding: '7px 14px' }}
            title="Retry save"
          >
            Retry Save
          </button>
        )}
      </div>
    </div>
  );
}