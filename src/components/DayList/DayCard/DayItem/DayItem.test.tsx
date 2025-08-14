import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayItem } from './DayItem.tsx';

describe('DayItem', () => {
  it('enters edit mode when text is clicked and caret goes to end by default', async () => {
    const user = userEvent.setup();
    render(<DayItem id="1" text="First task" />);

    // The text is rendered as a button-like span; click to enter edit mode
    const container = screen
      .getAllByRole('button')
      .find(
        (el) => !(el as HTMLElement).getAttribute('aria-label')
      ) as HTMLElement;
    await user.click(container);

    const editInput = screen.getByRole('textbox', {
      name: 'Edit First task'
    }) as HTMLInputElement;
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveValue('First task');
    expect(document.activeElement).toBe(editInput);
    expect(editInput.selectionStart).toBe('First task'.length);
    expect(editInput).toHaveProperty('selectionEnd', 'First task'.length);
  });

  it('positions the caret where the user clicked inside the item text', async () => {
    const user = userEvent.setup();
    const text = 'First task';
    render(<DayItem id="1" text={text} />);

    const container = screen
      .getAllByRole('button')
      .find(
        (el) => !(el as HTMLElement).getAttribute('aria-label')
      ) as HTMLElement;
    const charSpan = within(container).getByText('r'); // index 2
    await user.click(charSpan);

    const editInput = screen.getByRole('textbox', {
      name: `Edit ${text}`
    }) as HTMLInputElement;
    expect(editInput).toBeInTheDocument();
    expect(editInput.selectionStart).toBe(2);
    expect(editInput.selectionEnd).toBe(2);
  });

  it('saves the item when the edit input loses focus', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<DayItem id="1" text="First task" onSave={onSave} />);

    const container = screen
      .getAllByRole('button')
      .find(
        (el) => !(el as HTMLElement).getAttribute('aria-label')
      ) as HTMLElement;
    await user.click(container);

    const editInput = screen.getByRole('textbox', { name: 'Edit First task' });
    await user.type(editInput, ' updated');

    await user.tab();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('1', 'First task updated');
  });

  it('saves the edited input when pressing enter', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<DayItem id="1" text="First task" onSave={onSave} />);

    const container = screen
      .getAllByRole('button')
      .find(
        (el) => !(el as HTMLElement).getAttribute('aria-label')
      ) as HTMLElement;
    await user.click(container);

    const editInput = screen.getByRole('textbox', { name: 'Edit First task' });
    await user.type(editInput, ' updated{enter}');

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('1', 'First task updated');
  });

  it('has a context menu button', () => {
    render(<DayItem id="1" text="First task" />);

    const contextBtn = screen.getByRole('button', {
      name: 'More options for First task'
    });

    expect(contextBtn).toHaveAccessibleName('More options for First task');
  });

  it('opens the context menu and calls delete when clicking Delete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DayItem id="1" text="First task" onDelete={onDelete} />);

    const contextBtn = screen.getByRole('button', {
      name: 'More options for First task'
    });
    await user.click(contextBtn);

    const deleteAction = await screen.findByRole('button', { name: 'Delete' });
    await user.click(deleteAction);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('shows a disabled context menu button when no delete handler is provided', () => {
    render(<DayItem id="1" text="First task" />);

    const contextBtn = screen.getByRole('button', {
      name: 'More options for First task'
    });
    expect(contextBtn).toBeDisabled();
  });
});
