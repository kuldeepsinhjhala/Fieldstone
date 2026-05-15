import { useApp } from '../context/AppContext';

function friendlyName(filename) {
  return filename
    .replace(/\.json$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function FileCard({ file, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group animate-fade-in"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(255,140,0,0.18), rgba(255,165,0,0.1))'
          : 'transparent',
        border: isActive
          ? '1px solid rgba(255,140,0,0.35)'
          : '1px solid transparent',
        marginBottom: '4px',
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* File icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: isActive ? 'rgba(255,140,0,0.25)' : 'rgba(255,255,255,0.05)',
            border: isActive ? '1px solid rgba(255,140,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
          }}>
          <svg className="w-3.5 h-3.5" style={{ color: isActive ? '#FF8C00' : 'var(--text-muted)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: isActive ? '#FFA500' : 'var(--text-primary)' }}>
            {friendlyName(file.name)}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {file.name}
          </p>
        </div>

        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: '#FF8C00', boxShadow: '0 0 6px #FF8C00' }} />
        )}
      </div>
    </button>
  );
}

export default function FileExplorer() {
  const { files, activeFile, openFile, dirHandle } = useApp();

  if (!dirHandle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
          <svg className="w-7 h-7" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Choose a folder</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your JSON files will appear here</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No data files found</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create a new file to get started</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Files
        </p>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--orange-dim)', color: 'var(--orange)' }}>
          {files.length}
        </span>
      </div>

      {files.map((file) => (
        <FileCard
          key={file.name}
          file={file}
          isActive={activeFile?.name === file.name}
          onClick={() => openFile(file)}
        />
      ))}
    </div>
  );
}
