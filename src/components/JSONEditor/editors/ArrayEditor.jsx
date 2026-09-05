import { useState, useEffect } from 'react';
import { inferNewItem, defaultForType } from '../../../utils/jsonValue';
import { TYPE_META, TypeSelector, SectionToggle } from '../widgets/typeWidgets';

let nextArrayId = 0;
function allocArrayId() {
  nextArrayId += 1;
  return 'a-' + nextArrayId;
}

function AddItemPanel({ onAdd, onCancel }) {
  const [type, setType] = useState('object');

  return (
    <div
      className="rounded-xl p-3 animate-fade-in"
      style={{ background: 'rgba(255,140,0,0.04)', border: '1px solid rgba(255,140,0,0.18)' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,140,0,0.7)' }}>
        New Item Type
      </p>
      <TypeSelector selected={type} onChange={setType} />
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {type === 'string' && 'Text item'}
        {type === 'number' && 'Number item'}
        {type === 'boolean' && 'Yes/No item'}
        {type === 'array' && 'Nested list'}
        {type === 'object' && 'Group — you can add nested fields inside'}
        {type === 'null' && 'Empty placeholder'}
      </p>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          className="btn-orange text-xs"
          style={{ padding: '7px 18px' }}
          onClick={() => onAdd(defaultForType(type))}
        >
          Add Item
        </button>
        <button type="button" className="btn-ghost text-xs" style={{ padding: '7px 14px' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ArrayEditor({ value, onChange, depth, NodeEditorComponent }) {
  const isEmpty = value.length === 0;
  const [collapsed, setCollapsed] = useState(() => depth > 2 && !isEmpty);
  const [itemIds, setItemIds] = useState(() => value.map(() => allocArrayId()));
  const [pickingType, setPickingType] = useState(false);
  const m = TYPE_META.array;
  // Empty lists always stay expanded so Add Item / type picker remain visible.
  const showCollapsed = collapsed && !isEmpty;

  useEffect(() => {
    if (itemIds.length === value.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItemIds(value.map(() => allocArrayId()));
  }, [value, itemIds.length]);

  const update = (i, v) => {
    const a = [...value];
    a[i] = v;
    onChange(a);
  };

  const remove = (i) => {
    setItemIds((ids) => ids.filter((_, idx) => idx !== i));
    onChange(value.filter((_, idx) => idx !== i));
  };

  const append = (item) => {
    setItemIds((ids) => [...ids, allocArrayId()]);
    onChange([...value, item]);
    setPickingType(false);
    setCollapsed(false);
  };

  const addInferred = () => {
    if (value.length === 0) {
      setPickingType(true);
      setCollapsed(false);
      return;
    }
    append(inferNewItem(value));
  };

  const RenderNode = NodeEditorComponent;

  return (
    <div className="w-full">
      <SectionToggle
        count={value.length}
        typeLabel={m.label}
        typeColor={m.color}
        typeBg={m.bg}
        collapsed={showCollapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      {!showCollapsed && (
        <div
          className="mt-2 rounded-xl overflow-hidden animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)' }}
        >
          {value.length === 0 && !pickingType && (
            <p className="text-xs px-4 py-3" style={{ color: 'var(--text-muted)' }}>No items yet</p>
          )}
          {value.map((item, i) => (
            <div
              key={itemIds[i] ?? i}
              className="flex items-start gap-3 px-4 py-3 group"
              style={{ borderBottom: i < value.length - 1 ? '1px solid var(--divider)' : 'none' }}
            >
              <span className="text-xs font-mono mt-2 shrink-0 w-5 text-right" style={{ color: 'var(--text-muted)' }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <RenderNode value={item} onChange={(v) => update(i, v)} depth={depth + 1} />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                title="Remove"
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="px-4 py-2.5" style={{ borderTop: value.length > 0 ? '1px solid var(--divider)' : 'none' }}>
            {pickingType ? (
              <AddItemPanel onAdd={append} onCancel={() => setPickingType(false)} />
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={addInferred}
                  className="flex items-center gap-2 text-xs font-medium w-full justify-center py-2 rounded-lg transition-colors cursor-pointer"
                  style={{ background: 'none', border: '1px dashed rgba(255,140,0,0.25)', color: 'var(--orange)', borderRadius: 10 }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
                {value.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPickingType(true)}
                    className="text-xs font-medium w-full py-1.5 cursor-pointer"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
                  >
                    Add as…
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
