import { useApp } from '../context/AppContext';

const canPickFolder = typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';

export default function FolderSelector() {
  const { loadDirectory, dirHandle } = useApp();

  const handleSelect = async () => {
    if (!canPickFolder) return;
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await loadDirectory(handle);
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    }
  };

  return (
    <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--divider)' }}>
      <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Your Folder
      </p>

      {dirHandle ? (
        <div className="glass-card p-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--orange-dim)', border: '1px solid rgba(255,140,0,0.2)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--orange)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {dirHandle.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Folder open</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 mb-3 text-center"
          style={{ borderStyle: 'dashed', borderColor: 'rgba(255,140,0,0.15)' }}>
          <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ background: 'var(--orange-dim)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--orange)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {canPickFolder ? 'No folder selected yet' : 'Folder access needs Chrome or Edge on localhost or HTTPS'}
          </p>
        </div>
      )}

      {canPickFolder ? (
        <button className="btn-orange w-full" onClick={handleSelect}>
          {dirHandle ? 'Change Folder' : 'Choose Folder'}
        </button>
      ) : (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Open this app in Chrome or Edge to choose a folder.
        </p>
      )}
    </div>
  );
}