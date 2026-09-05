import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { getType, convertValue, isDestructiveConvert } from '../../../utils/jsonValue';
import { toLabel } from '../../../utils/labels';
import { TYPE_META, TypeSelector } from '../widgets/typeWidgets';

function TypeChangePopover({ currentType, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 50,
        marginTop: 6,
        background: 'rgba(28,28,28,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '12px 14px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        minWidth: 240,
      }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
        Change Field Type
      </p>
      <TypeSelector
        selected={currentType}
        onChange={async (t) => {
          const ok = await onSelect(t);
          if (ok) onClose();
        }}
      />
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Changing type will convert the current value
      </p>
    </div>
  );
}

export default function PropertyRow({ propKey, value, depth, onChange, onRemove, NodeEditorComponent }) {
  const [showTypePopover, setShowTypePopover] = useState(false);
  const { confirm } = useApp();
  const type = getType(value);
  const meta = TYPE_META[type] || TYPE_META.null;
  const isComplex = type === 'object' || type === 'array';
  const label = toLabel(propKey);
  const RenderNode = NodeEditorComponent;

  const handleTypeChange = async (newType) => {
    if (isDestructiveConvert(value, newType)) {
      const ok = await confirm('Change type and replace this nested data?');
      if (!ok) return false;
    }
    onChange(convertValue(value, newType));
    return true;
  };

  return (
    <div
      className="group rounded-xl p-3 transition-all duration-150"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent', position: 'relative' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowTypePopover((v) => !v)}
            className="type-badge cursor-pointer transition-opacity hover:opacity-80"
            title="Click to change type"
            style={{
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.border}`,
              outline: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {meta.label}
            <svg style={{ width: 8, height: 8, opacity: 0.7 }} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {showTypePopover && (
            <TypeChangePopover
              currentType={type}
              onSelect={handleTypeChange}
              onClose={() => setShowTypePopover(false)}
            />
          )}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${label}`}
          className="opacity-60 hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171' }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={isComplex ? '' : 'flex items-center'}>
        <RenderNode value={value} onChange={onChange} depth={depth + 1} />
      </div>
    </div>
  );
}
