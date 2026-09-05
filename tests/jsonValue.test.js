import { describe, it, expect } from 'vitest';
import {
  getType,
  defaultForType,
  emptyClone,
  inferNewItem,
  convertValue,
  isDestructiveConvert,
} from '../src/utils/jsonValue.js';

describe('jsonValue helpers', () => {
  it('getType returns stable buckets', () => {
    expect(getType(null)).toBe('null');
    expect(getType([])).toBe('array');
    expect(getType({})).toBe('object');
    expect(getType('x')).toBe('string');
    expect(getType(3)).toBe('number');
    expect(getType(true)).toBe('boolean');
  });

  it('defaultForType returns empty values', () => {
    expect(defaultForType('string')).toBe('');
    expect(defaultForType('number')).toBe(0);
    expect(defaultForType('boolean')).toBe(false);
    expect(defaultForType('array')).toEqual([]);
    expect(defaultForType('object')).toEqual({});
    expect(defaultForType('null')).toBeNull();
  });

  it('emptyClone preserves nested object shape', () => {
    expect(emptyClone('hi')).toBe('');
    expect(emptyClone(7)).toBe(0);
    expect(emptyClone(true)).toBe(false);
    expect(emptyClone(null)).toBeNull();
    expect(emptyClone([1, 2])).toEqual([]);
    expect(
      emptyClone({
        time: { startDate: '2007', endDate: '2019' },
        title: 'School',
        achievements: [{ title: 'A' }],
      })
    ).toEqual({
      time: { startDate: '', endDate: '' },
      title: '',
      achievements: [],
    });
  });

  it('inferNewItem infers based on last element', () => {
    expect(inferNewItem([])).toBe('');
    expect(inferNewItem(['a'])).toBe('');
    expect(inferNewItem([1])).toBe(0);
    expect(inferNewItem([true])).toBe(false);
    expect(inferNewItem([[]])).toEqual([]);
    expect(inferNewItem([{ a: 1 }])).toEqual({ a: 0 });
    expect(
      inferNewItem([{ time: { startDate: '2007' }, title: 'x', tags: ['a'] }])
    ).toEqual({ time: { startDate: '' }, title: '', tags: [] });
  });

  it('convertValue converts primitives and preserves meaning', () => {
    expect(convertValue(2, 'string')).toBe('2');
    expect(convertValue(true, 'string')).toBe('true');
    expect(convertValue(null, 'string')).toBe('');
    expect(convertValue([1, 2], 'string')).toContain('[\n');

    expect(convertValue('12', 'number')).toBe(12);
    expect(convertValue('abc', 'number')).toBe(0);
    expect(convertValue(false, 'number')).toBe(0);
    expect(convertValue(true, 'number')).toBe(1);

    expect(convertValue('true', 'boolean')).toBe(true);
    expect(convertValue('1', 'boolean')).toBe(true);
    expect(convertValue('false', 'boolean')).toBe(false);
    expect(convertValue(0, 'boolean')).toBe(false);
    expect(convertValue(5, 'boolean')).toBe(true);

    expect(convertValue('x', 'array')).toEqual(['x']);
    expect(convertValue('  ', 'array')).toEqual([]);

    expect(convertValue({ a: 1 }, 'object')).toEqual({ a: 1 });
    expect(convertValue('', 'null')).toBeNull();
  });

  it('isDestructiveConvert flags object/array -> non-string replacements', () => {
    expect(isDestructiveConvert({ a: 1 }, 'number')).toBe(true);
    expect(isDestructiveConvert({}, 'number')).toBe(false);

    expect(isDestructiveConvert([1], 'string')).toBe(false);
    expect(isDestructiveConvert([1], 'object')).toBe(true);
    expect(isDestructiveConvert([], 'object')).toBe(false);

    expect(isDestructiveConvert('x', 'number')).toBe(false);
    expect(isDestructiveConvert(true, 'string')).toBe(false);
  });
});

