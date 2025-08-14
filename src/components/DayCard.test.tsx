import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DayCard } from './DayCard';
import type { DayData } from '../Types';
import classes from './DayCard.module.css';
import { useState } from 'react';

const makeDay = (overrides: Partial<DayData> = {}): DayData => ({
  date: '2025-01-01',
  dayName: 'Wednesday',
  items: [],
  isToday: false,
  ...overrides
});

// Test helper wrapper to emulate controlled input usage
function DayCardControlled({
  day,
  onInputChange
}: {
  day: DayData;
  onInputChange: (date: string, v: string) => void;
}) {
  const [text, setText] = useState('');
  return (
    <DayCard
      day={day}
      newItemText={text}
      onInputChange={(date, v) => {
        setText(v);
        onInputChange(date, v);
      }}
      onAddItem={vi.fn()}
    />
  );
}

describe('DayCard', () => {
  it('renders the day name and applies today style when isToday=true', () => {
    const day = makeDay({ dayName: 'Monday', isToday: true });
    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
      />
    );

    const heading = screen.getByRole('heading', { name: 'Monday' });
    // parent div should have dayCard and today classes from CSS module
    const container = heading.closest('div');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(classes.dayCard);
    expect(container).toHaveClass(classes.today);
  });

  it('shows an input when there are no items and syncs its value from newItemText', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const day = makeDay({ items: [] });

    render(<DayCardControlled day={day} onInputChange={onInputChange} />);

    const input = screen.getByPlaceholderText(
      'Add new item'
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(classes.inlineInput);

    await user.type(input, 'Task');

    // Controlled: the input should reflect the full typed value
    expect(input).toHaveValue('Task');

    // onInputChange is called for each keystroke; verify last call has the full value
    const lastCall = onInputChange.mock.calls.at(-1);
    expect(lastCall).toEqual([day.date, 'Task']);
  });

  it('calls onAddItem with the day date when pressing Enter', async () => {
    const user = userEvent.setup();
    const onAddItem = vi.fn();
    const onInputChange = vi.fn();
    const day = makeDay({ items: [] });

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={onInputChange}
        onAddItem={onAddItem}
      />
    );

    const input = screen.getByPlaceholderText('Add new item');
    await user.type(input, 'My todo{enter}');

    expect(onAddItem).toHaveBeenCalledTimes(1);
    expect(onAddItem).toHaveBeenCalledWith(day.date);
  });

  it('renders existing items and also renders an input afterwards', async () => {
    const day = makeDay({
      dayName: 'Friday',
      items: [
        { id: '1', text: 'First' },
        { id: '2', text: 'Second' }
      ]
    });

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
      />
    );

    const list = screen.getByRole('list');
    const { getAllByRole, getAllByPlaceholderText } = within(list);

    const items = getAllByRole('listitem');
    // There will be 2 items + 1 input list item at the end
    expect(items.length).toBe(3);

    // The input is present after items
    const inputs = getAllByPlaceholderText('Add new item');
    expect(inputs.length).toBe(1);
  });

  it('changes the saved item into an editable item input when clicked and the cursor is on the expected character', async () => {
    const user = userEvent.setup();
    const text = 'First task';
    const day = makeDay({
      items: [
        { id: '1', text },
        { id: '2', text: 'Second' }
      ]
    });

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
      />
    );

    // Click on the first item (button container) to enter edit mode
    const list = screen.getByRole('list');
    const firstItem = within(list).getAllByRole('listitem')[0];
    const button = within(firstItem).getByRole('button');
    await user.click(button);

    // An input should appear for that item, pre-filled and focused
    const editInput = screen.getByRole('textbox', {
      name: `Edit ${text}`
    }) as HTMLInputElement;
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveValue(text);
    expect(document.activeElement).toBe(editInput);

    // Caret should be at the end of the text
    expect(editInput.selectionStart).toBe(text.length);
    expect(editInput.selectionEnd).toBe(text.length);
  });

  it('positions the caret where the user clicked inside the item text', async () => {
    const user = userEvent.setup();
    const text = 'First task';
    const day = makeDay({
      items: [{ id: '1', text }]
    });

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
      />
    );

    // Locate the single list item and its button container
    const list = screen.getByRole('list');
    const onlyItem = within(list).getAllByRole('listitem')[0];
    const button = within(onlyItem).getByRole('button');

    const targetIndex = 2; // character 'r' in "First task"
    const charSpan = button.querySelector(
      `span[data-index="${targetIndex}"]`
    ) as HTMLElement;
    await user.click(charSpan);

    const editInput = screen.getByRole('textbox', {
      name: `Edit ${text}`
    }) as HTMLInputElement;
    expect(editInput).toBeInTheDocument();
    expect(editInput.selectionStart).toBe(targetIndex);
    expect(editInput.selectionEnd).toBe(targetIndex);
  });

  it('saves the item when the edit input loses focus', async () => {
    const user = userEvent.setup();
    const text = 'First task';
    const day = makeDay({ items: [{ id: '1', text }] });
    const onSaveItem = vi.fn();

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
        onSaveItem={onSaveItem}
      />
    );

    // Enter edit mode by clicking the first item's button container
    const list = screen.getByRole('list');
    const firstItem = within(list).getAllByRole('listitem')[0];
    const button = within(firstItem).getByRole('button');
    await user.click(button);

    const editInput = screen.getByRole('textbox', {
      name: `Edit ${text}`
    }) as HTMLInputElement;

    // Type a suffix and then blur (simulate clicking outside)
    await user.type(editInput, ' updated');
    expect(editInput).toHaveValue('First task updated');

    // Move focus away to trigger onBlur
    await user.tab();

    expect(onSaveItem).toHaveBeenCalledTimes(1);
    expect(onSaveItem).toHaveBeenCalledWith(
      day.date,
      '1',
      'First task updated'
    );
  });
});
