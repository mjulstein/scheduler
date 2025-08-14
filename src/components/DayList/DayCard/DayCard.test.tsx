import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DayCard } from './DayCard.tsx';
import type { DayData, DayItem } from '../Types.ts';
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
    // DayCard root is an <article> with dayCard and today classes from CSS module
    const container = heading.closest('article');
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
    const candidateButtons = within(firstItem).getAllByRole('button');
    const textButton = candidateButtons.find(
      (el) => !(el as HTMLElement).getAttribute('aria-label')
    ) as HTMLElement;
    await user.click(textButton);

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
    const candidateButtons = within(onlyItem).getAllByRole('button');
    const textButton = candidateButtons.find(
      (el) => !(el as HTMLElement).getAttribute('aria-label')
    ) as HTMLElement;

    const targetIndex = 2; // character 'r' in "First task"
    const charSpan = textButton.querySelector(
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
    const candidateButtons = within(firstItem).getAllByRole('button');
    const textButton = candidateButtons.find(
      (el) => !(el as HTMLElement).getAttribute('aria-label')
    ) as HTMLElement;
    await user.click(textButton);

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
  it('saves the edited input when pressing enter', async () => {
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

    // Enter edit mode
    const list = screen.getByRole('list');
    const firstItem = within(list).getAllByRole('listitem')[0];
    const candidateButtons = within(firstItem).getAllByRole('button');
    const textButton = candidateButtons.find(
      (el) => !(el as HTMLElement).getAttribute('aria-label')
    ) as HTMLElement;
    await user.click(textButton);

    const editInput = screen.getByRole('textbox', { name: `Edit ${text}` });
    await user.type(editInput, ' updated{enter}');

    expect(onSaveItem).toHaveBeenCalledTimes(1);
    expect(onSaveItem).toHaveBeenCalledWith(
      day.date,
      '1',
      'First task updated'
    );
  });
  it('has a thumb on the left side of each item that enables the item to be reordered on the card by tapping and dragging, and a context menu at the end', async () => {
    const day = makeDay({
      items: [
        { id: '1', text: 'First task' },
        { id: '2', text: 'Second task' }
      ]
    });

    const onDeleteItem = vi.fn();

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
        onDeleteItem={onDeleteItem}
      />
    );

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');

    // First item assertions
    const li1 = items[0] as HTMLElement;
    const firstChild1 = li1.firstElementChild as HTMLElement;
    const lastChild1 = li1.lastElementChild as HTMLElement;

    expect(firstChild1).toHaveAccessibleName('Reorder First task');
    expect(firstChild1).toHaveAttribute('draggable', 'true');
    expect(lastChild1).toHaveAccessibleName('More options for First task');

    // Second item assertions
    const li2 = items[1] as HTMLElement;
    const firstChild2 = li2.firstElementChild as HTMLElement;
    const lastChild2 = li2.lastElementChild as HTMLElement;

    expect(firstChild2).toHaveAccessibleName('Reorder Second task');
    expect(firstChild2).toHaveAttribute('draggable', 'true');
    expect(lastChild2).toHaveAccessibleName('More options for Second task');
  });
  it('has context menu at the end of each item', async () => {
    // the context menu is a separate component, but gets the item props and delete function
    // the context menu should be defined as a separate component, DayCardContextMenu.tsx
    // where one option is to delete it (not tested for here)

    const user = userEvent.setup();
    const day = makeDay({
      items: [
        { id: '1', text: 'First task' },
        { id: '2', text: 'Second task' }
      ]
    });
    const onDeleteItem = vi.fn();

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
        onDeleteItem={onDeleteItem}
      />
    );

    const firstContextButton = screen.getByRole('button', {
      name: 'More options for First task'
    });

    // Open the context menu popover
    await user.click(firstContextButton);

    // Click the Delete action inside the popover
    const deleteAction = await screen.findByRole('button', { name: 'Delete' });
    await user.click(deleteAction);

    expect(onDeleteItem).toHaveBeenCalledTimes(1);
    expect(onDeleteItem).toHaveBeenCalledWith(day.date, '1');
  });
  it('shows a disabled context menu button at the end even when no delete handler is provided', () => {
    const day = makeDay({
      items: [
        { id: '1', text: 'First task' },
        { id: '2', text: 'Second task' }
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
    const items = within(list).getAllByRole('listitem');

    const lastChild1 = items[0].lastElementChild as HTMLElement;
    const lastChild2 = items[1].lastElementChild as HTMLElement;

    expect(lastChild1).toHaveAccessibleName('More options for First task');
    expect(lastChild1).toBeDisabled();
    expect(lastChild2).toHaveAccessibleName('More options for Second task');
    expect(lastChild2).toBeDisabled();
  });
  it('reorders items via drag-and-drop using the left thumb', () => {
    const day = makeDay({
      items: [
        { id: '1', text: 'First' },
        { id: '2', text: 'Second' },
        { id: '3', text: 'Third' }
      ]
    });
    const onReorderItems = vi.fn();

    render(
      <DayCard
        day={day}
        newItemText=""
        onInputChange={vi.fn()}
        onAddItem={vi.fn()}
        onReorderItems={onReorderItems}
      />
    );

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');

    // Drag the first item handle and drop onto the third item (moving it after second)
    const firstHandle = within(items[0]).getByRole('button', {
      name: 'Reorder First'
    });
    const thirdLi = items[2];

    // Minimal DataTransfer mock (works in jsdom)
    let stored = '';
    const data: DataTransfer = {
      dropEffect: 'move',
      effectAllowed: 'move',
      files: {} as unknown as FileList,
      items: {} as unknown as DataTransferItemList,
      types: [],
      setData: vi.fn((type: string, val: string) => {
        void type;
        stored = val;
      }),
      getData: vi.fn((type: string) => {
        void type;
        return stored;
      }),
      clearData: vi.fn(),
      setDragImage: vi.fn()
    } as unknown as DataTransfer;

    fireEvent.dragStart(firstHandle, { dataTransfer: data });
    fireEvent.dragOver(thirdLi, { dataTransfer: data });
    fireEvent.drop(thirdLi, { dataTransfer: data });

    expect(onReorderItems).toHaveBeenCalledTimes(1);
    const [, newItems] = onReorderItems.mock.calls[0] as [string, DayItem[]];
    expect((newItems as DayItem[]).map((i) => i.id)).toEqual(['2', '1', '3']);
  });
});
