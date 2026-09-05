import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { AppProvider } from '../src/context/AppContext';
import NodeEditor from '../src/components/JSONEditor/NodeEditor';

function NestedHarness({ initial }) {
  const [value, setValue] = useState(initial);
  return (
    <AppProvider>
      <div data-testid="editor-root">
        <NodeEditor value={value} onChange={setValue} depth={0} />
      </div>
    </AppProvider>
  );
}

describe('Nested structure editing', () => {
  afterEach(() => cleanup());

  it('Add Item clones nested Groups (time.*) instead of flattening to text', async () => {
    render(
      <NestedHarness
        initial={[
          {
            title: 'School',
            time: { startDate: '2007', endDate: '2019', duration: '12 years' },
          },
        ]}
      />
    );

    const root = screen.getByTestId('editor-root');
    // Only one list in this fixture — Add Item is the root list control.
    fireEvent.click(within(root).getByRole('button', { name: /^add item$/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Time').length).toBeGreaterThanOrEqual(2);
    });

    expect(screen.getAllByText('Start Date').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('End Date').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Duration').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Group').length).toBeGreaterThanOrEqual(2);
  });

  it('empty list Add Item opens type picker and can add a Group with Add Field', () => {
    render(<NestedHarness initial={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /^add item$/i }));
    expect(screen.getByText(/new item type/i)).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByText(/new item type/i).parentElement).getByRole('button', { name: /^add item$/i })
    );

    expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument();
  });
});
