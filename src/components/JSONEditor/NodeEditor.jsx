import { useState, useEffect, useRef } from 'react';

/* ── Helpers ── */

function getType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function toLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function inferNewItem(arr) {
  if (arr.length === 0) return '';
  const t = getType(arr[arr.length - 1]);
  if (t === 'string') return '';
  if (t === 'number') return 0;
  if (t === 'boolean') return false;
  if (t === 'array') return [];
  if (t === 'object') return Object.fromEntries(Object.keys(arr[arr.length - 1]).map(k => [k, '']));
  return '';
}

function defaultForType(type) {
  if (type === 'string') return '';
  if (type === 'number') return 0;
  if (type === 'boolean') return false;
  if (type === 'array') return [];
  if (type === 'object') return {};
  return null;
}

function convertValue(value, toType) {
  const from = getType(value);
  if (from === toType) return value;
  switch (toType) {
    case 'string':
      if (from === 'number' || from === 'boolean') return String(value);
      if (from === 'null') return '';
      if (from === 'array' || from === 'object') return JSON.stringify(value, null, 2);
      return '';
    case 'number': {
      if (from === 'string') { const n = Number(value); return isNaN(n) ? 0 : n; }
      if (from === 'boolean') return value ? 1 : 0;
      return 0;
    }
    case 'boolean':
      if (from === 'string') return value.toLowerCase() === 'true' || value === '1';
      if (from === 'number') return value !== 0;
      return false;
    case 'array':
      if (from === 'string' && value.trim()) return [value];
      return [];
    case 'object': return {};
    case 'null': return null;
    default: return null;
  }
}

/* ── Type metadata ── */

const TYPE_META = {
  string:  { label: 'Text',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)'  },
  number:  { label: 'Number', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  boolean: { label: 'Yes/No', color: '#FF8C00', bg: 'rgba(255,140,0,0.12)',   border: 'rgba(255,140,0,0.3)'   },
  null:    { label: 'Empty',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)',  border: 'rgba(107,114,128,0.25)'},
  array:   { label: 'List',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.3)'  },
  object:  { label: 'Group',  color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
};

const TYPE_OPTIONS = ['string', 'number', 'boolean', 'array', 'object', 'null'];

/* ── Type selector (pill row) ── */

function TypeSelector({ selected, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TYPE_OPTIONS.map(t => {
        const m = TYPE_META[t];
        const active = selected === t;
        return (
          <button key={t} onClick={() => onChange(t)}
            className="type-badge cursor-pointer transition-all"
            style={{
              background: active ? m.bg : 'rgba(255,255,255,0.04)',
              color: active ? m.color : 'var(--text-muted)',
              border: `1px solid ${active ? m.border : 'rgba(255,255,255,0.07)'}`,
              transform: active ? 'scale(1.06)' : 'scale(1)',
              outline: 'none',
            }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Toggle switch ── */

function Toggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={`toggle-track ${value ? 'on' : 'off'}`}>
        <span className="toggle-thumb" />
      </button>
      <span className="text-sm font-medium" style={{ color: value ? '#FFA500' : 'var(--text-muted)', minWidth: 30 }}>
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  );
}

/* ── String editor ── */

function StringEditor({ value, onChange }) {
  const isUrl = /^https?:\/\//.test(value);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isLong = value.length > 80;
  if (isLong) {
    return (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
        className="field-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} placeholder="Enter text…" />
    );
  }
  return (
    <div className="relative" style={{ flex: 1 }}>
      <input type={isEmail ? 'email' : isUrl ? 'url' : 'text'} value={value}
        onChange={e => onChange(e.target.value)} className="field-input" placeholder="Enter text…" />
      {(isUrl || isEmail) && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
          style={{ color: 'var(--text-muted)' }}>{isUrl ? '🔗' : '✉️'}</span>
      )}
    </div>
  );
}

/* ── Number editor ── */

function NumberEditor({ value, onChange }) {
  return (
    <input type="number" value={value}
      onChange={e => { const s = e.target.value; if (s === '' || s === '-') return; const n = Number(s); onChange(isNaN(n) ? 0 : n); }}
      className="field-input" style={{ width: 160 }} placeholder="0" />
  );
}

/* ── Null editor ── */

function NullEditor({ onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs px-2.5 py-1 rounded-lg font-mono"
        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
        empty
      </span>
      <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontSize: 12, fontWeight: 500, textDecoration: 'underline' }}>
        Set a value
      </button>
    </div>
  );
}

/* ── Section collapse toggle ── */

function SectionToggle({ count, typeLabel, typeColor, typeBg, collapsed, onToggle }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 w-full"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <svg className="w-3 h-3" style={{ color: 'var(--text-muted)', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform .2s' }}
          fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 4.707a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </div>
      <span className="type-badge" style={{ background: typeBg, color: typeColor }}>{typeLabel}</span>
      {count !== undefined && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{count} {count === 1 ? 'item' : 'items'}</span>
      )}
    </button>
  );
}

/* ── Array editor ── */

function ArrayEditor({ value, onChange, depth }) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  const m = TYPE_META.array;
  const update = (i, v) => { const a = [...value]; a[i] = v; onChange(a); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, inferNewItem(value)]);

  return (
    <div className="w-full">
      <SectionToggle count={value.length} typeLabel={m.label} typeColor={m.color} typeBg={m.bg}
        collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      {!collapsed && (
        <div className="mt-2 rounded-xl overflow-hidden animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)' }}>
          {value.length === 0 && <p className="text-xs px-4 py-3" style={{ color: 'var(--text-muted)' }}>No items yet</p>}
          {value.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 group"
              style={{ borderBottom: i < value.length - 1 ? '1px solid var(--divider)' : 'none' }}>
              <span className="text-xs font-mono mt-2 shrink-0 w-5 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <NodeEditor value={item} onChange={v => update(i, v)} depth={depth + 1} />
              </div>
              <button onClick={() => remove(i)} title="Remove"
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
          <div className="px-4 py-2.5" style={{ borderTop: value.length > 0 ? '1px solid var(--divider)' : 'none' }}>
            <button onClick={add} className="flex items-center gap-2 text-xs font-medium w-full justify-center py-2 rounded-lg transition-colors cursor-pointer"
              style={{ background: 'none', border: '1px dashed rgba(255,140,0,0.25)', color: 'var(--orange)', borderRadius: 10 }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add field panel ── */

function AddFieldPanel({ existingKeys, onAdd, onCancel }) {
  const [key, setKey] = useState('');
  const [type, setType] = useState('string');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const isDuplicate = key.trim() && existingKeys.includes(key.trim());

  const handleAdd = () => {
    if (!key.trim() || isDuplicate) return;
    onAdd(key.trim(), defaultForType(type));
    setKey('');
    setType('string');
  };

  return (
    <div className="rounded-xl p-4 animate-fade-in"
      style={{ background: 'rgba(255,140,0,0.04)', border: '1px solid rgba(255,140,0,0.18)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,140,0,0.7)' }}>
        New Field
      </p>

      {/* Field name */}
      <div className="mb-3">
        <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-muted)' }}>Field Name</label>
        <input ref={inputRef} type="text" value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel(); }}
          placeholder="e.g. title, description, items…"
          className="field-input text-sm"
          style={{ borderColor: isDuplicate ? '#f87171' : undefined }} />
        {isDuplicate && <p className="text-xs mt-1" style={{ color: '#f87171' }}>A field with this name already exists</p>}
      </div>

      {/* Type picker */}
      <div className="mb-4">
        <label className="text-xs mb-2 block font-medium" style={{ color: 'var(--text-muted)' }}>
          Field Type <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— what kind of data will this hold?</span>
        </label>
        <TypeSelector selected={type} onChange={setType} />

        {/* Helpful hint */}
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {type === 'string'  && '📝 Text: names, titles, descriptions, URLs…'}
          {type === 'number'  && '🔢 Number: counts, prices, IDs, sequences…'}
          {type === 'boolean' && '✅ Yes/No: flags, toggles, active status…'}
          {type === 'array'   && '📋 List: multiple items, tags, items in order…'}
          {type === 'object'  && '📦 Group: nested data with its own fields…'}
          {type === 'null'    && '∅ Empty: placeholder, no value set yet…'}
        </p>
      </div>

      <div className="flex gap-2">
        <button className="btn-orange text-xs" onClick={handleAdd} disabled={!key.trim() || isDuplicate}
          style={{ padding: '7px 18px' }}>
          Add Field
        </button>
        <button className="btn-ghost text-xs" onClick={onCancel} style={{ padding: '7px 14px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Object editor ── */

function ObjectEditor({ value, onChange, depth }) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  const [addingKey, setAddingKey] = useState(false);
  const m = TYPE_META.object;

  const updateKey = (k, v) => onChange({ ...value, [k]: v });
  const removeKey = (k) => { const copy = { ...value }; delete copy[k]; onChange(copy); };
  const handleAdd = (k, v) => { onChange({ ...value, [k]: v }); setAddingKey(false); };

  const keys = Object.keys(value);

  const body = (
    <div className="space-y-1">
      {keys.map(k => (
        <PropertyRow key={k} propKey={k} value={value[k]} depth={depth}
          onChange={v => updateKey(k, v)} onRemove={() => removeKey(k)} />
      ))}
      {addingKey
        ? <AddFieldPanel existingKeys={keys} onAdd={handleAdd} onCancel={() => setAddingKey(false)} />
        : (
          <button onClick={() => setAddingKey(true)}
            className="flex items-center gap-2 text-xs font-medium w-full py-2.5 px-3 rounded-xl transition-all cursor-pointer"
            style={{ background: 'none', border: '1px dashed rgba(255,140,0,0.18)', color: 'var(--text-muted)', borderRadius: 12 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,140,0,0.04)'; e.currentTarget.style.color = 'var(--orange)'; e.currentTarget.style.borderColor = 'rgba(255,140,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,140,0,0.18)'; }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Field
          </button>
        )
      }
    </div>
  );

  if (depth === 0) return body;

  return (
    <div className="w-full">
      <SectionToggle count={keys.length} typeLabel={m.label} typeColor={m.color} typeBg={m.bg}
        collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      {!collapsed && (
        <div className="mt-2 pl-3 border-l animate-fade-in" style={{ borderColor: 'rgba(244,114,182,0.2)' }}>
          {body}
        </div>
      )}
    </div>
  );
}

/* ── Type change popover ── */

function TypeChangePopover({ currentType, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="animate-fade-in"
      style={{
        position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 6,
        background: 'rgba(28,28,28,0.97)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        minWidth: 240,
      }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
        Change Field Type
      </p>
      <TypeSelector selected={currentType} onChange={t => { onSelect(t); onClose(); }} />
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        ⚠ Changing type will convert the current value
      </p>
    </div>
  );
}

/* ── Property row ── */

function PropertyRow({ propKey, value, depth, onChange, onRemove }) {
  const [showTypePopover, setShowTypePopover] = useState(false);
  const type = getType(value);
  const meta = TYPE_META[type] || TYPE_META.null;
  const isComplex = type === 'object' || type === 'array';
  const label = toLabel(propKey);

  const handleTypeChange = (newType) => {
    onChange(convertValue(value, newType));
  };

  return (
    <div className="group rounded-xl p-3 transition-all duration-150"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'transparent'; }}>

      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>

        {/* Clickable type badge — opens type changer */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowTypePopover(v => !v)}
            className="type-badge cursor-pointer transition-opacity hover:opacity-80"
            title="Click to change type"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, outline: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {meta.label}
            <svg style={{ width: 8, height: 8, opacity: 0.7 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
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

        <button onClick={onRemove} title={`Remove ${label}`}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171' }}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Value editor */}
      <div className={isComplex ? '' : 'flex items-center'}>
        <NodeEditor value={value} onChange={onChange} depth={depth + 1} />
      </div>
    </div>
  );
}

/* ── Root dispatcher ── */

export default function NodeEditor({ value, onChange, depth = 0 }) {
  const type = getType(value);
  if (type === 'boolean') return <Toggle value={value} onChange={onChange} />;
  if (type === 'string')  return <StringEditor value={value} onChange={onChange} />;
  if (type === 'number')  return <NumberEditor value={value} onChange={onChange} />;
  if (type === 'null')    return <NullEditor onChange={onChange} />;
  if (type === 'array')   return <ArrayEditor value={value} onChange={onChange} depth={depth} />;
  if (type === 'object')  return <ObjectEditor value={value} onChange={onChange} depth={depth} />;
  return null;
}
