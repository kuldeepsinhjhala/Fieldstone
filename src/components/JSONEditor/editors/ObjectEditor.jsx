import { useState, useEffect, useRef } from 'react';
import { defaultForType } from '../../../utils/jsonValue';
import { TYPE_META, TypeSelector, SectionToggle } from '../widgets/typeWidgets';
import PropertyRow from './PropertyRow';

function AddFieldPanel({ existingKeys, onAdd, onCancel }) {
  const [key, setKey] = useState('');
  const [type, setType] = useState('string');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isDuplicate = key.trim() && existingKeys.includes(key.trim());

  const handleAdd = () => {
    if (!key.trim() || isDuplicate) return;
    onAdd(key.trim(), defaultForType(type));
    setKey('');
    setType('string');
  };

  return (
    <div
      className="rounded-xl p-4 animate-fade-in"
      style={{ background: 'rgba(255,140,0,0.04)', border: '1px solid rgba(255,140,0,0.18)' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,140,0,0.7)' }}>
        New Field
      </p>

      <div className="mb-3">
        <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text-muted)' }}>
          Field Name
        </label>
        <input
          ref={inputRef}
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="e.g. title, description, items…"
          className="field-input text-sm"
          style={{ borderColor: isDuplicate ? '#f87171' : undefined }}
        />
        {isDuplicate && (
          <p className="text-xs mt-1" style={{ color: '#f87171' }}>
            A field with this name already exists
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-xs mb-2 block font-medium" style={{ color: 'var(--text-muted)' }}>
          Field Type{' '}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— what kind of data will this hold?</span>
        </label>
        <TypeSelector selected={type} onChange={setType} />
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {type === 'string' && 'Text: names, titles, descriptions, URLs…'}
          {type === 'number' && 'Number: counts, prices, IDs, sequences…'}
          {type === 'boolean' && 'Yes/No: flags, toggles, active status…'}
          {type === 'array' && 'List: multiple items, tags, items in order…'}
          {type === 'object' && 'Group: nested data with its own fields…'}
          {type === 'null' && 'Empty: placeholder, no value set yet…'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn-orange text-xs"
          onClick={handleAdd}
          disabled={!key.trim() || isDuplicate}
          style={{ padding: '7px 18px' }}
        >
          Add Field
        </button>
        <button type="button" className="btn-ghost text-xs" onClick={onCancel} style={{ padding: '7px 14px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ObjectEditor({ value, onChange, depth, NodeEditorComponent }) {
  const keys = Object.keys(value);
  const isEmpty = keys.length === 0;
  // Expand empty groups and shallow nests so nested fields (e.g. time.*) are visible.
  const [collapsed, setCollapsed] = useState(() => depth > 2 && !isEmpty);
  const [addingKey, setAddingKey] = useState(false);
  const m = TYPE_META.object;
  // Empty groups always stay expanded so Add Field remains visible.
  const showCollapsed = collapsed && !isEmpty;

  const updateKey = (k, v) => onChange({ ...value, [k]: v });
  const removeKey = (k) => {
    const copy = { ...value };
    delete copy[k];
    onChange(copy);
  };
  const handleAdd = (k, v) => {
    onChange({ ...value, [k]: v });
    setAddingKey(false);
    setCollapsed(false);
  };

  const body = (
    <div className="space-y-1">
      {keys.map((k) => (
        <PropertyRow
          key={k}
          propKey={k}
          value={value[k]}
          depth={depth}
          onChange={(v) => updateKey(k, v)}
          onRemove={() => removeKey(k)}
          NodeEditorComponent={NodeEditorComponent}
        />
      ))}
      {addingKey ? (
        <AddFieldPanel existingKeys={keys} onAdd={handleAdd} onCancel={() => setAddingKey(false)} />
      ) : (
        <button
          type="button"
          onClick={() => {
            setAddingKey(true);
            setCollapsed(false);
          }}
          className="flex items-center gap-2 text-xs font-medium w-full py-2.5 px-3 rounded-xl transition-all cursor-pointer"
          style={{
            background: 'none',
            border: '1px dashed rgba(255,140,0,0.18)',
            color: 'var(--text-muted)',
            borderRadius: 12,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,140,0,0.04)';
            e.currentTarget.style.color = 'var(--orange)';
            e.currentTarget.style.borderColor = 'rgba(255,140,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'rgba(255,140,0,0.18)';
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
          </svg>
          Add Field
        </button>
      )}
    </div>
  );

  if (depth === 0) return body;

  return (
    <div className="w-full">
      <SectionToggle
        count={keys.length}
        typeLabel={m.label}
        typeColor={m.color}
        typeBg={m.bg}
        collapsed={showCollapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      {!showCollapsed && (
        <div className="mt-2 pl-3 border-l animate-fade-in" style={{ borderColor: 'rgba(244,114,182,0.2)' }}>
          {body}
        </div>
      )}
    </div>
  );
}
