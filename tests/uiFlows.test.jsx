import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppProvider, useApp } from '../src/context/AppContext';

import Toolbar from '../src/components/Toolbar';
import ConfirmDialog from '../src/components/ConfirmDialog';

function UIProbe({ expose }) {
  const api = useApp();
  expose(api);
  return (
    <div>
      <Toolbar />
      <ConfirmDialog prompt={api.confirmPrompt} onRespond={api.respondConfirm} />
    </div>
  );
}

describe('Fieldstone UI flows', () => {
  afterEach(() => cleanup());

  it('clicking Delete with dirty changes cancels when overlay Cancel is pressed', async () => {
    let api;
    const removeEntry = vi.fn(async () => {});

    const dirHandle = {
      name: 'root',
      values: async function* () {
        // No listing needed for this test.
      },
      removeEntry,
    };

    const fileEntry = {
      name: 'a.json',
      handle: {
        getFile: async () => new File([JSON.stringify({ a: 1 })], 'a.json', { type: 'application/json' }),
      },
    };

    render(
      <AppProvider>
        <UIProbe expose={(a) => { api = a; }} />
      </AppProvider>
    );

    await api.loadDirectory(dirHandle);
    await api.openFile(fileEntry);
    api.updateData({ a: 2 });

    const getEnabledDeleteButton = () => {
      const all = screen.getAllByRole('button', { name: /delete/i });
      return all.find((b) => !b.disabled);
    };

    const deleteBtn = await waitFor(() => {
      const btn = getEnabledDeleteButton();
      if (!btn) throw new Error('Delete button not enabled yet');
      return btn;
    });

    // Open delete confirm in toolbar.
    fireEvent.click(deleteBtn);
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /^cancel$/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(removeEntry).not.toHaveBeenCalled();
  });

  it('Delete confirms and clears active file when overlay Discard/Confirm is pressed', async () => {
    let api;
    const removeEntry = vi.fn(async () => {});

    const dirHandle = {
      name: 'root',
      values: async function* () {},
      removeEntry,
    };

    const fileEntry = {
      name: 'a.json',
      handle: {
        getFile: async () => new File([JSON.stringify({ a: 1 })], 'a.json', { type: 'application/json' }),
      },
    };

    render(
      <AppProvider>
        <UIProbe expose={(a) => { api = a; }} />
      </AppProvider>
    );

    await api.loadDirectory(dirHandle);
    await api.openFile(fileEntry);
    api.updateData({ a: 2 });

    const getEnabledDeleteButton = () => {
      const all = screen.getAllByRole('button', { name: /delete/i });
      return all.find((b) => !b.disabled);
    };

    const deleteBtn = await waitFor(() => {
      const btn = getEnabledDeleteButton();
      if (!btn) throw new Error('Delete button not enabled yet');
      return btn;
    });

    fireEvent.click(deleteBtn);
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: /discard/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(removeEntry).toHaveBeenCalledTimes(1);
  });

  it('save retry: Save failure keeps dirty and Retry Save clears it on next success', async () => {
    let api;
    let createCalls = 0;

    const writableMock = {
      write: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    };

    const fileEntry = {
      name: 't.json',
      handle: {
        getFile: async () => new File([JSON.stringify({ a: 1 })], 't.json', { type: 'application/json' }),
        createWritable: async () => {
          createCalls += 1;
          if (createCalls === 1) throw new Error('disk full');
          return writableMock;
        },
      },
    };

    const dirHandle = {
      name: 'root',
      values: async function* () {},
      removeEntry: vi.fn(async () => {}),
    };

    render(
      <AppProvider>
        <UIProbe expose={(a) => { api = a; }} />
      </AppProvider>
    );

    await api.loadDirectory(dirHandle);
    await api.openFile(fileEntry);
    api.updateData({ a: 5 });

    const saveBtn = await waitFor(() => {
      const btn = screen.getByRole('button', { name: /save changes/i });
      if (btn.disabled) throw new Error('Save button disabled');
      return btn;
    });

    fireEvent.click(saveBtn);
    await waitFor(() => expect(screen.getByRole('button', { name: /retry save/i })).toBeInTheDocument());
    const saveBtnAfterFailure = screen.getByRole('button', { name: /save changes/i });
    expect(saveBtnAfterFailure).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /retry save/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /retry save/i })).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled());
  });
});

