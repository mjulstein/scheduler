import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayCardContextMenu } from './DayCardContextMenu.tsx';

describe('DayCardContextMenu', () => {
  it('renders basic menu actions', () => {
    const onClose = vi.fn();
    const onDelete = vi.fn();
    render(
      <DayCardContextMenu itemId="test" onClose={onClose} onDelete={onDelete} />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Move to top')).toBeInTheDocument();
    expect(screen.getByText('Move to bottom')).toBeInTheDocument();
    expect(screen.getByText('Move up')).toBeInTheDocument();
    expect(screen.getByText('Move down')).toBeInTheDocument();
    expect(screen.getByText('Copy text')).toBeInTheDocument();
  });

  it('calls delete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDelete = vi.fn();
    render(
      <DayCardContextMenu itemId="abc" onClose={onClose} onDelete={onDelete} />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
