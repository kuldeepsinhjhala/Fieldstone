/* eslint react-refresh/only-export-components: "off" */
import { useState } from 'react';

export const TYPE_META = {
  string: { label: 'Text', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
  number: { label: 'Number', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  boolean: { label: 'Yes/No', color: '#FF8C00', bg: 'rgba(255,140,0,0.12)', border: 'rgba(255,140,0,0.3)' },
  null: { label: 'Empty', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)' },
  array: { label: 'List', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
  object: { label: 'Group', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
};

export const TYPE_OPTIONS = ['string', 'number', 'boolean', 'array', 'object', 'null'];

export function TypeSelector({ selected, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TYPE_OPTIONS.map((t) => {
        const m = TYPE_META[t];
        const active = selected === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className="type-badge cursor-pointer transition-all"
            style={{
              background: active ? m.bg : 'rgba(255,255,255,0.04)',
              color: active ? m.color : 'var(--text-muted)',
              border: `1px solid ${active ? m.border : 'rgba(255,255,255,0.07)'}`,
              transform: active ? 'scale(1.06)' : 'scale(1)',
              outline: 'none',
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`toggle-track ${value ? 'on' : 'off'}`}>
        <span className="toggle-thumb" />
      </button>
      <span className="text-sm font-medium" style={{ color: value ? '#FFA500' : 'var(--text-muted)', minWidth: 30 }}>
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  );
}

export function StringEditor({ value, onChange }) {
  const isUrl = /^https?:\/\//.test(value);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isLong = value.length > 80;
  if (isLong) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="field-input"
        style={{ resize: 'vertical', fontFamily: 'inherit' }}
        placeholder="Enter text…"
      />
    );
  }
  return (
    <div className="relative" style={{ flex: 1 }}>
      <input type={isEmail ? 'email' : isUrl ? 'url' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="field-input" placeholder="Enter text…" />
      {(isUrl || isEmail) && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--text-muted)' }}>
          {isUrl ? 'URL' : 'Email'}
        </span>
      )}
    </div>
  );
}

export function NumberEditor({ value, onChange }) {
  const [draft, setDraft] = useState(() => String(value));
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  const commitIfFinite = (s) => {
    if (s === '' || s === '-') return;
    const n = Number(s);
    if (Number.isFinite(n)) onChange(n);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={(e) => {
        const s = e.target.value;
        if (s !== '' && s !== '-' && !/^-?\d*\.?\d*$/.test(s)) return;
        setDraft(s);
        commitIfFinite(s);
      }}
      onBlur={() => {
        if (draft === '' || draft === '-' || !Number.isFinite(Number(draft))) {
          setDraft('0');
          onChange(0);
        } else {
          const n = Number(draft);
          setDraft(String(n));
          onChange(n);
        }
      }}
      className="field-input"
      style={{ width: 160 }}
      placeholder="0"
    />
  );
}

export function NullEditor({ onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs px-2.5 py-1 rounded-lg font-mono"
        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}
      >
        empty
      </span>
      <button
        type="button"
        onClick={() => onChange('')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontSize: 12, fontWeight: 500, textDecoration: 'underline' }}
      >
        Set a value
      </button>
    </div>
  );
}

export function SectionToggle({ count, typeLabel, typeColor, typeBg, collapsed, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-2 w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <svg className="w-3 h-3" style={{ color: 'var(--text-muted)', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform .2s' }} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7.293 4.707a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="type-badge" style={{ background: typeBg, color: typeColor }}>
        {typeLabel}
      </span>
      {count !== undefined && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      )}
    </button>
  );
}

