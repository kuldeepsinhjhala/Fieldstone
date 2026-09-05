export function getType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

export function defaultForType(type) {
  if (type === 'string') return '';
  if (type === 'number') return 0;
  if (type === 'boolean') return false;
  if (type === 'array') return [];
  if (type === 'object') return {};
  return null;
}

/** Recursively clone a value's shape with empty leaf defaults (preserves nested Groups). */
export function emptyClone(value) {
  const t = getType(value);
  if (t === 'string') return '';
  if (t === 'number') return 0;
  if (t === 'boolean') return false;
  if (t === 'null') return null;
  if (t === 'array') return [];
  if (t === 'object') {
    return Object.fromEntries(
      Object.keys(value).map((k) => [k, emptyClone(value[k])])
    );
  }
  return '';
}

export function inferNewItem(arr) {
  if (arr.length === 0) return '';
  const last = arr[arr.length - 1];
  const t = getType(last);
  if (t === 'string') return '';
  if (t === 'number') return 0;
  if (t === 'boolean') return false;
  if (t === 'array') return [];
  if (t === 'object') return emptyClone(last);
  if (t === 'null') return null;
  return '';
}

export function convertValue(value, toType) {
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

export function isDestructiveConvert(value, toType) {
  const from = getType(value);
  if (from === toType) return false;
  if (from !== 'object' && from !== 'array') return false;
  if (toType === 'string') return false;
  const empty = from === 'array' ? value.length === 0 : Object.keys(value).length === 0;
  if (empty) return false;
  return true;
}
