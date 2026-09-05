import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useEffect } from 'react';

import { AppProvider, useApp } from '../src/context/AppContext';

function Probe({ onApi }) {
  const api = useApp();
  const {
    isDirty,
    jsonData,
    canUndo,
    canRedo,
    confirmPrompt,
    saveError,
  } = api;

  useEffect(() => {
    onApi(api);
  }, [onApi, api]);

  return (
    <div>
      <div data-testid="dirty">{String(isDirty)}</div>
      <div data-testid="json">{JSON.stringify(jsonData)}</div>
      <div data-testid="canUndo">{String(canUndo)}</div>
      <div data-testid="canRedo">{String(canRedo)}</div>
      <div data-testid="confirmPrompt">
        {confirmPrompt ? confirmPrompt.message : ''}
      </div>
      <div data-testid="saveError">{saveError ? String(saveError) : ''}</div>
    </div>
  );
}

describe('AppContext', () => {
  afterEach(() => cleanup());

  it('gates openFile behind dirty confirmation', async () => {
    let api;
    render(
      <AppProvider>
        <Probe onApi={(a) => { api = a; }} />
      </AppProvider>
    );

    api.updateData({ x: 2 });
    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('true'));
    const fileB = {
      name: 'b.json',
      handle: {
        getFile: async () => new File([JSON.stringify({ y: 3 })], 'b.json', { type: 'application/json' }),
      },
    };

    // Trigger an open while dirty; it should block and show confirmPrompt.
    const openPromise = api.openFile(fileB);
    await waitFor(() => expect(screen.getByTestId('confirmPrompt').textContent).not.toBe(''));

    api.respondConfirm(true);
    await openPromise;

    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('false'));
    expect(screen.getByTestId('json').textContent).toBe(JSON.stringify({ y: 3 }));
    expect(screen.getByTestId('confirmPrompt').textContent).toBe('');
  });

  it('supports undo/redo transitions', async () => {
    let api;
    render(
      <AppProvider>
        <Probe onApi={(a) => { api = a; }} />
      </AppProvider>
    );

    api.updateData({ a: 1 });
    // Ensure we cross the undo coalescing window.
    await new Promise((r) => setTimeout(r, 450));
    api.updateData({ a: 2 });
    await waitFor(() => expect(screen.getByTestId('canUndo')).toHaveTextContent('true'));

    api.undo();
    await waitFor(() => expect(screen.getByTestId('json')).toHaveTextContent(JSON.stringify({ a: 1 })));
    expect(screen.getByTestId('canRedo').textContent).toBe('true');

    api.redo();
    await waitFor(() => expect(screen.getByTestId('json')).toHaveTextContent(JSON.stringify({ a: 2 })));
  });

  it('keeps edits dirty on save failure and allows retry', async () => {
    let api;
    render(
      <AppProvider>
        <Probe onApi={(a) => { api = a; }} />
      </AppProvider>
    );

    const writableMock = {
      write: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    };

    let createWritableCalls = 0;
    const fileEntry = {
      name: 't.json',
      handle: {
        getFile: async () => new File([JSON.stringify({ a: 1 })], 't.json', { type: 'application/json' }),
        createWritable: async () => {
          createWritableCalls += 1;
          if (createWritableCalls === 1) throw new Error('disk full');
          return writableMock;
        },
      },
    };

    await api.openFile(fileEntry);
    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('false'));

    api.updateData({ a: 5 });
    await waitFor(() => expect(screen.getByTestId('dirty')).toHaveTextContent('true'));

    await api.saveFile();
    await waitFor(() => expect(screen.getByTestId('saveError').textContent).not.toBe(''));
    expect(screen.getByTestId('dirty').textContent).toBe('true');

    await api.saveFile(); // second attempt succeeds
    await waitFor(() => expect(screen.getByTestId('saveError').textContent).toBe(''));
    expect(screen.getByTestId('dirty').textContent).toBe('false');
  });
});

