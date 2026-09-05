import { useApp } from '../../context/AppContext';
import { friendlyName } from '../../utils/labels';
import NodeEditor from './NodeEditor';


function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: 'rgba(255,140,0,0.06)',
          border: '1px solid rgba(255,140,0,0.12)',
          boxShadow: '0 0 40px rgba(255,140,0,0.06)',
        }}>
        <svg className="w-12 h-12" style={{ color: 'rgba(255,140,0,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        Select a file to edit
      </h2>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Pick any file from the sidebar â€” your data will appear here as a simple form, ready to edit.
      </p>
    </div>
  );
}

export default function JSONEditor() {
  const { activeFile, jsonData, updateData } = useApp();

  if (!activeFile) return <EmptyState />;

  if (jsonData === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(255,140,0,0.2)', borderTopColor: '#FF8C00' }} />
      </div>
    );
  }

  const isArray = Array.isArray(jsonData);
  const isObject = !isArray && typeof jsonData === 'object' && jsonData !== null;
  const keyCount = isArray ? jsonData.length : isObject ? Object.keys(jsonData).length : 1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* File header strip */}
      <div className="shrink-0 px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--divider)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--orange-dim)', border: '1px solid rgba(255,140,0,0.2)' }}>
          <svg className="w-4.5 h-4.5" style={{ color: 'var(--orange)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {friendlyName(activeFile.name)}
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {keyCount} {isArray ? 'item' : 'field'}{keyCount !== 1 ? 's' : ''} · {activeFile.name}
          </p>
        </div>
      </div>

      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <NodeEditor value={jsonData} onChange={updateData} depth={0} />
      </div>
    </div>
  );
}
